import { useState, useCallback } from "react";

/**
 * Custom hook for a localStorage-persisted Set.
 * Replicates React state but syncs to localStorage on every update.
 */
export function usePersistedSet(
  key: string,
  defaultValue: Set<string> = new Set()
): [Set<string>, (updater: (prev: Set<string>) => Set<string>) => void] {
  const [value, setValue] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        return new Set(Array.isArray(parsed) ? parsed : []);
      }
    } catch (e) {
      console.warn(`Failed to load ${key} from localStorage`, e);
    }
    return defaultValue;
  });

  const setPersistedValue = useCallback(
    (updater: (prev: Set<string>) => Set<string>) => {
      setValue((prev) => {
        const next = updater(prev);
        try {
          localStorage.setItem(key, JSON.stringify(Array.from(next)));
        } catch (e) {
          console.warn(`Failed to save ${key} to localStorage`, e);
        }
        return next;
      });
    },
    [key]
  );

  return [value, setPersistedValue];
}

/**
 * Custom hook for a localStorage-persisted value of any serializable type.
 */
export function usePersistedState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch (e) {
      console.warn(`Failed to load ${key} from localStorage`, e);
    }
    return defaultValue;
  });

  const setPersistedValue = useCallback(
    (newValue: T) => {
      setValue(newValue);
      try {
        localStorage.setItem(key, JSON.stringify(newValue));
      } catch (e) {
        console.warn(`Failed to save ${key} to localStorage`, e);
      }
    },
    [key]
  );

  return [value, setPersistedValue];
}
