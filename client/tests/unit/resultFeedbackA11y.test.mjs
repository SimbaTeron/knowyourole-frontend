import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DirectionFeedbackCard } from "../../src/components/results/DirectionFeedbackCard.tsx";
import { RatingRadios } from "../../src/components/results/RatingRadios.tsx";
import { ResultFitFeedback } from "../../src/components/results/ResultFitFeedback.tsx";
import { nextRadioIndex, radioTabIndex } from "../../src/components/results/radioGroup.ts";
import { resultFitRatingLabel } from "../../src/lib/feedback/resultFitFeedback.ts";
import { toSavedResultId } from "../../src/lib/results/savedResultId.ts";

const clientRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const saved = toSavedResultId({ resultId: "result-1700000000000-abcd1234", storage: "saved" });

test("arrow keys move inside one radio group and only one radio is tabbable", () => {
  assert.equal(nextRadioIndex(0, 5, "ArrowRight"), 1);
  assert.equal(nextRadioIndex(0, 5, "ArrowDown"), 1);
  assert.equal(nextRadioIndex(0, 5, "ArrowLeft"), 4);
  assert.equal(nextRadioIndex(0, 5, "ArrowUp"), 4);
  assert.equal(nextRadioIndex(4, 5, "ArrowRight"), 0);
  assert.equal(nextRadioIndex(2, 5, "Home"), 0);
  assert.equal(nextRadioIndex(2, 5, "End"), 4);
  assert.equal(nextRadioIndex(2, 5, "Tab"), null);
  assert.equal(nextRadioIndex(2, 5, "a"), null);
  assert.equal(radioTabIndex(0, null), 0);
  assert.equal(radioTabIndex(1, null), -1);
  assert.equal(radioTabIndex(3, 3), 0);
  assert.equal(radioTabIndex(0, 3), -1);
});

test("direction accuracy ratings are one named radio group", () => {
  const html = renderToStaticMarkup(createElement(DirectionFeedbackCard, {
    savedResultId: saved,
    sessionId: "session-1",
    directionTitle: "Build and fix things",
    recommendations: ["Carpenter"],
  }));
  assert.equal((html.match(/role="radiogroup"/g) || []).length, 1);
  assert.match(html, /aria-label="Direction accuracy"/);
  assert.equal((html.match(/role="radio"/g) || []).length, 5);
  assert.equal((html.match(/tabindex="0"/g) || []).length, 1);
  assert.equal((html.match(/tabindex="-1"/g) || []).length, 4);
  assert.match(html, /aria-checked="false"/);
  assert.match(html, />1</);
  assert.match(html, /Not at all/);
  assert.match(html, /Exactly/);
  assert.equal(html.includes("disabled="), false);

  const hidden = renderToStaticMarkup(createElement(DirectionFeedbackCard, {
    savedResultId: toSavedResultId({ resultId: "local-result-1", storage: "local" }),
    sessionId: "session-1",
    directionTitle: "Build and fix things",
    recommendations: ["Carpenter"],
  }));
  assert.equal(hidden.includes("radiogroup"), false);
  assert.equal(hidden.includes("Does this work direction feel accurate?"), false);
});

test("the fit card is hidden unless the result id was saved, and its rating is a radio group", () => {
  const unsaved = renderToStaticMarkup(createElement(ResultFitFeedback, {
    savedResultId: toSavedResultId({ resultId: "result-1700000000000-abcd1234", storage: "local" }),
    sessionId: "session-1",
  }));
  assert.equal(unsaved, "");

  const missing = renderToStaticMarkup(createElement(ResultFitFeedback, {
    savedResultId: saved,
    sessionId: "",
  }));
  assert.equal(missing, "");

  const shown = renderToStaticMarkup(createElement(ResultFitFeedback, {
    savedResultId: saved,
    sessionId: "session-1",
  }));
  const fitSource = readFileSync(join(clientRoot, "src/components/results/ResultFitFeedback.tsx"), "utf8");
  assert.match(fitSource, /phase === "thanks" \? RESULT_FIT_COPY\.thanksDetail/);
  assert.equal(fitSource.includes("${RESULT_FIT_COPY.thanksTitle}"), false);

  assert.match(shown, /Did this fit you\?/);
  assert.match(shown, /Optional\. No name needed\./);
  assert.match(shown, />Yes</);
  assert.match(shown, />No</);
  assert.equal(shown.includes("Somewhat"), false);
  assert.equal(/[\s]disabled=/.test(shown), false);
  assert.match(shown, /aria-pressed="false"/);

  const ratings = renderToStaticMarkup(createElement(RatingRadios, {
    labelledBy: "result-fit-rating-legend",
    describedBy: "result-fit-scale",
    className: "result-fit-ratings",
    selected: 3,
    onSelect() {},
    options: [1, 2, 3, 4, 5].map((value) => ({
      value,
      ariaLabel: resultFitRatingLabel(value),
      className: "result-fit-rating",
      testId: `result-fit-rating-${value}`,
      children: String(value),
    })),
  }));
  assert.match(ratings, /role="radiogroup"/);
  assert.match(ratings, /aria-labelledby="result-fit-rating-legend"/);
  assert.match(ratings, /aria-describedby="result-fit-scale"/);
  assert.match(ratings, /aria-label="1, not close"/);
  assert.match(ratings, /aria-label="5, very close"/);
  assert.match(ratings, /data-testid="result-fit-rating-3"/);
  assert.equal((ratings.match(/role="radio"/g) || []).length, 5);
  assert.equal((ratings.match(/tabindex="0"/g) || []).length, 1);
  assert.match(ratings, /aria-checked="true"/);
  assert.equal((ratings.match(/aria-checked="false"/g) || []).length, 4);

  const page = readFileSync(join(clientRoot, "src/app/results/ResultsPageClient.tsx"), "utf8");
  assert.equal(page.includes("resultId={canonicalResult?.meta.resultId}"), false);
  assert.equal(page.includes("DirectionFeedbackCard"), false);
  assert.equal(page.includes("Early pilot"), false);
  assert.match(page, /Leave feedback/);
  assert.equal((page.match(/toSavedResultId\(canonicalResult\?\.meta\)/g) || []).length, 1);
  const fit = readFileSync(join(clientRoot, "src/components/results/ResultFitFeedback.tsx"), "utf8");
  assert.equal(fit.includes('disabled={phase === "saving"}'), false);
  assert.equal(fit.includes("Somewhat"), false);
  assert.equal(fit.includes("result-fit-rating"), false);
  assert.match(fit, /aria-disabled=\{phase === "saving"/);
  assert.match(fit, /errorRef\.current\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(fit, /ref=\{errorRef\} role="alert" tabIndex=\{-1\}/);
  const direction = readFileSync(join(clientRoot, "src/components/results/DirectionFeedbackCard.tsx"), "utf8");
  assert.match(direction, /errorRef\.current\?\.focus\(\)/);
  assert.match(direction, /ref=\{errorRef\} role="alert" tabIndex=\{-1\}/);
});
