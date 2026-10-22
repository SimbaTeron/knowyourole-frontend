"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRovingRadio } from "@/components/results/useRovingRadio";

export type RatingRadioOption = {
  value: number;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
  testId?: string;
  children: ReactNode;
};

type RatingRadiosProps = {
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  className?: string;
  style?: CSSProperties;
  options: readonly RatingRadioOption[];
  selected: number | null;
  onSelect: (value: number) => void;
};

export function RatingRadios({
  label,
  labelledBy,
  describedBy,
  className,
  style,
  options,
  selected,
  onSelect,
}: RatingRadiosProps) {
  const values = options.map((option) => option.value);
  const radio = useRovingRadio(values, selected, onSelect);

  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={className}
      style={style}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={radio.setRef(index)}
          type="button"
          role="radio"
          aria-checked={selected === option.value}
          aria-label={option.ariaLabel}
          data-testid={option.testId}
          tabIndex={radio.tabIndexFor(index)}
          className={option.className}
          style={option.style}
          onClick={() => onSelect(option.value)}
          onKeyDown={(event) => radio.onKeyDown(event, index)}
        >
          {option.children}
        </button>
      ))}
    </div>
  );
}
