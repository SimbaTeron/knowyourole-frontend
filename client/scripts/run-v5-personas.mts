import { readFileSync, writeFileSync } from "node:fs";
import { scoreShortformVersioned } from "../src/lib/quiz/scoreShortformVersioned.ts";
const [, , inPath, outPath, version = "v5"] = process.argv;
const personas = JSON.parse(readFileSync(inPath, "utf8"));
const rows = personas.map((p: any) => {
  const answers = (version === "v5" ? p.answers : p.answers.slice(0, 28)).map((c: number, i: number) => ({ questionId: i + 1, choice: c, timeSpent: 6 }));
  const r = scoreShortformVersioned(answers, version as any);
  return {
    id: p.id, mbti: r.mbtiDisplay, disc: r.discPrimary, top: r.topTrait, N: r.calibrated.bigFive.N, bigFive: r.calibrated.bigFive,
    clarity: r.clarity.level, flagged: r.inconsistency.flagged, guarded: r.inconsistency.guarded, quick: r.quickOrScattered ?? false,
    note: r.mbtiConfidence.note, badge: r.mbtiConfidence.badge,
    lane: r.direction.laneKey, title: r.direction.title, examples: r.direction.examples, rationale: r.v5Direction?.rationale ?? "",
    nextSteps: r.v5Direction?.nextSteps ?? [], lanes: r.v5Direction?.laneScores ?? null, stage: r.stage ?? "",
  };
});
writeFileSync(outPath, JSON.stringify(rows, null, 1));
console.log(rows.length);
