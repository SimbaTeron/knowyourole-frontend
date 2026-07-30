import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const publicRoutes = ["/", "/quiz", "/results?demo=true", "/privacy"];

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

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
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
});
