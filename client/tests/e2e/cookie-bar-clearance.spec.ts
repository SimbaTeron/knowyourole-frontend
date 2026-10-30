import { test, expect, type Page } from "@playwright/test";
import { QUESTION_COUNT } from "../../src/lib/quiz/quizConfig";

/**
 * The consent bar must not cover quiz answers, Back/Exit, or the start button.
 * The quiz is not an inner scrolling box. Short phones are the failing sizes.
 */
const SIZES = [
  { width: 320, height: 568 },
  { width: 360, height: 640 },
  { width: 375, height: 667 },
] as const;

test.describe.configure({ timeout: 240_000 });

async function openFreshQuiz(page: Page) {
  await page.goto("/quiz");
  await page.evaluate(() => window.sessionStorage.removeItem("kyr_quiz_progress_v1"));
  await page.reload();
  await page.waitForSelector(".kyr-cookie-bar");
}

type Box = { top: number; bottom: number; left: number; right: number; width: number; height: number };

function verticalOverlap(a: Box, b: Box) {
  const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  return x > 0.5 && y > 0.5 ? y : 0;
}

async function clearConsent(page: Page) {
  await page.addInitScript(() => {
    try { localStorage.removeItem("kyr_cookie_consent"); } catch { /* ignore */ }
  });
}

async function questionNumber(page: Page) {
  const text = await page.locator("[aria-live='polite']").first().innerText();
  const match = text.match(new RegExp(`Question (\\d+) of ${QUESTION_COUNT}`, "i"));
  return match ? Number(match[1]) : null;
}

async function measure(page: Page) {
  return page.evaluate(() => {
    const box = (el: Element | null) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
    };
    const bar = document.querySelector(".kyr-cookie-bar");
    const quiz = document.querySelector(".quiz-question-screen, .quiz-welcome-screen");
    const answers = [...document.querySelectorAll("[data-testid^='button-v2-answer-']")].map((el) => ({
      id: el.getAttribute("data-testid") || "",
      box: box(el),
    }));
    const nav = [...document.querySelectorAll("button")].flatMap((el) => {
      const label = el.getAttribute("aria-label") || el.textContent || "";
      if (!/back|exit|start the/i.test(label)) return [];
      return [{ label: label.trim().slice(0, 80), box: box(el) }];
    });
    const start = document.querySelector(".quiz-welcome-card button");
    const style = quiz ? getComputedStyle(quiz) : null;
    return {
      bar: box(bar),
      answers,
      nav,
      start: box(start),
      overflowY: style?.overflowY ?? null,
      innerHeight: window.innerHeight,
      scrollY: window.scrollY,
    };
  });
}

function assertClearance(data: Awaited<ReturnType<typeof measure>>, label: string, requireOnScreen: boolean) {
  const problems: string[] = [];
  if (!data.bar) problems.push(`${label}: cookie bar missing`);
  if (data.overflowY === "auto" || data.overflowY === "scroll") {
    problems.push(`${label}: quiz overflow-y is ${data.overflowY}`);
  }
  const bar = data.bar;
  if (!bar) return problems;
  for (const answer of data.answers) {
    if (!answer.box) {
      problems.push(`${label}: ${answer.id} has no box`);
      continue;
    }
    const overlap = verticalOverlap(answer.box, bar);
    if (overlap > 0) problems.push(`${label}: ${answer.id} overlaps the bar by ${overlap.toFixed(1)}px (y ${answer.box.top.toFixed(0)}-${answer.box.bottom.toFixed(0)}, bar ${bar.top.toFixed(0)})`);
    const fullyAbove = answer.box.bottom <= bar.top + 0.5;
    const fullyBelow = answer.box.top >= data.innerHeight - 0.5;
    if (requireOnScreen && !fullyAbove) {
      problems.push(`${label}: ${answer.id} is not fully above the bar`);
    }
    if (!fullyAbove && !fullyBelow) {
      problems.push(`${label}: ${answer.id} is neither fully above the bar nor below the screen`);
    }
  }
  for (const control of data.nav) {
    if (!control.box) continue;
    const overlap = verticalOverlap(control.box, bar);
    if (overlap > 0) problems.push(`${label}: "${control.label}" overlaps the bar by ${overlap.toFixed(1)}px`);
  }
  if (data.start) {
    const overlap = verticalOverlap(data.start, bar);
    if (overlap > 0) problems.push(`${label}: start button overlaps the bar by ${overlap.toFixed(1)}px`);
    if (data.start.bottom > bar.top + 0.5 && data.start.top < data.innerHeight) {
      problems.push(`${label}: start button is not fully above the bar`);
    }
  }
  return problems;
}

async function hitTestAnswers(page: Page, label: string) {
  return page.evaluate((name) => {
    const bar = document.querySelector(".kyr-cookie-bar")?.getBoundingClientRect();
    if (!bar) return [`${name}: cookie bar missing`];
    const problems: string[] = [];
    for (const el of document.querySelectorAll("[data-testid^='button-v2-answer-']")) {
      const r = el.getBoundingClientRect();
      if (r.bottom > bar.top + 0.5 || r.top < 0 || r.bottom > window.innerHeight) continue;
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      const owned = hit === el || el.contains(hit);
      if (!owned) problems.push(`${name}: ${el.getAttribute("data-testid")} center hit ${hit?.className || hit?.tagName || "nothing"}`);
    }
    return problems;
  }, label);
}

test("short phones keep every answer and the start button above the consent bar", async ({ page }) => {
  await clearConsent(page);
  const problems: string[] = [];

  for (const size of SIZES) {
    await page.setViewportSize(size);
    await openFreshQuiz(page);
    const welcome = await measure(page);
    problems.push(...assertClearance(welcome, `${size.width}x${size.height} welcome`, false));
    expect(problems, problems.join("\n")).toEqual([]);

    await page.getByRole("button", { name: new RegExp(`Start the ${QUESTION_COUNT} questions`) }).focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => questionNumber(page)).toBe(1);

    for (let q = 1; q <= QUESTION_COUNT; q++) {
      await expect.poll(() => questionNumber(page)).toBe(q);
      await page.evaluate(() => window.scrollTo(0, 0));
      const atTop = await measure(page);
      const label = `${size.width}x${size.height} q${q} top`;
      problems.push(...assertClearance(atTop, label, true));
      problems.push(...await hitTestAnswers(page, label));

      await page.locator("[data-testid='button-v2-answer-D']").focus();
      const focused = await measure(page);
      problems.push(...assertClearance(focused, `${size.width}x${size.height} q${q} focus D`, true));
      expect(problems, problems.join("\n")).toEqual([]);

      if (q < QUESTION_COUNT) {
        await page.locator("[data-testid='button-v2-answer-A']").click();
      }
    }
  }

  expect(problems, problems.join("\n")).toEqual([]);
});

test("back and reload keep answers above the consent bar", async ({ page }) => {
  await clearConsent(page);
  const problems: string[] = [];

  for (const size of SIZES) {
    await page.setViewportSize(size);
    await openFreshQuiz(page);
    await page.getByRole("button", { name: new RegExp(`Start the ${QUESTION_COUNT} questions`) }).click();
    await expect.poll(() => questionNumber(page)).toBe(1);
    await page.locator("[data-testid='button-v2-answer-B']").click();
    await expect.poll(() => questionNumber(page)).toBe(2);
    await page.getByRole("button", { name: "Go back and change the previous answer" }).click();
    await expect.poll(() => questionNumber(page)).toBe(1);
    await page.evaluate(() => window.scrollTo(0, 0));
    problems.push(...assertClearance(await measure(page), `${size.width}x${size.height} back`, true));
    expect(problems, problems.join("\n")).toEqual([]);

    await page.locator("[data-testid='button-v2-answer-A']").click();
    await expect.poll(() => questionNumber(page)).toBe(2);
    await page.locator("[data-testid='button-v2-answer-C']").click();
    await expect.poll(() => questionNumber(page)).toBe(3);
    await expect.poll(() => page.evaluate(() => window.sessionStorage.getItem("kyr_quiz_progress_v1"))).toBeTruthy();
    await page.reload();
    await page.waitForSelector(".kyr-cookie-bar");
    await expect.poll(() => questionNumber(page)).toBe(3);
    await page.evaluate(() => window.scrollTo(0, 0));
    problems.push(...assertClearance(await measure(page), `${size.width}x${size.height} resume`, true));
    problems.push(...await hitTestAnswers(page, `${size.width}x${size.height} resume`));
  }

  expect(problems, problems.join("\n")).toEqual([]);
});

test("the home hero does not jump when the consent bar closes", async ({ page }) => {
  await clearConsent(page);
  for (const size of SIZES) {
    await page.setViewportSize(size);
    await page.goto("/");
    await page.waitForSelector(".kyr-cookie-bar");
    const open = await page.evaluate(() => {
      const title = document.querySelector(".hero-title")?.getBoundingClientRect();
      const cta = document.querySelector("a.primary-cta")?.getBoundingClientRect();
      const bar = document.querySelector(".kyr-cookie-bar")?.getBoundingClientRect();
      return {
        titleH: title?.height ?? 0,
        ctaTop: cta?.top ?? 0,
        ctaBottom: cta?.bottom ?? 0,
        barTop: bar?.top ?? 0,
      };
    });
    expect(open.ctaBottom, `${size.width}x${size.height} start button`).toBeLessThanOrEqual(open.barTop + 0.5);
    await page.getByRole("button", { name: "Reject" }).click();
    await expect(page.locator(".kyr-cookie-bar")).toHaveCount(0);
    const closed = await page.evaluate(() => {
      const title = document.querySelector(".hero-title")?.getBoundingClientRect();
      const cta = document.querySelector("a.primary-cta")?.getBoundingClientRect();
      return { titleH: title?.height ?? 0, ctaTop: cta?.top ?? 0 };
    });
    expect(Math.abs(open.titleH - closed.titleH), `${size.width}x${size.height} hero jump`).toBeLessThan(2);
    expect(Math.abs(open.ctaTop - closed.ctaTop), `${size.width}x${size.height} button jump`).toBeLessThan(2);
  }
});
