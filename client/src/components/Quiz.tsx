"use client";

import ShortformV2Quiz from "./ShortformV2Quiz";

type TierValue = "13-18" | "19-25" | "25+" | "25plus" | "7-12";

interface QuizProps {
  tier: TierValue;
  mood: string;
  funMode: boolean;
  landmark?: string;
  theme: string;
  onComplete: (scores: QuizScores) => void;
  onExit: () => void;
  onQuizStarted?: () => void;
}

export interface QuizScores {
  mbti: {
    E: number; I: number;
    S: number; N: number;
    T: number; F: number;
    J: number; P: number;
  };
  disc: {
    D: number; I: number; S: number; C: number;
  };
  bigFive: {
    O: number; C: number; E: number; A: number; N: number;
  };
  responses: Array<{
    questionId: number;
    choice: 0 | 1 | 2 | 3;
    timeSpent: number;
    swipeDirection: "left" | "right";
    sliderValue?: number; // Phase 1.1: -2 to +2 for slider questions
    responseType?: "binary" | "slider" | "multiChoice";
    psych?: string;
    optionMeta?: [string, string] | string[];
    selectedOptionMeta?: string;
    selectedOptionLabel?: string;
    wildcard?: boolean;
    boostRange?: [number, number];
    is2x?: boolean;
    [key: string]: unknown;
  }>;
  swipeTimes: number[]; // Phase 2.1: Track all swipe times for dynamic difficulty
  averageSwipeTime: number; // Phase 2.1: Running average for difficulty scaling
  currentDifficulty: "easy" | "medium" | "hard"; // Phase 2.1: Current difficulty level
  engagement: number;
  wildcardBoost: boolean;
  criticalWildcard: number;
  firstPrinciplesWildcard: number;
  hybridTypes: string[]; // Phase 1.4: Detected hybrid types like "Ambivert"
  career?: Record<string, number>;
  quizVersion?: string;
  questionDatabase?: string;
  deterministicResult?: boolean;
  moodContext?: unknown;
}

/** Live quiz. /quiz renders ShortformV2Quiz and then hands off to /results. */
export default function Quiz({ tier, mood, funMode, landmark, theme, onComplete, onExit, onQuizStarted }: QuizProps) {
  return (
    <ShortformV2Quiz
      tier={tier}
      mood={mood}
      funMode={funMode}
      landmark={landmark}
      theme={theme}
      onComplete={onComplete}
      onExit={onExit}
      onQuizStarted={onQuizStarted}
    />
  );
}
