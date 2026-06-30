
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronLeft, Sparkles, X } from "lucide-react";
import type { QuizScores } from "./Quiz";
import { CAREER_SCORE_KEYS, SHORTFORM_V2_QUESTIONS, type CareerKey, type ShortformV2Answer } from "@/data/shortformV2Questions";
import { trackKyrEvent } from "@/lib/analytics";

type TierValue = "13-18" | "19-25" | "25+" | "25plus" | "7-12";

interface ShortformV2QuizProps {
  tier: TierValue;
  mood: string;
  funMode: boolean;
  landmark?: string;
  theme: string;
  onComplete: (scores: QuizScores) => void;
  onExit: () => void;
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
    label: "Core",
    color: "#67e8f9",
    glow: "rgba(103,232,249,0.72)",
    gradient: "linear-gradient(90deg, #67e8f9, #60a5fa, #a78bfa)",
  },
  "Big Five backbone": {
    label: "Big 5",
    color: "#5eead4",
    glow: "rgba(94,234,212,0.68)",
    gradient: "linear-gradient(90deg, #6ee7b7, #5eead4, #67e8f9)",
  },
  "DISC work behavior": {
    label: "DISC",
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.65)",
    gradient: "linear-gradient(90deg, #fde68a, #fb923c, #fb7185)",
  },
  "Career-fit vector": {
    label: "Career",
    color: "#f0abfc",
    glow: "rgba(240,171,252,0.66)",
    gradient: "linear-gradient(90deg, #f0abfc, #a78bfa, #67e8f9)",
  },
  Calibration: {
    label: "Final",
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

export default function ShortformV2Quiz({ tier, mood, funMode, theme, onComplete, onExit }: ShortformV2QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<QuizScores>(INITIAL_SCORES);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [isCompleting, setIsCompleting] = useState(false);

  const currentQuestion = SHORTFORM_V2_QUESTIONS[currentIndex];
  const totalQuestions = SHORTFORM_V2_QUESTIONS.length;
  const progress = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const accent = GROUP_ACCENTS[currentQuestion.group] ?? GROUP_ACCENTS.Calibration;
  const answeredCount = scores.responses.length;
  const timelinePosition = currentIndex + 1;

  const handleAnswer = (answer: ShortformV2Answer, optionIndex: number) => {
    if (selectedAnswer || isCompleting) return;
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
        setIsCompleting(true);
        trackKyrEvent("quiz_completed", {
          source: "shortform_v2",
          tier,
          total_questions: totalQuestions,
          average_response_time: Math.round(averageSwipeTime * 10) / 10,
        });
        window.setTimeout(() => onComplete(updatedScores), 900);
        return;
      }
      setCurrentIndex((index) => index + 1);
      setSelectedAnswer(null);
      setStartedAt(Date.now());
    }, 360);
  };

  const goBack = () => {
    if (currentIndex === 0 || answeredCount === 0 || selectedAnswer || isCompleting) return;
    // Reliable one-step undo would require answer-level inverse weights. For now restart is safer than pretending.
    onExit();
  };

  if (isCompleting) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050510] px-5 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(34,211,238,0.22),transparent_32%),radial-gradient(circle_at_75%_75%,rgba(168,85,247,0.20),transparent_34%)]" />
        <section className="relative w-full max-w-md rounded-[34px] border border-white/15 bg-white/[0.07] p-7 text-center shadow-[0_30px_110px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <motion.div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 via-violet-400 to-amber-200" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
            <Brain className="h-10 w-10 text-[#050510]" />
          </motion.div>
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.32em] text-cyan-200">Pattern locked</p>
          <h1 className="text-3xl font-black tracking-[-0.04em]">Building your result</h1>
          <p className="mx-auto mt-3 max-w-xs text-sm font-semibold leading-6 text-white/65">Scoring your fixed 28 signals against personality, work behavior, and career-fit vectors.</p>
          <div className="mt-7 h-3 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-amber-200" initial={{ width: "12%" }} animate={{ width: "100%" }} transition={{ duration: 1.1, ease: "easeOut" }} />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050510] text-white">
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
        <button onClick={onExit} className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#0b1020]/80 text-white/70 shadow-[0_18px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:bg-white/[0.1] hover:text-white sm:h-10 sm:w-10" aria-label="Exit quiz">
          <X className="h-4 w-4" />
        </button>
        <button onClick={goBack} disabled={currentIndex === 0} className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#0b1020]/80 text-white/70 shadow-[0_18px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl transition enabled:hover:bg-white/[0.1] enabled:hover:text-white disabled:opacity-30 sm:h-10 sm:w-10" aria-label="Go back">
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
                <div className={`mb-3 inline-flex h-7 max-w-full items-center gap-2 self-start rounded-full bg-gradient-to-r ${accent} px-3 text-[8.5px] font-black uppercase tracking-[0.16em] text-[#050510] shadow-[0_0_38px_rgba(34,211,238,0.18)] sm:mb-7 sm:h-9 sm:px-4 sm:text-[10px] lg:mb-8`}>
                  <Sparkles className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                  <span className="truncate">{currentQuestion.group}</span>
                </div>

                <div className="mt-auto pb-0.5">
                  <p className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/76 sm:mb-3 sm:text-[11px]">{currentQuestion.signal}</p>
                  <h1 className="shortform-v2-question-title text-balance font-black text-white drop-shadow-[0_14px_38px_rgba(0,0,0,0.45)]">
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
                    className={`shortform-v2-answer-button group relative overflow-hidden rounded-[19px] border p-2.5 text-left transition-all duration-300 sm:rounded-[22px] sm:p-3.5 lg:min-h-0 lg:p-4 ${isSelected ? "border-cyan-200/95 bg-[#17233a] shadow-[0_0_0_1px_rgba(125,211,252,0.45),0_0_50px_rgba(34,211,238,0.30)]" : "border-white/12 bg-[#0d1324]/94 shadow-[0_18px_54px_rgba(0,0,0,0.30)] hover:border-cyan-200/55 hover:bg-[#131c31]"}`}
                    data-testid={`button-v2-answer-${answer.id}`}
                  >
                    <div className={`absolute -right-10 -top-12 h-28 w-28 rounded-full bg-gradient-to-br ${accent} opacity-12 blur-2xl transition-opacity group-hover:opacity-24 sm:h-32 sm:w-32`} />
                    <div className="absolute inset-x-5 top-0 h-1 rounded-b-full bg-gradient-to-r from-transparent via-cyan-200/35 to-transparent" />
                    <div className="relative z-10 grid h-full grid-cols-[34px_minmax(0,1fr)] items-center gap-2.5 sm:flex sm:flex-col sm:items-stretch sm:gap-0">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br ${accent} text-[11px] font-black text-[#050510] shadow-[0_12px_30px_rgba(0,0,0,0.35)] sm:mb-4 sm:h-8 sm:w-8 sm:rounded-full sm:text-xs`}>{answer.id}</span>
                      <span className="min-w-0">
                        <span className="hidden text-[9px] font-black uppercase tracking-[0.18em] text-white/50 sm:block sm:text-[10px] sm:tracking-[0.2em]">{answer.resultSignal}</span>
                        <h2 className="text-[0.92rem] font-black leading-[1.16] tracking-[-0.025em] text-white sm:mt-2 sm:max-w-[23ch] sm:text-[1.13rem] lg:text-[1.2rem]">{answer.text}</h2>
                        <span className="mt-1 block truncate text-[10px] font-bold uppercase tracking-[0.12em] text-white/45 sm:hidden">{answer.resultSignal}</span>
                      </span>
                      {isSelected && <span className="absolute right-2 top-2 rounded-full bg-cyan-200 px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-[#050510] sm:text-[9px]">Selected</span>}
                      <div className="mt-auto hidden pt-3 sm:block"><div className="h-1.5 w-full rounded-sm bg-black/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" /></div>
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
