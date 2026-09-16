
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronLeft, Sparkles, X } from "lucide-react";
import type { QuizScores } from "./Quiz";
import { CAREER_SCORE_KEYS, SHORTFORM_V2_QUESTIONS, type CareerKey, type ShortformV2Answer } from "@/data/shortformV2Questions";
import { trackKyrEvent } from "@/lib/analytics";
import { calibrateShortformV2Scores } from "@/lib/results/calibrateShortformV2Scores";
import { recomputeShortformV2ScoreMaps, validateShortformV2Responses } from "@/lib/quiz/shortformV2Scoring";

type TierValue = "13-18" | "19-25" | "25+" | "25plus" | "7-12";

interface ShortformV2QuizProps {
  tier: TierValue;
  mood: string;
  funMode: boolean;
  landmark?: string;
  theme: string;
  onComplete: (scores: QuizScores) => void;
  onExit: () => void;
  onQuizStarted?: () => void;
}

const INITIAL_CAREER = CAREER_SCORE_KEYS.reduce((acc, key) => {
  acc[key] = 0;
  return acc;
}, {} as Record<CareerKey, number>);

const INITIAL_SCORES: QuizScores = {
  mbti: { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 },
  disc: { D: 0, I: 0, S: 0, C: 0 },
  bigFive: { O: 0, C: 0, E: 0, A: 0, N: 0 },
  career: INITIAL_CAREER,
  responses: [],
  swipeTimes: [],
  averageSwipeTime: 0,
  currentDifficulty: "medium",
  engagement: 0,
  wildcardBoost: false,
  criticalWildcard: 0,
  firstPrinciplesWildcard: 0,
  hybridTypes: [],
};

const GROUP_ACCENTS: Record<string, string> = {
  "Core operating style": "from-cyan-300 via-blue-400 to-violet-400",
  "Big Five backbone": "from-emerald-300 via-teal-300 to-cyan-300",
  "DISC work behavior": "from-amber-200 via-orange-300 to-rose-300",
  "Career-fit vector": "from-fuchsia-300 via-violet-300 to-cyan-300",
  Calibration: "from-white via-cyan-100 to-amber-100",
};

type TimelineSection = {
  group: string;
  label: string;
  startIndex: number;
  length: number;
  color: string;
  glow: string;
  gradient: string;
};

const GROUP_TIMELINE_META: Record<string, Pick<TimelineSection, "label" | "color" | "glow" | "gradient">> = {
  "Core operating style": {
    label: "Foundations",
    color: "#67e8f9",
    glow: "rgba(103,232,249,0.72)",
    gradient: "linear-gradient(90deg, #67e8f9, #60a5fa, #a78bfa)",
  },
  "Big Five backbone": {
    label: "Work patterns",
    color: "#5eead4",
    glow: "rgba(94,234,212,0.68)",
    gradient: "linear-gradient(90deg, #6ee7b7, #5eead4, #67e8f9)",
  },
  "DISC work behavior": {
    label: "Team rhythms",
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.65)",
    gradient: "linear-gradient(90deg, #fde68a, #fb923c, #fb7185)",
  },
  "Career-fit vector": {
    label: "Work preferences",
    color: "#f0abfc",
    glow: "rgba(240,171,252,0.66)",
    gradient: "linear-gradient(90deg, #f0abfc, #a78bfa, #67e8f9)",
  },
  Calibration: {
    label: "Final reflections",
    color: "#fff7ed",
    glow: "rgba(255,247,237,0.55)",
    gradient: "linear-gradient(90deg, #ffffff, #cffafe, #fde68a)",
  },
};

const QUIZ_TIMELINE_SECTIONS = SHORTFORM_V2_QUESTIONS.reduce<TimelineSection[]>((sections, question, index) => {
  const previous = sections[sections.length - 1];
  if (previous?.group === question.group) {
    previous.length += 1;
    return sections;
  }

  const meta = GROUP_TIMELINE_META[question.group] ?? GROUP_TIMELINE_META.Calibration;
  sections.push({
    group: question.group,
    label: meta.label,
    startIndex: index,
    length: 1,
    color: meta.color,
    glow: meta.glow,
    gradient: meta.gradient,
  });
  return sections;
}, []);

function addWeights(scores: QuizScores, answer: ShortformV2Answer): QuizScores {
  const next: QuizScores = {
    ...scores,
    mbti: { ...scores.mbti },
    disc: { ...scores.disc },
    bigFive: { ...scores.bigFive },
    career: { ...INITIAL_CAREER, ...(scores.career as Record<CareerKey, number> | undefined) },
    responses: [...scores.responses],
    swipeTimes: [...scores.swipeTimes],
    hybridTypes: [...scores.hybridTypes],
  };

  Object.entries(answer.scores.mbti ?? {}).forEach(([key, value]) => {
    if (typeof value === "number" && key in next.mbti) next.mbti[key as keyof typeof next.mbti] += value;
  });
  Object.entries(answer.scores.disc ?? {}).forEach(([key, value]) => {
    if (typeof value === "number" && key in next.disc) next.disc[key as keyof typeof next.disc] += value;
  });
  Object.entries(answer.scores.bigFive ?? {}).forEach(([key, value]) => {
    if (typeof value === "number" && key in next.bigFive) next.bigFive[key as keyof typeof next.bigFive] += value;
  });
  const nextCareer = next.career as Record<CareerKey, number>;
  Object.entries(answer.scores.career ?? {}).forEach(([key, value]) => {
    if (typeof value === "number") nextCareer[key as CareerKey] = (nextCareer[key as CareerKey] ?? 0) + value;
  });

  return next;
}

function calculateDifficulty(times: number[], average: number): "easy" | "medium" | "hard" {
  if (times.length < 3) return "medium";
  if (average < 2) return "hard";
  if (average < 5) return "medium";
  return "easy";
}

function rebuildScoresFromResponses(responses: QuizScores["responses"]): QuizScores {
  let rebuilt: QuizScores = {
    ...INITIAL_SCORES,
    mbti: { ...INITIAL_SCORES.mbti },
    disc: { ...INITIAL_SCORES.disc },
    bigFive: { ...INITIAL_SCORES.bigFive },
    career: { ...INITIAL_CAREER },
    responses: [],
    swipeTimes: [],
    hybridTypes: [],
  };

  for (const response of responses) {
    const question = SHORTFORM_V2_QUESTIONS.find((item) => item.id === response.questionId);
    const answer = question?.answers[response.choice];
    if (!question || !answer) continue;
    rebuilt = addWeights(rebuilt, answer);
    rebuilt = {
      ...rebuilt,
      responses: [...rebuilt.responses, response],
      swipeTimes: [...rebuilt.swipeTimes, response.timeSpent ?? 0],
    };
  }

  const averageSwipeTime = rebuilt.swipeTimes.length
    ? rebuilt.swipeTimes.reduce((sum, value) => sum + value, 0) / rebuilt.swipeTimes.length
    : 0;

  return {
    ...rebuilt,
    averageSwipeTime,
    currentDifficulty: calculateDifficulty(rebuilt.swipeTimes, averageSwipeTime),
    engagement: rebuilt.responses.length,
  };
}

export default function ShortformV2Quiz({ tier, mood, funMode, theme, onComplete, onExit, onQuizStarted }: ShortformV2QuizProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<QuizScores>(INITIAL_SCORES);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);

  const currentQuestion = SHORTFORM_V2_QUESTIONS[currentIndex];
  const totalQuestions = SHORTFORM_V2_QUESTIONS.length;
  const progress = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const accent = GROUP_ACCENTS[currentQuestion.group] ?? GROUP_ACCENTS.Calibration;
  const answeredCount = scores.responses.length;
  const timelinePosition = currentIndex + 1;
  const userFacingSection = QUIZ_TIMELINE_SECTIONS.find((section) => section.group === currentQuestion.group)?.label ?? "Question";

  useEffect(() => {
    if (!hasStarted) return;
    const focusTimer = window.setTimeout(() => questionHeadingRef.current?.focus(), 320);
    return () => window.clearTimeout(focusTimer);
  }, [currentIndex, hasStarted]);

  const handleStart = () => {
    setStartedAt(Date.now());
    setHasStarted(true);
    onQuizStarted?.();
    trackKyrEvent("quiz_started", { source: "shortform_v2", tier, total_questions: totalQuestions });
  };

  const handleAnswer = (answer: ShortformV2Answer, optionIndex: number) => {
    if (selectedAnswer) return;
    const timeSpent = Math.max(0.1, (Date.now() - startedAt) / 1000);
    setSelectedAnswer(answer.id);

    const nextScores = addWeights(scores, answer);
    const updatedSwipeTimes = [...scores.swipeTimes, timeSpent];
    const averageSwipeTime = updatedSwipeTimes.reduce((sum, value) => sum + value, 0) / updatedSwipeTimes.length;
    const updatedScores: QuizScores = {
      ...nextScores,
      responses: [
        ...nextScores.responses,
        {
          questionId: currentQuestion.id,
          choice: optionIndex as 0 | 1 | 2 | 3,
          timeSpent,
          swipeDirection: optionIndex < 2 ? "left" : "right",
          responseType: "multiChoice",
          psych: currentQuestion.group,
          selectedOptionMeta: answer.resultSignal,
          selectedOptionLabel: answer.text,
          answerId: answer.id,
        },
      ],
      swipeTimes: updatedSwipeTimes,
      averageSwipeTime,
      currentDifficulty: calculateDifficulty(updatedSwipeTimes, averageSwipeTime),
      engagement: nextScores.engagement + 1,
      wildcardBoost: false,
      criticalWildcard: nextScores.mbti.T >= nextScores.mbti.F && nextScores.bigFive.O > 0 ? 1 : 0,
      firstPrinciplesWildcard: nextScores.mbti.N >= nextScores.mbti.S && nextScores.bigFive.O > 0 ? 1 : 0,
      quizVersion: "shortform-v2-fixed-28",
      questionDatabase: "shortformV2Questions.ts",
      deterministicResult: true,
      moodContext: { mood, theme, funMode },
    };

    setScores(updatedScores);

    trackKyrEvent("quiz_answer_selected", {
      source: "shortform_v2",
      tier,
      question_id: currentQuestion.id,
      answer_id: answer.id,
      group: currentQuestion.group,
      progress,
    });

    window.setTimeout(() => {
      if (currentIndex >= totalQuestions - 1) {
        trackKyrEvent("quiz_completed", {
          source: "shortform_v2",
          tier,
          total_questions: totalQuestions,
          average_response_time: Math.round(averageSwipeTime * 10) / 10,
        });
        const authoritativeResponses = validateShortformV2Responses(updatedScores.responses);
        const authoritativeScoreMaps = recomputeShortformV2ScoreMaps(authoritativeResponses);
        const authoritativeScores = calibrateShortformV2Scores({
          ...updatedScores,
          ...authoritativeScoreMaps,
        });
        onComplete(authoritativeScores);
        return;
      }
      setCurrentIndex((index) => index + 1);
      setSelectedAnswer(null);
      setStartedAt(Date.now());
    }, 360);
  };

  const goBack = () => {
    if (currentIndex === 0 || answeredCount === 0 || selectedAnswer) return;
    const responseBeingRevisited = scores.responses[scores.responses.length - 1];
    const retainedResponses = scores.responses.slice(0, -1);
    setScores(rebuildScoresFromResponses(retainedResponses));
    setCurrentIndex((index) => Math.max(0, index - 1));
    setSelectedAnswer(null);
    setStartedAt(Date.now());
    trackKyrEvent("quiz_answer_reviewed", {
      source: "shortform_v2",
      tier,
      question_id: responseBeingRevisited?.questionId ?? null,
      remaining_answers: retainedResponses.length,
    });
  };

  if (!hasStarted) {
    return (
      <div className="relative flex min-h-[100dvh] items-center overflow-hidden bg-[#050510] px-4 py-8 text-white sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_16%,rgba(34,211,238,0.18),transparent_31%),radial-gradient(circle_at_82%_72%,rgba(168,85,247,0.18),transparent_35%)]" />
        <section aria-labelledby="shortform-welcome-heading" className="relative mx-auto w-full max-w-2xl rounded-[30px] border border-white/15 bg-[#0b1222]/92 p-5 shadow-[0_28px_92px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:rounded-[38px] sm:p-9">
          <p className="quiz-welcome-kicker text-[11px] font-black uppercase tracking-[0.28em] text-cyan-200">KnowYourRole · work-style exploration</p>
          <h2 id="shortform-welcome-heading" className="mt-4 max-w-xl text-3xl font-black tracking-[-0.055em] text-white sm:text-5xl">28 grounded questions. One practical starting point.</h2>
          <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-white/72 sm:text-base sm:leading-7">Answer for your usual work pattern—not your ideal day or the answer that sounds impressive. There are no right answers.</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2" aria-label="What to expect">
            <li className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm leading-6 text-white/75"><strong className="block text-white">A calm, fixed flow</strong> One question at a time, with back navigation if you want to change an answer.</li>
            <li className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm leading-6 text-white/75"><strong className="block text-white">A practical result</strong> A work-style snapshot, communication clues, pressure patterns, and exploratory role directions.</li>
          </ul>
          <p className="mt-5 text-sm leading-6 text-white/58">Your responses are interpreted as work-style and career-exploration signals—not a diagnosis, hiring screen, or career prescription.</p>
          <button type="button" onClick={handleStart} className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-200 via-sky-300 to-violet-300 px-5 py-3 text-sm font-black text-[#06101f] shadow-[0_16px_42px_rgba(34,211,238,0.25)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-cyan-200 sm:w-auto">Start the 28 questions</button>
        </section>
      </div>
    );
  }

  return (
    <div className="shortform-v2-motion relative min-h-[100dvh] overflow-hidden bg-[#050510] text-white">
      <style>{`
        .shortform-v2-layout { grid-template-columns: 1fr; }
        .shortform-v2-timeline-grid {
          grid-template-columns: 8fr 8fr 5fr 5fr 2fr;
        }
        .shortform-v2-question-title {
          max-width: 18ch;
          font-size: clamp(1.36rem, 7vw, 1.75rem);
          line-height: 1;
          letter-spacing: -0.052em;
        }
        .shortform-v2-answer-grid { grid-template-columns: 1fr; }
        .shortform-v2-answer-button { min-height: 74px; }
        @media (prefers-reduced-motion: reduce) {
          .shortform-v2-motion * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
        }
        @media (max-height: 740px) and (max-width: 640px) {
          .shortform-v2-question-title { font-size: 1.27rem; }
          .shortform-v2-answer-button { min-height: 68px; }
        }
        @media (min-width: 640px) {
          .shortform-v2-question-title { font-size: 2.22rem; }
          .shortform-v2-answer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .shortform-v2-answer-button { min-height: 170px; }
        }
        @media (min-width: 1024px) {
          .shortform-v2-layout { grid-template-columns: minmax(0, 43fr) minmax(0, 57fr); }
          .shortform-v2-question-title { font-size: 2.72rem; }
        }
        @media (min-width: 1280px) {
          .shortform-v2-question-title { font-size: 2.9rem; }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_84%_18%,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_54%_86%,rgba(59,130,246,0.10),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="pointer-events-none fixed inset-x-0 top-0 z-50" aria-hidden="true">
        <div className="shortform-v2-timeline-grid grid h-1.5 gap-0.5 bg-white/[0.035]">
          {QUIZ_TIMELINE_SECTIONS.map((section) => {
            const completedInSection = Math.min(Math.max(timelinePosition - section.startIndex, 0), section.length);
            const fillWidth = `${(completedInSection / section.length) * 100}%`;
            const isActive = currentQuestion.group === section.group;
            const isStarted = completedInSection > 0;

            return (
              <div key={section.group} className="relative overflow-hidden bg-white/[0.095]">
                <motion.div
                  className="absolute inset-y-0 left-0"
                  initial={false}
                  animate={{ width: fillWidth }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  style={{
                    background: section.gradient,
                    boxShadow: isStarted ? `0 0 18px ${section.glow}` : undefined,
                    opacity: isStarted ? 1 : 0,
                  }}
                />
                {isActive && <span className="absolute inset-y-0 right-0 w-px bg-white/70 shadow-[0_0_16px_rgba(255,255,255,0.7)]" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed left-3 right-3 top-3 z-40 flex items-center justify-between pointer-events-none sm:left-4 sm:right-4 sm:top-4">
        <button onClick={onExit} className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#0b1020]/80 text-white/70 shadow-[0_18px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:bg-white/[0.1] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 sm:h-10 sm:w-10" aria-label="Exit quiz">
          <X className="h-4 w-4" />
        </button>
        <button onClick={goBack} disabled={currentIndex === 0 || Boolean(selectedAnswer)} className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#0b1020]/80 text-white/70 shadow-[0_18px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl transition enabled:hover:bg-white/[0.1] enabled:hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:opacity-30 sm:h-10 sm:w-10" aria-label="Go back and change the previous answer" title="Go back and change the previous answer">
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-start px-3 pb-[calc(28px+env(safe-area-inset-bottom))] pt-14 sm:items-center sm:px-5 sm:py-5 lg:px-6">
        <AnimatePresence mode="wait">
          <motion.section
            key={currentQuestion.id}
            initial={false}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="shortform-v2-layout grid w-full gap-2.5 lg:items-stretch xl:gap-4"
          >
            <section className="relative min-h-[214px] overflow-hidden rounded-[24px] border border-cyan-100/10 bg-[#070c18]/92 p-3.5 shadow-[0_24px_78px_rgba(0,0,0,0.46)] ring-1 ring-white/[0.04] backdrop-blur-2xl sm:min-h-[360px] sm:rounded-[28px] sm:p-5 lg:min-h-[430px] lg:p-6 xl:min-h-[470px]">
              <div className="absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),transparent)] sm:h-24" />
              <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.09)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.09)_1px,transparent_1px)] [background-size:34px_34px]" />

              <div className="relative z-10 flex h-full min-h-[186px] flex-col pt-1 sm:min-h-[320px] lg:min-h-[378px] xl:min-h-[418px]">
                <div className={`mb-3 inline-flex h-7 max-w-full items-center gap-2 self-start rounded-full bg-gradient-to-r ${accent} px-3 text-[8.5px] font-black uppercase tracking-[0.16em] text-[#050510] shadow-[0_0_38px_rgba(34,211,238,0.18)] sm:mb-7 sm:h-9 sm:px-4 sm:text-[10px]`}>
                  <Sparkles className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                  <span className="truncate">{userFacingSection}</span>
                </div>

                <div className="mt-auto pb-0.5">
                  <p className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/76 sm:mb-3 sm:text-[11px]" aria-live="polite" aria-atomic="true">Question {timelinePosition} of {totalQuestions}</p>
                  <div className="sr-only" role="progressbar" aria-label="Quiz progress" aria-valuemin={1} aria-valuemax={totalQuestions} aria-valuenow={timelinePosition}>Question {timelinePosition} of {totalQuestions}</div>
                  <h1 ref={questionHeadingRef} tabIndex={-1} className="shortform-v2-question-title text-balance font-black text-white drop-shadow-[0_14px_38px_rgba(0,0,0,0.45)] focus:outline-none">
                    {currentQuestion.prompt}
                  </h1>
                  <p className="mt-2 max-w-md text-[0.75rem] font-bold leading-4 text-white/72 sm:mt-4 sm:text-[0.9rem] sm:font-extrabold sm:leading-6">{currentQuestion.guidance}</p>
                </div>
              </div>
            </section>

            <section className="shortform-v2-answer-grid grid gap-2 lg:gap-3 lg:auto-rows-fr">
              {currentQuestion.answers.map((answer, index) => {
                const isSelected = selectedAnswer === answer.id;
                const isDimmed = Boolean(selectedAnswer && !isSelected);
                return (
                  <motion.button
                    key={answer.id}
                    type="button"
                    onClick={() => handleAnswer(answer, index)}
                    disabled={Boolean(selectedAnswer)}
                    initial={false}
                    animate={{ opacity: isDimmed ? 0.42 : 1, y: 0, scale: isSelected ? 1.025 : 1 }}
                    transition={{ delay: index * 0.045, duration: 0.22 }}
                    whileHover={!selectedAnswer ? { y: -4, scale: 1.012 } : undefined}
                    whileTap={!selectedAnswer ? { scale: 0.98 } : undefined}
                    className={`shortform-v2-answer-button group relative overflow-hidden rounded-[19px] border p-2.5 text-left transition-all duration-300 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 sm:rounded-[22px] sm:p-3.5 lg:min-h-0 lg:p-4 ${isSelected ? "border-[#f3e6cf] bg-[#dccdb3] shadow-[0_0_0_1px_rgba(243,230,207,0.72),0_0_42px_rgba(220,205,179,0.34)]" : "border-white/12 bg-[#0d1324]/94 shadow-[0_18px_54px_rgba(0,0,0,0.30)] hover:border-[#f8f0df] hover:bg-[#e6d8bd] hover:shadow-[0_18px_54px_rgba(230,216,189,0.20)] active:!border-[#f3e6cf] active:!bg-[#dccdb3]"}`}
                    aria-label={`Answer ${answer.id}: ${answer.text}`}
                    aria-pressed={isSelected}
                    data-testid={`button-v2-answer-${answer.id}`}
                  >
                    <div className={`absolute -right-10 -top-12 h-28 w-28 rounded-full bg-gradient-to-br ${accent} opacity-12 blur-2xl transition-opacity group-hover:opacity-24 sm:h-32 sm:w-32`} />
                    <div className="absolute inset-x-5 top-0 h-1 rounded-b-full bg-gradient-to-r from-transparent via-cyan-200/35 to-transparent" />
                    <div className="relative z-10 grid h-full grid-cols-[34px_minmax(0,1fr)] items-center gap-2.5 sm:flex sm:flex-col sm:items-stretch sm:gap-0">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br ${accent} text-[11px] font-black text-[#050510] shadow-[0_12px_30px_rgba(0,0,0,0.35)] sm:mb-4 sm:h-8 sm:w-8 sm:rounded-full sm:text-xs`}>{answer.id}</span>
                      <span className="min-w-0">
                        <h2 className={`text-[0.92rem] font-black leading-[1.16] tracking-[-0.025em] transition-colors sm:max-w-[23ch] sm:text-[1.13rem] lg:text-[1.2rem] ${isSelected ? "text-[#12263a]" : "text-white group-hover:text-[#12263a] group-active:text-[#12263a]"}`}>{answer.text}</h2>
                        <span className={`mt-1 block truncate font-bold uppercase tracking-[0.12em] transition-colors sm:mt-2 sm:tracking-[0.18em] ${isSelected ? "text-[#31485d]" : "text-[#456174] group-hover:text-[#31485d] group-active:text-[#31485d]"}`} style={{ fontSize: "9px" }}>{answer.resultSignal}</span>
                      </span>
                      {isSelected && <span className="absolute right-2 top-2 rounded-full border border-[#f3e6cf] bg-[#c9b68f] px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-[#12263a] sm:text-[9px]">Selected</span>}
                    </div>
                  </motion.button>
                );
              })}
            </section>
          </motion.section>
        </AnimatePresence>
      </main>

    </div>
  );
}
