import test from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const analytics = await import(pathToFileURL(join(root, "src/lib/analytics.ts")).href);
const { crossedQuizMilestones, forSchoolsClickEvent, quizProgressMilestone, trackKyrEvent } = analytics;

test("quiz progress milestones land on every fifth answer", () => {
  assert.equal(quizProgressMilestone(4), null);
  assert.equal(quizProgressMilestone(5), 5);
  assert.equal(quizProgressMilestone(6), null);
  assert.equal(quizProgressMilestone(25), 25);
  assert.deepEqual(crossedQuizMilestones(12, new Set()), [5, 10]);
  assert.deepEqual(crossedQuizMilestones(12, new Set([5])), [10]);
  assert.deepEqual(crossedQuizMilestones(0, new Set()), []);
});

test("for schools clicks name the action and never the email address", () => {
  const origin = "https://knowyourole.com";
  assert.deepEqual(forSchoolsClickEvent("/quiz", origin), { event: "for_schools_cta_clicked", cta: "quiz" });
  assert.deepEqual(forSchoolsClickEvent("mailto:info@knowyourole.com", origin), {
    event: "for_schools_contact_clicked",
    cta: "email",
  });
  assert.deepEqual(forSchoolsClickEvent("/contact", origin), {
    event: "for_schools_contact_clicked",
    cta: "contact_page",
  });
  assert.equal(forSchoolsClickEvent("/privacy", origin), null);
  const emailEvent = forSchoolsClickEvent("mailto:info@knowyourole.com?subject=Schools", origin);
  assert.equal(JSON.stringify(emailEvent).includes("info@"), false);
});

function installWindow(consent) {
  const events = [];
  const gtagCalls = [];
  globalThis.window = {
    localStorage: {
      getItem(key) {
        if (key !== "kyr_cookie_consent" || !consent) return null;
        return JSON.stringify({ necessary: true, analytics: consent.analytics, marketing: false, timestamp: "2026-10-17T00:00:00.000Z", version: 1 });
      },
    },
    gtag(...args) {
      gtagCalls.push(args);
    },
    __kyrAnalyticsEvents: events,
  };
  return { events, gtagCalls };
}

test("analytics events stay silent until analytics consent", () => {
  installWindow(null);
  trackKyrEvent("quiz_started", { total_questions: 5, answer_id: "secret-answer" });
  assert.equal(window.__kyrAnalyticsEvents.length, 0);

  const { events, gtagCalls } = installWindow({ analytics: false });
  trackKyrEvent("quiz_completed", { answer_id: "secret-answer" });
  assert.equal(events.length, 0);
  assert.equal(gtagCalls.length, 0);

  installWindow({ analytics: true });
  trackKyrEvent("quiz_progress_milestone", {
    completed_questions: 5,
    milestone: 5,
    answer_id: "secret-answer",
    email: "person@example.com",
  });
  assert.equal(globalThis.window.__kyrAnalyticsEvents.length, 1);
  const recorded = globalThis.window.__kyrAnalyticsEvents[0];
  assert.equal(recorded.name, "kyr_quiz_progress_milestone");
  assert.equal(recorded.params.completed_questions, 5);
  assert.equal(recorded.params.milestone, 5);
  assert.equal("answer_id" in recorded.params, false);
  assert.equal("email" in recorded.params, false);
  assert.equal(JSON.stringify(recorded).includes("secret-answer"), false);
  assert.equal(JSON.stringify(recorded).includes("person@example.com"), false);

  trackKyrEvent("result_fit_tapped", { fit: "yes", comment: "my name is Ada", note: "secret note" });
  const fitEvent = globalThis.window.__kyrAnalyticsEvents.at(-1);
  assert.equal(fitEvent.name, "kyr_result_fit_tapped");
  assert.equal(fitEvent.params.fit, "yes");
  assert.equal("comment" in fitEvent.params, false);
  assert.equal("note" in fitEvent.params, false);
  assert.equal(JSON.stringify(fitEvent).includes("Ada"), false);
});
