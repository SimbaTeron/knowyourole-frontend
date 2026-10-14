import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:5180",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], browserName: "chromium" } },
    { name: "mobile-375", use: { ...devices["iPhone 13"], browserName: "chromium" } },
    { name: "tablet-768", use: { ...devices["iPad Mini"], browserName: "chromium" } },
  ],
  webServer: {
    command: "npm run start -- -p 5180",
    url: "http://127.0.0.1:5180",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
