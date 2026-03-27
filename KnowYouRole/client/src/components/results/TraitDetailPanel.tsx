import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, TrendingUp } from "lucide-react";
import {
  TRAIT_LABELS, TRAIT_ICONS, TRAIT_COLORS, TRAIT_QUARTILE_DESCRIPTIONS,
  getQuartileKey, calculatePercentile, getPercentileLabel,
} from "./resultsData";

interface TraitDetailPanelProps {
  traitKeys: string[];
  selectedTrait: string | null;
  focusedTraitIndex: number;
  traitButtonsRef: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  bigFiveProfile: Record<string, number>;
  shouldReduceMotion: boolean | null;
  handleTraitSelect: (trait: string, index: number) => void;
  handleTraitKeyDown: (e: React.KeyboardEvent, trait: string, index: number) => void;
}

export function TraitDetailPanel({
  traitKeys, selectedTrait, focusedTraitIndex, traitButtonsRef,
  bigFiveProfile, shouldReduceMotion, handleTraitSelect, handleTraitKeyDown,
}: TraitDetailPanelProps) {
  return (
    <>
      {traitKeys.map((trait, index) => {
        const Icon = TRAIT_ICONS[trait as keyof typeof TRAIT_ICONS];
        const colors = TRAIT_COLORS[trait as keyof typeof TRAIT_COLORS];
        const isSelected = selectedTrait === trait;
        const value = bigFiveProfile[trait as keyof typeof bigFiveProfile];
        const quartileKey = getQuartileKey(value);
        const quartileData = TRAIT_QUARTILE_DESCRIPTIONS[trait]?.[quartileKey];

        return (
          <div key={trait} className="space-y-2">
            <button
              ref={el => { traitButtonsRef.current[index] = el; }}
              onClick={() => handleTraitSelect(trait, index)}
              onKeyDown={(e) => handleTraitKeyDown(e, trait, index)}
              tabIndex={focusedTraitIndex === -1 ? (index === 0 ? 0 : -1) : (focusedTraitIndex === index ? 0 : -1)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                isSelected
                  ? `${colors.bg} text-white shadow-lg`
                  : `bg-gray-50 dark:bg-[#1E1E2E]/50 hover:bg-gray-100 dark:hover:bg-[#1E1E2E]`
              }`}
              aria-pressed={isSelected}
              aria-expanded={isSelected}
              aria-label={`${TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS]} ${value}%. ${isSelected ? "Selected, tap to collapse" : "Tap to learn more"}`}
              data-testid={`button-trait-${trait.toLowerCase()}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-white/20' : colors.bg}`}>
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-white'}`} aria-hidden="true" />
                </div>
                <div>
                  <span className={`font-semibold ${isSelected ? 'text-white' : 'text-warm-gray dark:text-[#F8FAFC]'}`}>
                    {TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS]}
                  </span>
                  {!isSelected && quartileData && (
                    <p className={`text-xs ${colors.text} opacity-80`}>{quartileData.vibe}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className={`text-lg font-bold ${isSelected ? 'text-white' : colors.text}`}>{value}%</span>
                  {(() => {
                    const percentile = calculatePercentile(value, trait);
                    const pLabel = getPercentileLabel(percentile);
                    return (
                      <p className={`text-[10px] ${isSelected ? 'text-white/80' : pLabel.color}`}>Top {100 - percentile}%</p>
                    );
                  })()}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-180 text-white' : 'text-warm-gray/40 dark:text-[#64748B]'}`} />
              </div>
            </button>

            <AnimatePresence>
              {isSelected && quartileData && (
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className="p-4 rounded-xl bg-gray-50 dark:bg-[#1E1E2E]/50 border-l-4"
                    style={{ borderColor: colors.border }}
                    role="region"
                    aria-live="polite"
                    aria-label={`${TRAIT_LABELS[trait as keyof typeof TRAIT_LABELS]} details`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-sm font-bold ${colors.text}`}>{quartileData.vibe}</span>
                      <span className="text-xs text-warm-gray/50 dark:text-[#64748B]">
                        ({value <= 25 ? '0-25%' : value <= 50 ? '26-50%' : value <= 75 ? '51-75%' : '76-100%'})
                      </span>
                    </div>
                    <p className="text-sm text-warm-gray/80 dark:text-[#94A3B8] leading-relaxed mb-3">{quartileData.description}</p>
                    {(() => {
                      const percentile = calculatePercentile(value, trait);
                      const pLabel = getPercentileLabel(percentile);
                      return (
                        <div className="flex items-center gap-2 pt-2 border-t border-warm-gray/10 dark:border-white/5">
                          <TrendingUp className={`w-3.5 h-3.5 ${pLabel.color}`} />
                          <span className={`text-xs font-medium ${pLabel.color}`}>{pLabel.label} — Top {100 - percentile}% of people</span>
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </>
  );
}
