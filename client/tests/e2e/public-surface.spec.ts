import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const publicRoutes = ["/", "/quiz", "/results?demo=true", "/privacy"];
type AnalyticsEvent = { name: string; params: Record<string, string | number | boolean>; timestamp: string };


test.describe("public surface", () => {
  for (const route of publicRoutes) {
    test(`${route} responds without horizontal overflow`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle" });
      await expect(page).toHaveURL(new RegExp(route.split("?")[0].replace("/", "\\/") || "\\/"));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflow, `${route} has horizontal overflow`).toBeFalsy();
      await expect(page.getByText("KYR DEV", { exact: true })).toHaveCount(0);
    });
  }

  test("home supports keyboard navigation and has no serious axe violations", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).not.toHaveCount(0);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""));
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("cookie preferences gate Google Analytics until explicit analytics opt-in", async ({ page, context }) => {
    const analyticsRequests: string[] = [];
    page.on("request", (request) => {
      if (/googletagmanager\.com|google-analytics\.com/.test(request.url())) analyticsRequests.push(request.url());
    });
    await context.clearCookies();
    await page.goto("/", { waitUntil: "networkidle" });
    expect(analyticsRequests).toEqual([]);
    const accept = page.getByRole("button", { name: /accept all/i });
    if (await accept.count()) {
      await accept.click();
      await page.reload({ waitUntil: "networkidle" });
      expect(analyticsRequests.length).toBeGreaterThan(0);
    }
  });

  test("funnel events require analytics consent and strip quiz-result identifiers", async ({ page }) => {
    const getEvents = () => page.evaluate<AnalyticsEvent[]>(() => {
      return ((window as unknown as { __kyrAnalyticsEvents?: AnalyticsEvent[] }).__kyrAnalyticsEvents) || [];
    });

    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => window.localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await page.goto("/quiz", { waitUntil: "networkidle" });
    expect(await getEvents()).toEqual([]);

    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => window.localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    const accept = page.getByRole("button", { name: /accept all/i });
    await expect(accept).toBeVisible();
    await accept.click();
    await page.goto("/quiz", { waitUntil: "networkidle" });
    const events = await getEvents();
    expect(events.some((event) => event.name === "kyr_quiz_landing_viewed")).toBeTruthy();
    for (const event of events) {
      expect(Object.keys(event.params)).not.toEqual(expect.arrayContaining([
        "answer_id", "question_id", "mbti_type", "primary_disc", "direction_title", "session_id", "result_id",
      ]));
    }
  });
});
