// @ts-check
/**
 * Fails CI when source or copy hard-codes a quiz length phrase.
 * The live length belongs in quizConfig.ts (QUESTION_COUNT = questions.length).
 * Lines that name LEGACY_V2_QUESTION_COUNT or LEGACY_REPORTING_ANSWER_COLUMNS are allowed.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const COUNT_WORDS = ["28", "30"];
const NOUNS = ["question", "answer", "prompt"];

/** @type {readonly string[]} */
export const LEGACY_COUNT_NAMES = ["LEGACY_V2_QUESTION_COUNT", "LEGACY_REPORTING_ANSWER_COLUMNS"];

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".md", ".mdx"]);
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "coverage", "build"]);

function phrasePattern() {
  const counts = COUNT_WORDS.join("|");
  const singular = NOUNS.map((noun) => `${noun}s?`).join("|");
  const plural = NOUNS.map((noun) => `${noun}s`).join("|");
  return new RegExp(
    `\\b(?:${counts})(?:[-\\s]+(?:${singular})|(?:\\s+[A-Za-z]+){1,3}\\s+(?:${plural}))\\b`,
    "gi",
  );
}

/**
 * @param {string} line
 * @returns {string[]}
 */
export function bannedPhrasesInLine(line) {
  if (LEGACY_COUNT_NAMES.some((name) => line.includes(name))) return [];
  const pattern = phrasePattern();
  /** @type {string[]} */
  const hits = [];
  let match;
  while ((match = pattern.exec(line))) hits.push(match[0]);
  return hits;
}

/**
 * @param {string} filePath
 * @param {string} source
 * @returns {{ line: number, phrase: string, text: string }[]}
 */
export function bannedPhrasesInSource(filePath, source) {
  /** @type {{ line: number, phrase: string, text: string }[]} */
  const hits = [];
  const lines = source.split(/\r?\n/);
  lines.forEach((text, index) => {
    for (const phrase of bannedPhrasesInLine(text)) {
      hits.push({ line: index + 1, phrase, text: text.trim() });
    }
  });
  return hits.map((hit) => ({ ...hit, file: filePath }));
}

/**
 * @param {string} dir
 * @param {string[]} out
 */
function walk(dir, out) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const path = join(dir, entry);
    const info = statSync(path);
    if (info.isDirectory()) {
      walk(path, out);
      continue;
    }
    const dot = entry.lastIndexOf(".");
    const ext = dot >= 0 ? entry.slice(dot) : "";
    if (SOURCE_EXTENSIONS.has(ext)) out.push(path);
  }
}

/**
 * @param {string} clientRoot
 * @returns {{ file: string, line: number, phrase: string, text: string }[]}
 */
export function scanQuestionCountPhrases(clientRoot) {
  /** @type {string[]} */
  const files = [];
  for (const folder of ["src", "tests"]) {
    walk(join(clientRoot, folder), files);
  }
  /** @type {{ file: string, line: number, phrase: string, text: string }[]} */
  const violations = [];
  for (const file of files) {
    const rel = relative(clientRoot, file).split("\\").join("/");
    const source = readFileSync(file, "utf8");
    const hits = bannedPhrasesInSource(rel, source).map((hit) => ({ ...hit, file: rel }));
    violations.push(...hits);
  }
  return violations;
}

/**
 * @param {{ file: string, line: number, phrase: string, text: string }[]} hits
 */
export function formatQuestionCountHits(hits) {
  return hits.map((hit) => `${hit.file}:${hit.line}: ${hit.phrase} — ${hit.text}`).join("\n");
}
