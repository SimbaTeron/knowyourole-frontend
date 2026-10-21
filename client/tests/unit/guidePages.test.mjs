import test from "node:test";
import assert from "node:assert/strict";
import { GUIDE_UPDATED, guidePages, getGuidePage } from "../../src/lib/guidePages.ts";
import { getSeoPage } from "../../src/lib/seo-pages.ts";
import { publicPages } from "../../src/lib/seo.ts";

const expected = [
  {
    path: "/careers/trades-career-quiz",
    heading: "What a trades career quiz can (and can't) tell you",
  },
  {
    path: "/careers/creator-careers-quiz",
    heading: "Creator careers are more than going viral",
  },
  {
    path: "/career-quiz-for-teens",
    heading: "Why no quiz should pick your career for you",
  },
  {
    path: "/for-parents",
    heading: "Privacy for families: no account or name needed, what is stored, how to ask for deletion",
  },
  {
    path: "/for-counselors",
    heading: "Printable lesson kit",
  },
];

test("five guide pages are public, dated, and linked to the quiz", () => {
  assert.equal(new Set(guidePages.map((page) => page.path)).size, guidePages.length);
  for (const item of expected) {
    const guide = getGuidePage(item.path);
    const seo = getSeoPage(item.path);
    const listed = publicPages.find((page) => page.path === item.path);
    assert.ok(seo, item.path);
    assert.ok(listed, item.path);
    assert.equal(listed.title, guide.title);
    assert.equal(listed.description, guide.description);
    assert.equal(seo.lastModified, GUIDE_UPDATED);
    assert.ok(guide.faqs.length >= 3);
    assert.ok(guide.sections.some((section) => section.heading === item.heading));
    assert.ok(guide.related.includes("/quiz"));
    assert.equal(guide.lastModified, GUIDE_UPDATED);
  }
});

test("counselor guide keeps the lesson on the page and does not ask for email", () => {
  const page = getGuidePage("/for-counselors");
  assert.ok(page.lesson);
  assert.ok(page.lesson.steps.length >= 4);
  assert.equal(page.lesson.bands.length, 2);
  const text = JSON.stringify(page);
  assert.equal(text.includes("email form"), true);
  assert.equal(/sign up|subscribe|enter your email/i.test(text), false);
});
