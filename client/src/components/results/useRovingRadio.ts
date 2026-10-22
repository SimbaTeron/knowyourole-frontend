"use client";

import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { nextRadioIndex, radioTabIndex } from "@/components/results/radioGroup";

export function useRovingRadio<T>(values: readonly T[], selected: T | null, onSelect: (value: T) => void) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = selected == null ? -1 : values.indexOf(selected);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = nextRadioIndex(index, values.length, event.key);
    if (next == null) return;
    event.preventDefault();
    const value = values[next];
    if (value !== undefined) onSelect(value);
    refs.current[next]?.focus();
  };

  return {
    setRef: (index: number) => (node: HTMLButtonElement | null) => {
      refs.current[index] = node;
    },
    onKeyDown,
    tabIndexFor: (index: number) => radioTabIndex(index, selectedIndex),
  };
}
