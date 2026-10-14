import { expect, test } from "@playwright/test";

test.describe("quiz interaction polish", () => {
  test("removes pre-quiz content once the active question flow starts", async ({ page }) => {
    await page.goto("/quiz");

    const explainer = page.getByRole("heading", {
      name: "A free personality quiz for clearer work style, communication, and career fit.",
    });
    await expect(explainer).toBeVisible();

    await page.getByRole("button", { name: "Start the 28 questions" }).click();

    await expect(page.getByRole("heading", {
      name: "After a demanding day, what most reliably helps you feel like yourself again?",
    })).toBeVisible();
    await expect(explainer).toHaveCount(0);
    await expect(page.getByTestId("button-v2-answer-A")).toBeVisible();
  });
});
