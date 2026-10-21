"use client";

export function PrintLessonButton() {
  return (
    <button type="button" className="guide-print" onClick={() => window.print()}>
      Print this lesson plan
    </button>
  );
}
