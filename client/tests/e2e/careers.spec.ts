import { expect, test } from "@playwright/test";

type PublicJobRole = {
  id?: number;
  role_number: number;
  role_name: string;
  category: string;
};

type PublicJobRolesResponse = {
  success: boolean;
  count: number;
  jobRoles: PublicJobRole[];
};

function careerTestId(roleName: string) {
  return `career-${roleName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

test.describe("Career Paths", () => {
  test("public catalog API retains the contract consumed by Career Paths", async ({ request }) => {
    const response = await request.get("/api/job-roles");
    expect(response.ok()).toBeTruthy();

    const payload = (await response.json()) as PublicJobRolesResponse;
    expect(payload).toMatchObject({
      success: true,
      count: expect.any(Number),
      jobRoles: expect.any(Array),
    });
    expect(payload.count).toBe(payload.jobRoles.length);
    expect(payload.jobRoles.length).toBeGreaterThan(0);
    expect(payload.jobRoles[0]).toMatchObject({
      role_number: expect.any(Number),
      role_name: expect.any(String),
      category: expect.any(String),
    });
  });

  test("server response contains a real API career before hydration", async ({ request }) => {
    const catalogResponse = await request.get("/api/job-roles");
    const catalog = (await catalogResponse.json()) as PublicJobRolesResponse;
    const roleName = catalog.jobRoles[0]?.role_name;
    expect(roleName).toBeTruthy();

    const careersResponse = await request.get("/careers");
    expect(careersResponse.ok()).toBeTruthy();
    const html = await careersResponse.text();
    expect(html).toContain(roleName);
  });

  test("has route-specific metadata rather than inherited home metadata", async ({ request }) => {
    const response = await request.get("/careers");
    const html = await response.text();
    const title = "Career Paths by Personality &amp; Work Style | KnowYouRole";

    expect(html).toContain(`<title>${title}</title>`);
    expect(html).toContain('rel="canonical" href="https://knowyourole.com/careers"');
    expect(html).toContain(`property="og:title" content="${title}"`);
    expect(html).not.toContain("<title>Free Personality Quiz for Work Style &amp; Career Fit | KnowYouRole</title>");
  });

  test("search works without horizontal overflow on every configured viewport", async ({ page, request }) => {
    const catalogResponse = await request.get("/api/job-roles");
    const catalog = (await catalogResponse.json()) as PublicJobRolesResponse;
    const roleName = catalog.jobRoles[0]?.role_name;
    expect(roleName).toBeTruthy();

    await page.goto("/careers", { waitUntil: "networkidle" });
    const search = page.getByTestId("input-career-search");
    await expect(search).toBeVisible();
    await search.fill(roleName!);

    await expect(page.getByTestId(careerTestId(roleName!))).toBeVisible();
    await expect(search).toHaveValue(roleName!);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, "Career Paths has horizontal overflow").toBeFalsy();
  });
});
