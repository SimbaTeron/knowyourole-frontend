import test from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const analytics = await import(pathToFileURL(join(root, "src/lib/analytics.ts")).href);
const gate = await import(pathToFileURL(join(root, "src/lib/analytics/collectionGate.ts")).href);
const links = await import(pathToFileURL(join(root, "src/lib/analytics/internalLink.ts")).href);
const attempts = await import(pathToFileURL(join(root, "src/lib/analytics/quizAttempt.ts")).href);
const { crossedQuizMilestones, forSchoolsClickEvent, quizProgressMilestone, trackKyrEvent } = analytics;
const {
  analyticsCollectionAllowed,
  buildMeasurementConfig,
  internalTrafficFallback,
  isLocalAnalyticsHost,
} = gate;
const { analyticsHitLocation, buildInternalHref, readLinkLocation, scrubCampaignParams } = links;
const {
  QUIZ_ATTEMPT_MAX_AGE_MS,
  beginQuizAttempt,
  closeQuizAttempt,
  flushQuizFunnel,
  loadQuizAttempt,
  noteQuizFunnelEvent,
} = attempts;

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

function installWindow(consent, options = {}) {
  const hostname = options.hostname ?? "knowyourole.com";
  const events = [];
  const gtagCalls = [];
  globalThis.window = {
    location: {
      hostname,
      href: options.href ?? `https://${hostname}/quiz`,
      pathname: "/quiz",
      search: "",
    },
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

function withAnalyticsEnv(env, fn) {
  const keys = ["NODE_ENV", "VERCEL_ENV", "NEXT_PUBLIC_VERCEL_ENV"];
  const previous = new Map(keys.map((key) => [key, process.env[key]]));
  for (const key of keys) {
    if (env[key] === undefined) delete process.env[key];
    else process.env[key] = env[key];
  }
  try {
    return fn();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
}

const PRODUCTION_ENV = { NODE_ENV: "production", VERCEL_ENV: "production", NEXT_PUBLIC_VERCEL_ENV: "production" };

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

test("collection is blocked on local hosts and outside production", () => {
  for (const hostname of ["localhost", "127.0.0.1", "::1", "[::1]", "0:0:0:0:0:0:0:1", "foo.local", "Foo.LOCAL", "app.localhost"]) {
    assert.equal(isLocalAnalyticsHost(hostname), true, hostname);
    assert.equal(analyticsCollectionAllowed({ hostname, nodeEnv: "production", vercelEnv: "production" }), false, hostname);
  }
  assert.equal(isLocalAnalyticsHost("knowyourole.com"), false);
  assert.equal(isLocalAnalyticsHost("preview.knowyourole.com"), false);

  assert.equal(analyticsCollectionAllowed({ hostname: "knowyourole.com", nodeEnv: "production", vercelEnv: "production" }), true);
  assert.equal(analyticsCollectionAllowed({ hostname: "knowyourole.com", nodeEnv: "production", vercelEnv: "" }), true);
  assert.equal(analyticsCollectionAllowed({ hostname: "knowyourole.com", nodeEnv: "development", vercelEnv: "" }), false);
  assert.equal(analyticsCollectionAllowed({ hostname: "knowyourole.com", nodeEnv: "test", vercelEnv: "" }), false);
  assert.equal(analyticsCollectionAllowed({ hostname: "knowyourole.com", nodeEnv: "production", vercelEnv: "preview" }), false);
  assert.equal(analyticsCollectionAllowed({ hostname: "knowyourole.com", nodeEnv: "production", vercelEnv: "development" }), false);
  assert.equal(analyticsCollectionAllowed({ hostname: "knowyourole.com", nodeEnv: "", vercelEnv: "" }), false);

  assert.deepEqual(internalTrafficFallback({ hostname: "127.0.0.1", nodeEnv: "production", vercelEnv: "production" }), { traffic_type: "internal" });
  assert.equal(internalTrafficFallback({ hostname: "knowyourole.com", nodeEnv: "production", vercelEnv: "production" }), null);

  const blocked = buildMeasurementConfig({
    hostname: "quiz.local",
    nodeEnv: "production",
    vercelEnv: "production",
    page_path: "/quiz",
    page_location: "http://quiz.local/quiz",
  });
  assert.deepEqual(blocked, { load: false, traffic_type: "internal" });
});

test("production measurement keeps utm acquisition and drops bare campaign keys", () => {
  const hit = analyticsHitLocation("https://knowyourole.com/quiz?source=shortform_v2&utm_source=newsletter&utm_medium=email&page=1#start");
  assert.equal(hit.page_path, "/quiz?utm_source=newsletter&utm_medium=email&page=1");
  assert.equal(hit.page_location, "https://knowyourole.com/quiz?utm_source=newsletter&utm_medium=email&page=1#start");
  const decision = buildMeasurementConfig({
    hostname: "knowyourole.com",
    nodeEnv: "production",
    vercelEnv: "production",
    ...hit,
    page_title: "Quiz",
  });
  assert.equal(decision.load, true);
  const measured = new URL(decision.config.page_location);
  assert.equal(measured.searchParams.get("source"), null);
  assert.equal(measured.searchParams.get("utm_source"), "newsletter");
  assert.equal(decision.config.traffic_type, undefined);
  assert.equal(decision.config.anonymize_ip, true);
});

test("internal links rename source to link_location and never set utm params", () => {
  const href = buildInternalHref("/results?page=role&sessionId=abc&source=bottom_nav&utm_source=orbital_v2&utm_medium=internal", {
    source: "result_footer",
    utm_campaign: "quiz_result",
    medium: "nav",
  });
  const built = new URL(href, "https://knowyourole.com");
  assert.equal(built.pathname, "/results");
  assert.equal(built.searchParams.get("page"), "role");
  assert.equal(built.searchParams.get("sessionId"), "abc");
  assert.equal(built.searchParams.get("link_location"), "bottom_nav");
  assert.equal(built.searchParams.get("source"), null);
  assert.equal(built.searchParams.get("utm_source"), null);
  assert.equal(built.searchParams.get("utm_medium"), null);
  assert.equal(built.searchParams.get("utm_campaign"), null);
  assert.equal(built.searchParams.get("medium"), null);
  assert.equal(href.includes("utm_"), false);

  const renamed = new URL(buildInternalHref("/quiz", { source: "orbital_v2", link_location: "bottom_nav", utm_source: "quiz_result" }), "https://knowyourole.com");
  assert.equal(renamed.pathname, "/quiz");
  assert.equal(renamed.searchParams.get("link_location"), "bottom_nav");
  assert.equal(renamed.searchParams.get("source"), null);
  assert.equal(renamed.search, "?link_location=bottom_nav");

  assert.equal(readLinkLocation("?source=result_footer"), "result_footer");
  assert.equal(readLinkLocation("source=quiz_result"), "quiz_result");
  assert.equal(readLinkLocation("?link_location=bottom_nav&source=orbital_v2"), "bottom_nav");
  assert.equal(readLinkLocation("?entry_point=shortform_v2"), "shortform_v2");
  assert.deepEqual(scrubCampaignParams({ source: "bottom_nav", utm_medium: "nav", tier: "25+", link_location: "result_footer" }), {
    tier: "25+",
    link_location: "result_footer",
  });
});

test("gtag is silent off production and renames source when it transmits", () => {
  withAnalyticsEnv(PRODUCTION_ENV, () => {
    const local = installWindow({ analytics: true }, { hostname: "127.0.0.1", href: "http://127.0.0.1:5180/quiz?source=shortform_v2" });
    trackKyrEvent("quiz_started", { source: "shortform_v2", total_questions: 5, email: "person@example.com" });
    assert.equal(local.events.length, 1);
    assert.equal(local.events[0].params.link_location, "shortform_v2");
    assert.equal("source" in local.events[0].params, false);
    assert.equal("email" in local.events[0].params, false);
    assert.equal(local.gtagCalls.length, 0);
  });

  withAnalyticsEnv({ NODE_ENV: "production", VERCEL_ENV: "preview", NEXT_PUBLIC_VERCEL_ENV: "preview" }, () => {
    const preview = installWindow({ analytics: true }, { hostname: "knowyourole.com" });
    trackKyrEvent("quiz_completed", { link_location: "quiz_result" });
    assert.equal(preview.events.length, 1);
    assert.equal(preview.gtagCalls.length, 0);
  });

  withAnalyticsEnv(PRODUCTION_ENV, () => {
    const live = installWindow({ analytics: true }, { hostname: "knowyourole.com" });
    trackKyrEvent("result_section_clicked", { source: "bottom_nav", utm_source: "orbital_v2", medium: "nav" });
    assert.equal(live.gtagCalls.length, 1);
    assert.equal(live.gtagCalls[0][0], "event");
    assert.equal(live.gtagCalls[0][1], "kyr_result_section_clicked");
    assert.equal(live.gtagCalls[0][2].link_location, "bottom_nav");
    assert.equal("source" in live.gtagCalls[0][2], false);
    assert.equal("utm_source" in live.gtagCalls[0][2], false);
    assert.equal("medium" in live.gtagCalls[0][2], false);
  });
});

test("quiz landing and start fire once per attempt, including consent, resume, and retake", () => {
  const now = 1_700_000_000_000;
  let created = 0;
  const createId = () => {
    created += 1;
    return `attempt-${created}`;
  };
  const storage = memoryStorage();
  const landingParams = { link_location: "shortform_v2", total_questions: 5 };
  const startParams = { link_location: "shortform_v2", tier: "25+", total_questions: 5 };

  const firstLanding = noteQuizFunnelEvent(storage, {
    name: "quiz_landing_viewed",
    params: landingParams,
    consent: true,
    createId,
    now,
  });
  const strictLanding = noteQuizFunnelEvent(storage, {
    name: "quiz_landing_viewed",
    params: landingParams,
    consent: true,
    createId,
    now: now + 1,
  });
  const started = noteQuizFunnelEvent(storage, {
    name: "quiz_started",
    params: startParams,
    consent: true,
    createId,
    now: now + 2,
  });
  const startedAgain = noteQuizFunnelEvent(storage, {
    name: "quiz_started",
    params: startParams,
    consent: true,
    createId,
    now: now + 3,
  });
  assert.equal(created, 1);
  assert.deepEqual(firstLanding.emit.map((event) => event.name), ["quiz_landing_viewed"]);
  assert.deepEqual(strictLanding.emit, []);
  assert.deepEqual(started.emit.map((event) => event.name), ["quiz_started"]);
  assert.deepEqual(startedAgain.emit, []);
  assert.equal(beginQuizAttempt(storage, { resume: false, createId, now: now + 4 }).attemptId, "attempt-1");

  const resumed = noteQuizFunnelEvent(storage, {
    name: "quiz_started",
    params: startParams,
    consent: true,
    resume: true,
    createId,
    now: now + QUIZ_ATTEMPT_MAX_AGE_MS + 10,
  });
  assert.equal(resumed.attempt.attemptId, "attempt-1");
  assert.deepEqual(resumed.emit, []);

  closeQuizAttempt(storage);
  const retake = noteQuizFunnelEvent(storage, {
    name: "quiz_landing_viewed",
    params: landingParams,
    consent: true,
    createId,
    now: now + QUIZ_ATTEMPT_MAX_AGE_MS + 20,
  });
  const retakeStart = noteQuizFunnelEvent(storage, {
    name: "quiz_started",
    params: startParams,
    consent: true,
    createId,
    now: now + QUIZ_ATTEMPT_MAX_AGE_MS + 21,
  });
  assert.equal(retake.attempt.attemptId, "attempt-2");
  assert.equal(retakeStart.emit.length, 1);
  assert.equal(loadQuizAttempt(storage).sent.includes("quiz_started"), true);

  const queuedStorage = memoryStorage();
  let queuedIds = 0;
  const queuedCreateId = () => `queued-${++queuedIds}`;
  noteQuizFunnelEvent(queuedStorage, {
    name: "quiz_landing_viewed",
    params: landingParams,
    consent: false,
    createId: queuedCreateId,
    now,
  });
  noteQuizFunnelEvent(queuedStorage, {
    name: "quiz_started",
    params: startParams,
    consent: false,
    createId: queuedCreateId,
    now: now + 1,
  });
  noteQuizFunnelEvent(queuedStorage, {
    name: "quiz_started",
    params: { ...startParams, tier: "13-18" },
    consent: false,
    createId: queuedCreateId,
    now: now + 2,
  });
  assert.deepEqual(flushQuizFunnel(queuedStorage, { consent: false }).emit, []);
  const flushed = flushQuizFunnel(queuedStorage, { consent: true });
  assert.deepEqual(flushed.emit.map((event) => event.name), ["quiz_landing_viewed", "quiz_started"]);
  assert.equal(flushed.emit[1].params.tier, "25+");
  assert.deepEqual(flushQuizFunnel(queuedStorage, { consent: true }).emit, []);
  assert.equal(queuedIds, 1);

  const lateStorage = memoryStorage();
  noteQuizFunnelEvent(lateStorage, {
    name: "quiz_started",
    params: startParams,
    consent: false,
    createId: () => "late-1",
    now,
  });
  closeQuizAttempt(lateStorage);
  const late = flushQuizFunnel(lateStorage, { consent: true });
  assert.deepEqual(late.emit.map((event) => event.name), ["quiz_started"]);
  const ensured = noteQuizFunnelEvent(lateStorage, {
    name: "quiz_started",
    params: startParams,
    consent: true,
    createId: () => "late-2",
    now: now + 5,
  });
  assert.equal(ensured.attempt.attemptId, "late-2");
  assert.equal(ensured.emit.length, 1);
  assert.equal(noteQuizFunnelEvent(lateStorage, {
    name: "quiz_started",
    params: startParams,
    consent: true,
    createId: () => "late-3",
    now: now + 6,
  }).emit.length, 0);
});
