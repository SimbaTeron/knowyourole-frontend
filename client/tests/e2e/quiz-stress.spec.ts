import { test, expect, type Page } from "@playwright/test";

/**
 * Quiz stress test: rapid clicks, double clicks, clicks during the auto-advance
 * transition, back navigation and reload mid-quiz. Network calls are mocked so it
 * never writes to the database.
 */
const REPEAT = Number(process.env.QUIZ_STRESS_REPEAT || 1);
test.describe.configure({ timeout: 120_000 });

async function setup(page: Page) {
  const computeBodies: Array<{ responses?: unknown[] }> = [];
  await page.route("**/api/quiz/session/start", (route) => route.fulfill({ status: 201, contentType: "application/json", body: "{}" }));
  await page.route("**/api/results/compute", async (route) => {
    computeBodies.push(JSON.parse(route.request().postData() || "{}"));
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ success: false, error: "stress-test" }) });
  });
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/quiz");
  await page.getByRole("button", { name: /Start the 30 questions/ }).click();
  return { computeBodies, pageErrors };
}

async function questionNumber(page: Page) {
  const text = await page.locator("body").innerText();
  const match = text.match(/Question (\d+) of 30/i);
  return match ? Number(match[1]) : null;
}

async function assertHealthy(page: Page, pageErrors: string[]) {
  await expect(page.getByText(/Something went wrong/i)).toHaveCount(0);
  expect(pageErrors.filter((message) => /reading 'group'|undefined/.test(message))).toEqual([]);
}

async function finish(page: Page, computeBodies: Array<{ responses?: unknown[] }>, pageErrors: string[]) {
  await expect.poll(() => computeBodies.length, { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
  await page.waitForTimeout(800);
  expect(computeBodies.length).toBe(1);
  const responses = (computeBodies[0] as { responses?: unknown[]; scores?: { responses?: unknown[] } });
  const count = responses.responses?.length ?? responses.scores?.responses?.length;
  if (count !== undefined) expect(count).toBe(30);
  await assertHealthy(page, pageErrors);
}

for (let run = 0; run < REPEAT; run++) {
  test(`rapid clicks never skip or overrun (run ${run + 1})`, async ({ page }) => {
    const { computeBodies, pageErrors } = await setup(page);
    for (let i = 0; i < 3000 && computeBodies.length === 0; i++) {
      await page.locator('[role="radio"]').nth(i % 4).click({ timeout: 2000, force: true }).catch(() => {});
    }
    await finish(page, computeBodies, pageErrors);
  });

  test(`double clicks answer one question at a time (run ${run + 1})`, async ({ page }) => {
    const { computeBodies, pageErrors } = await setup(page);
    for (let q = 1; q <= 30; q++) {
      await expect.poll(() => questionNumber(page)).toBe(q);
      await page.locator('[role="radio"]').nth(q % 4).dblclick();
      if (q < 30) await expect.poll(() => questionNumber(page)).toBe(q + 1);
    }
    await finish(page, computeBodies, pageErrors);
  });

  test(`clicking during the transition is ignored (run ${run + 1})`, async ({ page }) => {
    const { computeBodies, pageErrors } = await setup(page);
    for (let q = 1; q <= 30; q++) {
      await expect.poll(() => questionNumber(page)).toBe(q);
      await page.locator('[role="radio"]').nth(0).click();
      await page.waitForTimeout(150);
      await page.locator('[role="radio"]').nth(2).click({ force: true, timeout: 1000 }).catch(() => {});
      await page.locator('[role="radio"]').nth(3).click({ force: true, timeout: 1000 }).catch(() => {});
    }
    await finish(page, computeBodies, pageErrors);
  });

  test(`back button and reload mid-quiz resume correctly (run ${run + 1})`, async ({ page }) => {
    const { computeBodies, pageErrors } = await setup(page);
    for (let q = 1; q <= 30; q++) {
      await expect.poll(() => questionNumber(page)).toBe(q);
      if (q === 6) {
        const back = page.getByRole("button", { name: /back|previous/i }).first();
        if (await back.isVisible().catch(() => false)) {
          await back.click();
          await expect.poll(() => questionNumber(page)).toBe(5);
          await page.locator('[role="radio"]').nth(1).click();
          await expect.poll(() => questionNumber(page)).toBe(6);
        }
      }
      if (q === 12) {
        await page.reload();
        await expect.poll(() => questionNumber(page)).toBe(12);
      }
      await page.locator('[role="radio"]').nth(q % 4).click();
    }
    await finish(page, computeBodies, pageErrors);
  });
}
