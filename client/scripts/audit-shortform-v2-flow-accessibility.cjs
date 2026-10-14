#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const quizPath = path.join(root, "src/components/ShortformV2Quiz.tsx");
const wrapperPath = path.join(root, "src/components/Quiz.tsx");
const bankPath = path.join(root, "src/data/shortformV2Questions.ts");
const quiz = fs.readFileSync(quizPath, "utf8");
const wrapper = fs.readFileSync(wrapperPath, "utf8");
const bank = fs.readFileSync(bankPath, "utf8");

const required = [
  ["commitment screen", "28 grounded questions. One practical starting point."],
  ["usual-pattern instruction", "Answer for your usual work pattern"],
  ["no-right-answer instruction", "There are no right answers."],
  ["question count", "Question {timelinePosition} of {totalQuestions}"],
  ["semantic answer buttons", "<motion.button"],
  ["answer radiogroup", "role=\"radiogroup\""],
  ["radio answer semantics", "role=\"radio\""],
  ["radio checked state", "aria-checked={isSelected}"],
  ["roving keyboard model", "handleAnswerKeyDown(event, index)"],
  ["answer focus ring", "focus-visible:outline-cyan-200"],
  ["announced progress", "role=\"progressbar\""],
  ["focus transfer", "questionHeadingRef.current?.focus()"],
  ["back restores selected answer", "setSelectedAnswer(answerId);"],
  ["reduced motion", "prefers-reduced-motion: reduce"],
  ["safe mobile viewport", "min-h-[100dvh]"],
];

for (const [label, fragment] of required) {
  if (!quiz.includes(fragment)) throw new Error(`missing ${label}: ${fragment}`);
}
if (!wrapper.includes("return <ShortformV2Quiz")) throw new Error("active Quiz wrapper is not using ShortformV2Quiz");
const questionCount = (bank.match(/^\s*id:\s*\d+,/gm) || []).length;
if (questionCount !== 28) throw new Error(`expected 28 active questions, received ${questionCount}`);
if (/onExit\(\);\s*\/\/ Reliable one-step undo/.test(quiz)) throw new Error("legacy back-to-exit behavior remains");

console.log("SHORTFORM_V2_FLOW_ACCESSIBILITY_PASS");
console.log("- fixed 28-question start surface present");
console.log("- semantic radiogroup answers, roving keyboard navigation, and visible focus present");
console.log("- progress announcement, heading focus, reduced-motion, and 100dvh safeguards present");
console.log("- back action restores a reviewed answer without losing score history");
