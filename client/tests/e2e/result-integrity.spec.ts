import { expect, test } from "@playwright/test";
import { SHORTFORM_V2_QUESTIONS } from "../../src/data/shortformV2Questions";
import {
  ShortformV2ResponseValidationError,
  recomputeShortformV2ScoreMaps,
  validateShortformV2Responses,
} from "../../src/lib/quiz/shortformV2Scoring";

const completeResponses = () => SHORTFORM_V2_QUESTIONS.map((question, index) => ({
  questionId: question.id,
  choice: (index % 4) as 0 | 1 | 2 | 3,
  timeSpent: 2,
  swipeDirection: index % 2 ? "right" as const : "left" as const,
}));

test.describe("canonical quiz result integrity", () => {
  test("accepts exactly the fixed 28 active answers and recomputes deterministic score maps", () => {
    const responses = validateShortformV2Responses(completeResponses());
    expect(responses).toHaveLength(28);

    const first = recomputeShortformV2ScoreMaps(responses);
    const second = recomputeShortformV2ScoreMaps(responses);
    expect(second).toEqual(first);
  });

  test("rejects incomplete, duplicate, and unknown answer evidence before scoring", () => {
    const incomplete = completeResponses().slice(0, -1);
    expect(() => validateShortformV2Responses(incomplete)).toThrow(ShortformV2ResponseValidationError);

    const duplicate = completeResponses();
    duplicate[27] = { ...duplicate[27], questionId: duplicate[0].questionId };
    expect(() => validateShortformV2Responses(duplicate)).toThrow(/duplicate answer/);

    const unknown = completeResponses();
    unknown[0] = { ...unknown[0], questionId: 9999 };
    expect(() => validateShortformV2Responses(unknown)).toThrow(/unknown questionId/);
  });

  test("canonical endpoint rejects client score maps without all versioned answer evidence", async ({ request }) => {
    const response = await request.post("/api/results/compute", {
      data: {
        source: "live_quiz",
        scores: {
          mbti: { E: 999, I: 0, S: 999, N: 0, T: 999, F: 0, J: 999, P: 0 },
          disc: { D: 999, I: 0, S: 0, C: 0 },
          bigFive: { O: 999, C: 999, E: 999, A: 999, N: 999 },
          responses: [],
        },
      },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ success: false });
  });

  test("deprecated score and refinement writers are retired", async ({ request }) => {
    for (const path of ["/api/quiz/score", "/api/score", "/api/quiz/refine"]) {
      const response = await request.post(path, { data: {} });
      expect(response.status(), path).toBe(410);
    }
  });

  test("live results without a canonical DTO return to the quiz", async ({ page }) => {
    await page.goto("/results", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/quiz$/);
  });
});
