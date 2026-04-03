import type { PersonalityResult, AdventureArchetype, JobMatch, ResultsProps, EarnedBadge } from "./resultsData";
import type { BlendInfo } from "../MoodAlchemyLab";
import type { LocaleInsight } from "@/data/localeInsights";

export interface ResultsState {
  result: PersonalityResult;
  scores: ResultsProps["scores"];
  tier: string;
  mood: string;
  funMode: boolean;
  landmark?: string;
  theme: string;
  sessionId?: string | null;
  apiScales?: any;
  earnedBadges: EarnedBadge[];
  hybridTypes: string[];

  isMiniExplorer: boolean;
  adventureArchetype: AdventureArchetype | null;
  topJobMatch: JobMatch | null;
  jobMatches: JobMatch[];
  jobMatchLoading: boolean;

  isPremiumUnlocked: boolean;
  setIsPremiumUnlocked: (v: boolean) => void;
  isFull: boolean;
  shouldReduceMotion: boolean | null;

  currentResultsPage: 1 | 2 | 3;
  setCurrentResultsPage: (v: 1 | 2 | 3) => void;

  selectedTrait: string | null;
  focusedTraitIndex: number;
  traitButtonsRef: React.MutableRefObject<(HTMLButtonElement | null)[]>;

  cityName: string | null;
  stateName: string | null;
  localeInsight: LocaleInsight | null;

  moodBlendInfo: BlendInfo | null;
  moodBlendKey: string;
  isMasterAlchemist: boolean;
  uniqueBlendsCount: number;

  sortedBigFive: [string, number][];
  topTwoTraits: [string, number][];
  topTrait: [string, number];
  traitKeys: string[];

  isCheckingOut: boolean;
  showUnlockModal: boolean;
  setShowUnlockModal: (v: boolean) => void;

  handleShowFullResults: () => void;
  handleTraitSelect: (trait: string, index: number) => void;
  handleTraitKeyDown: (e: React.KeyboardEvent, trait: string, index: number) => void;
  handleUpgrade: () => void;
  handleCrossroadsClick: () => void;
  handleDonationTierSelect: (amount: number) => void;

  isAuthenticated: boolean;

  onRestart: () => void;
}
