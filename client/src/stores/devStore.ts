import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DevTier = '13-18' | '19-25' | '25plus';
export type DevMood = 'focused' | 'chill' | 'adventurous' | 'romantic' | 'reflective' | 'creative';
export type DevArchetype = 'The Sage' | 'The Explorer' | 'The Hero' | 'The Rebel' | 'The Lover' | 'The Magician';

interface DevState {
  // Panel visibility
  isOpen: boolean;
  // Global dev overrides
  devMode: boolean;                    // Master dev mode toggle
  fakeDataEnabled: boolean;            // Inject fake quiz data
  skipToResults: boolean;              // Auto-skip quiz to results
  // Quiz config
  tier: DevTier;
  mood: DevMood;
  forcePremium: boolean;               // Bypass paywall
  // Results config
  mbtiOverride: string;                // Force specific MBTI type e.g. "ENTJ"
  archetype: DevArchetype;
  // Navigation
  currentPageOverride: string | null;  // Force redirect to this path
  // Auth mock
  mockAuthEnabled: boolean;           // Auto-login as test user
  mockUserEmail: string;
  // Actions
  toggleOpen: () => void;
  setDevMode: (v: boolean) => void;
  setFakeDataEnabled: (v: boolean) => void;
  setSkipToResults: (v: boolean) => void;
  setTier: (v: DevTier) => void;
  setMood: (v: DevMood) => void;
  setForcePremium: (v: boolean) => void;
  setMbtiOverride: (v: string) => void;
  setArchetype: (v: DevArchetype) => void;
  setCurrentPageOverride: (v: string | null) => void;
  setMockAuthEnabled: (v: boolean) => void;
  setMockUserEmail: (v: string) => void;
  reset: () => void;
}

const defaultState = {
  isOpen: true,
  devMode: true,
  fakeDataEnabled: true,
  skipToResults: false,
  tier: '25plus' as DevTier,
  mood: 'focused' as DevMood,
  forcePremium: true,
  mbtiOverride: '',
  archetype: 'The Sage' as DevArchetype,
  currentPageOverride: null,
  mockAuthEnabled: true,
  mockUserEmail: 'test@knowyourrole.app',
};

export const useDevStore = create<DevState>()(
  persist(
    (set) => ({
      ...defaultState,

      toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),
      setDevMode: (v) => set({ devMode: v }),
      setFakeDataEnabled: (v) => set({ fakeDataEnabled: v }),
      setSkipToResults: (v) => set({ skipToResults: v }),
      setTier: (v) => set({ tier: v }),
      setMood: (v) => set({ mood: v }),
      setForcePremium: (v) => set({ forcePremium: v }),
      setMbtiOverride: (v) => set({ mbtiOverride: v }),
      setArchetype: (v) => set({ archetype: v }),
      setCurrentPageOverride: (v) => set({ currentPageOverride: v }),
      setMockAuthEnabled: (v) => set({ mockAuthEnabled: v }),
      setMockUserEmail: (v) => set({ mockUserEmail: v }),
      reset: () => set(defaultState),
    }),
    {
      name: 'kyr-dev-store',
      // Only persist in browser
      partialize: (state) => ({
        isOpen: state.isOpen,
        devMode: state.devMode,
        fakeDataEnabled: state.fakeDataEnabled,
        tier: state.tier,
        mood: state.mood,
        forcePremium: state.forcePremium,
        mbtiOverride: state.mbtiOverride,
        archetype: state.archetype,
        mockAuthEnabled: state.mockAuthEnabled,
        mockUserEmail: state.mockUserEmail,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<DevState> | undefined;
        return {
          ...currentState,
          ...persisted,
          tier: (persisted?.tier as unknown) === '7-12' ? '13-18' : persisted?.tier ?? currentState.tier,
        };
      },
    }
  )
);
