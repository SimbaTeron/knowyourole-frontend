import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const analytics = await import(pathToFileURL(join(root, "src/lib/analytics.ts")).href);
const gate = await import(pathToFileURL(join(root, "src/lib/analytics/collectionGate.ts")).href);
const hosts = await import(pathToFileURL(join(root, "src/lib/analytics/productionHost.ts")).href);
const pageViews = await import(pathToFileURL(join(root, "src/lib/analytics/pageView.ts")).href);
const gtagReady = await import(pathToFileURL(join(root, "src/lib/analytics/gtagReady.ts")).href);
const bannerModule = await import(pathToFileURL(join(root, "src/components/CookieConsentBanner.tsx")).href);
const links = await import(pathToFileURL(join(root, "src/lib/analytics/internalLink.ts")).href);
const attempts = await import(pathToFileURL(join(root, "src/lib/analytics/quizAttempt.ts")).href);
const funnel = await import(pathToFileURL(join(root, "src/lib/analytics/quizFunnel.ts")).href);
const { crossedQuizMilestones, forSchoolsClickEvent, quizProgressMilestone, trackKyrEvent } = analytics;
const {
  analyticsCollectionAllowed,
  buildMeasurementConfig,
  internalTrafficFallback,
  isCanonicalAnalyticsHost,
  isLanAnalyticsHost,
  isLocalAnalyticsHost,
  isVercelAppHost,
} = gate;
const { canonicalHostRedirect, canonicalHostRedirects } = hosts;
const { claimNavigationPageView, installTagConfig, navigationPagePath, resetNavigationPageViews } = pageViews;
const { KYR_GTAG_READY_EVENT } = gtagReady;
const { cookieBannerPlacement, consentFromChoice, focusMainContent, shouldShowCookieBanner } = bannerModule;
const { analyticsHitLocation, buildInternalHref, readLinkLocation, scrubCampaignParams } = links;
const {
  QUIZ_ATTEMPT_MAX_AGE_MS,
  beginQuizAttempt,
  closeQuizAttempt,
  flushQuizFunnel,
  loadQuizAttempt,
  noteQuizFunnelEvent,
} = attempts;
const { flushPendingQuizFunnel, recordQuizFunnelEvent } = funnel;

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

test("collection is blocked off the canonical production host", () => {
  for (const hostname of ["localhost", "127.0.0.1", "::1", "[::1]", "0:0:0:0:0:0:0:1", "foo.local", "Foo.LOCAL", "app.localhost"]) {
    assert.equal(isLocalAnalyticsHost(hostname), true, hostname);
    assert.equal(analyticsCollectionAllowed({ hostname, nodeEnv: "production", vercelEnv: "production" }), false, hostname);
  }
  assert.equal(isLocalAnalyticsHost("knowyourole.com"), false);
  assert.equal(isLocalAnalyticsHost("preview.knowyourole.com"), false);

  assert.equal(isCanonicalAnalyticsHost("knowyourole.com"), true);
  assert.equal(isCanonicalAnalyticsHost("www.knowyourole.com"), false);
  assert.equal(analyticsCollectionAllowed({ hostname: "knowyourole.com", nodeEnv: "production", vercelEnv: "production" }), true);
  assert.equal(analyticsCollectionAllowed({ hostname: "knowyourole.com", nodeEnv: "production", vercelEnv: "" }), true);
  assert.equal(analyticsCollectionAllowed({ hostname: "knowyourole.com", nodeEnv: "development", vercelEnv: "" }), true);
  assert.equal(analyticsCollectionAllowed({ hostname: "knowyourole.com", nodeEnv: "test", vercelEnv: "" }), true);
  assert.equal(analyticsCollectionAllowed({ hostname: "knowyourole.com", nodeEnv: "production", vercelEnv: "preview" }), true);
  assert.equal(analyticsCollectionAllowed({ hostname: "knowyourole.com", nodeEnv: "production", vercelEnv: "development" }), true);
  assert.equal(analyticsCollectionAllowed({ hostname: "knowyourole.com", nodeEnv: "", vercelEnv: "" }), true);
  assert.equal(analyticsCollectionAllowed({ hostname: "knowyourole.vercel.app", nodeEnv: "production", vercelEnv: "production" }), false);
  assert.equal(analyticsCollectionAllowed({ hostname: "192.168.1.8", nodeEnv: "production", vercelEnv: "production" }), false);

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

  const leaked = analyticsHitLocation("https://knowyourole.com/feedback?resultId=result-1&sessionId=session-1&result_id=result-2&session_id=session-2&utm_source=newsletter");
  const leakedHit = JSON.stringify(leaked);
  assert.equal(leakedHit.includes("resultId"), false);
  assert.equal(leakedHit.includes("sessionId"), false);
  assert.equal(leakedHit.includes("result_id"), false);
  assert.equal(leakedHit.includes("session_id"), false);
  assert.equal(leakedHit.includes("result-1"), false);
  assert.equal(leakedHit.includes("session-1"), false);
  assert.match(leaked.page_location, /utm_source=newsletter/);
  const leakedConfig = buildMeasurementConfig({
    hostname: "knowyourole.com",
    nodeEnv: "production",
    vercelEnv: "production",
    ...leaked,
  });
  const serialized = JSON.stringify(leakedConfig);
  assert.equal(serialized.includes("resultId"), false);
  assert.equal(serialized.includes("sessionId"), false);
  assert.equal(serialized.includes("result-1"), false);
  assert.equal(serialized.includes("session-1"), false);
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

test("gtag is silent off the production hostname and renames source when it transmits", () => {
  withAnalyticsEnv(PRODUCTION_ENV, () => {
    const local = installWindow({ analytics: true }, { hostname: "127.0.0.1", href: "http://127.0.0.1:5180/quiz?source=shortform_v2" });
    trackKyrEvent("quiz_started", { source: "shortform_v2", total_questions: 5, email: "person@example.com" });
    assert.equal(local.events.length, 1);
    assert.equal(local.events[0].params.link_location, "shortform_v2");
    assert.equal("source" in local.events[0].params, false);
    assert.equal("email" in local.events[0].params, false);
    assert.equal(local.gtagCalls.length, 0);
  });

  withAnalyticsEnv(PRODUCTION_ENV, () => {
    const preview = installWindow({ analytics: true }, { hostname: "knowyourole-git-preview.vercel.app" });
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

const GTAG_READY_EVENT = KYR_GTAG_READY_EVENT;
const BANNER_BODY = "We use optional analytics cookies.";

function eventBus() {
  const listeners = new Map();
  return {
    addEventListener(type, fn) {
      const list = listeners.get(type) ?? [];
      list.push(fn);
      listeners.set(type, list);
    },
    removeEventListener(type, fn) {
      const list = listeners.get(type) ?? [];
      listeners.set(type, list.filter((item) => item !== fn));
    },
    dispatchEvent(event) {
      for (const fn of [...(listeners.get(event.type) ?? [])]) fn(event);
      return true;
    },
  };
}

function installFunnelWindow({ hostname, consent, href }) {
  const gtagCalls = [];
  const events = [];
  const storage = memoryStorage();
  let consentState = consent;
  let gtag = null;
  const bus = eventBus();
  const windowStub = {
    location: {
      hostname,
      href: href ?? `https://${hostname}/quiz`,
      pathname: "/quiz",
      search: "",
    },
    sessionStorage: storage,
    localStorage: {
      getItem(key) {
        if (key !== "kyr_cookie_consent" || !consentState) return null;
        return JSON.stringify({
          necessary: true,
          analytics: Boolean(consentState.analytics),
          marketing: false,
          timestamp: "2026-10-17T00:00:00.000Z",
          version: 1,
        });
      },
      setItem() {},
    },
    addEventListener: bus.addEventListener,
    removeEventListener: bus.removeEventListener,
    dispatchEvent: bus.dispatchEvent,
    __kyrAnalyticsEvents: events,
  };
  Object.defineProperty(windowStub, "gtag", {
    configurable: true,
    enumerable: true,
    get() {
      return gtag ?? undefined;
    },
    set(value) {
      gtag = value;
    },
  });
  globalThis.window = windowStub;
  return {
    events,
    gtagCalls,
    storage,
    setConsent(next) {
      consentState = next;
    },
    installGtag() {
      windowStub.gtag = (...args) => {
        gtagCalls.push(args);
      };
    },
    markGtagReady() {
      windowStub.dispatchEvent({ type: GTAG_READY_EVENT });
    },
  };
}

test("queued quiz_started and quiz_landing_viewed flush only after gtag is ready", () => {
  withAnalyticsEnv(PRODUCTION_ENV, () => {
    const harness = installFunnelWindow({ hostname: "knowyourole.com", consent: null });
    const landing = { link_location: "shortform_v2", total_questions: 5 };
    const started = { link_location: "shortform_v2", tier: "25+", total_questions: 5 };
    recordQuizFunnelEvent("quiz_landing_viewed", landing);
    recordQuizFunnelEvent("quiz_started", started);

    const queued = loadQuizAttempt(harness.storage);
    assert.deepEqual(queued.sent, []);
    assert.deepEqual(queued.pending.map((event) => event.name), ["quiz_landing_viewed", "quiz_started"]);

    harness.setConsent({ analytics: true });
    flushPendingQuizFunnel();

    const beforeTag = loadQuizAttempt(harness.storage);
    assert.deepEqual(beforeTag.sent, [], "consent must not mark the queue sent before gtag exists");
    assert.deepEqual(beforeTag.pending.map((event) => event.name), ["quiz_landing_viewed", "quiz_started"]);
    assert.equal(harness.gtagCalls.length, 0);
    assert.equal(harness.events.length, 0);

    harness.installGtag();
    harness.markGtagReady();

    const afterTag = loadQuizAttempt(harness.storage);
    assert.deepEqual(afterTag.sent, ["quiz_landing_viewed", "quiz_started"]);
    assert.deepEqual(afterTag.pending, []);
    assert.deepEqual(harness.gtagCalls.map((call) => call[1]), ["kyr_quiz_landing_viewed", "kyr_quiz_started"]);
    assert.equal(harness.gtagCalls[1][2].tier, "25+");
    assert.equal(harness.events.length, 2);

    harness.markGtagReady();
    flushPendingQuizFunnel();
    assert.equal(harness.gtagCalls.length, 2);
  });
});

test("page_view is sent before the queued funnel events on the same page", () => {
  withAnalyticsEnv(PRODUCTION_ENV, () => {
    const harness = installFunnelWindow({ hostname: "knowyourole.com", consent: null });
    recordQuizFunnelEvent("quiz_landing_viewed", { link_location: "shortform_v2", total_questions: 5 });
    recordQuizFunnelEvent("quiz_started", { link_location: "shortform_v2", tier: "25+", total_questions: 5 });
    harness.setConsent({ analytics: true });
    flushPendingQuizFunnel();
    const order = [];
    globalThis.window.__kyrSendPageView = () => order.push("page_view");
    harness.installGtag();
    const current = globalThis.window.gtag;
    globalThis.window.gtag = (...args) => {
      order.push(args[1]);
      current(...args);
    };
    harness.markGtagReady();
    assert.deepEqual(order, ["page_view", "kyr_quiz_landing_viewed", "kyr_quiz_started"]);
  });
});

test("consent already stored still waits for gtag, and reject or blocked hosts never transmit", () => {
  withAnalyticsEnv(PRODUCTION_ENV, () => {
    const early = installFunnelWindow({ hostname: "knowyourole.com", consent: { analytics: true } });
    recordQuizFunnelEvent("quiz_landing_viewed", { link_location: "shortform_v2", total_questions: 5 });
    assert.deepEqual(loadQuizAttempt(early.storage).sent, []);
    assert.equal(early.gtagCalls.length, 0);
    early.installGtag();
    early.markGtagReady();
    assert.deepEqual(early.gtagCalls.map((call) => call[1]), ["kyr_quiz_landing_viewed"]);
    assert.equal(loadQuizAttempt(early.storage).sent.includes("quiz_landing_viewed"), true);

    const rejected = installFunnelWindow({ hostname: "knowyourole.com", consent: null });
    recordQuizFunnelEvent("quiz_started", { link_location: "shortform_v2", tier: "25+", total_questions: 5 });
    rejected.setConsent({ analytics: false });
    rejected.installGtag();
    flushPendingQuizFunnel();
    rejected.markGtagReady();
    assert.equal(rejected.gtagCalls.length, 0);
    assert.deepEqual(loadQuizAttempt(rejected.storage).sent, []);

    for (const hostname of ["127.0.0.1", "192.168.1.40", "10.1.2.3", "172.16.4.4", "knowyourole.vercel.app", "my-app-git-preview.vercel.app", "www.knowyourole.com"]) {
      const blocked = installFunnelWindow({ hostname, consent: null, href: `http://${hostname}/quiz` });
      recordQuizFunnelEvent("quiz_landing_viewed", { link_location: "shortform_v2", total_questions: 5 });
      recordQuizFunnelEvent("quiz_started", { link_location: "shortform_v2", tier: "13-18", total_questions: 5 });
      blocked.setConsent({ analytics: true });
      blocked.installGtag();
      flushPendingQuizFunnel();
      blocked.markGtagReady();
      assert.equal(blocked.gtagCalls.length, 0, hostname);
    }
  });
});

test("collection follows the production hostname, not the build environment", () => {
  const productionEnv = { nodeEnv: "production", vercelEnv: "production" };
  assert.equal(analyticsCollectionAllowed({ hostname: "knowyourole.com", ...productionEnv }), true);
  assert.equal(analyticsCollectionAllowed({ hostname: "KnowYouRole.com", ...productionEnv }), true);
  assert.equal(analyticsCollectionAllowed({ hostname: "knowyourole.com.", nodeEnv: "development", vercelEnv: "" }), true);
  assert.equal(analyticsCollectionAllowed({ hostname: "www.knowyourole.com", ...productionEnv }), false);
  assert.equal(isVercelAppHost("knowyourole.vercel.app"), true);
  assert.equal(isVercelAppHost("my-app-git-feature-team.vercel.app"), true);
  assert.equal(isLanAnalyticsHost("192.168.0.12"), true);
  assert.equal(isLanAnalyticsHost("10.0.0.8"), true);
  assert.equal(isLanAnalyticsHost("172.16.0.1"), true);
  assert.equal(isLanAnalyticsHost("172.31.255.4"), true);
  assert.equal(isLanAnalyticsHost("169.254.1.1"), true);
  assert.equal(isLanAnalyticsHost("::ffff:192.168.1.20"), true);
  assert.equal(isLanAnalyticsHost("fd12:3456::1"), true);
  assert.equal(isLanAnalyticsHost("172.15.0.1"), false);
  assert.equal(isLanAnalyticsHost("172.32.0.1"), false);
  assert.equal(isLanAnalyticsHost("11.0.0.1"), false);
  assert.equal(isLanAnalyticsHost("knowyourole.com"), false);
  for (const hostname of [
    "knowyourole.vercel.app",
    "knowyourole-abc123.vercel.app",
    "my-app-git-feature-team.vercel.app",
    "localhost",
    "127.0.0.1",
    "192.168.0.12",
    "10.0.0.8",
    "172.31.255.4",
    "172.15.0.1",
    "169.254.1.1",
    "preview.knowyourole.com",
    "www.knowyourole.com",
  ]) {
    assert.equal(analyticsCollectionAllowed({ hostname, ...productionEnv }), false, hostname);
  }
  assert.equal(analyticsCollectionAllowed({ hostname: "knowyourole.com", nodeEnv: "development", vercelEnv: "preview" }), true);
  assert.equal(analyticsCollectionAllowed({ hostname: "knowyourole.com", nodeEnv: "test", vercelEnv: "" }), true);
  assert.equal(analyticsCollectionAllowed({ hostname: "", nodeEnv: "production", vercelEnv: "production" }), false);
});

test("quiz visits show the existing consent banner without a second page_view config", () => {
  const banner = readFileSync(join(root, "src/components/CookieConsentBanner.tsx"), "utf8");
  const analyticsComponent = readFileSync(join(root, "src/components/GoogleAnalytics.tsx"), "utf8");
  const layout = readFileSync(join(root, "src/app/layout.tsx"), "utf8");
  const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");
  assert.equal(banner.includes("!isQuizRoute"), false);
  assert.equal(banner.includes(BANNER_BODY), true);
  assert.match(banner, />\s*Reject\s*</);
  assert.match(banner, />\s*Accept\s*</);
  assert.equal((banner.match(/className="kyr-cookie-choice"/g) || []).length, 2);
  assert.equal(banner.includes("Reject non-essential"), false);
  assert.equal(banner.includes("Accept all"), false);
  assert.equal(banner.includes("Manage preferences"), false);
  assert.equal(banner.includes("kyr-cookie-quiz-flow"), false);
  assert.equal(banner.includes("fixed inset-0"), false);
  assert.equal(banner.includes("results-sheet"), false);
  assert.match(banner, /position: fixed/);
  assert.match(banner, /padding-bottom: var\(--kyr-consent-bar, 0px\)/);
  assert.match(banner, /data-kyr-consent/);
  const quizSource = readFileSync(join(root, "src/components/ShortformV2Quiz.tsx"), "utf8");
  assert.match(quizSource, /kyr-quiz-viewport/);
  assert.equal(banner.includes("overflow-y: auto"), false);
  assert.match(banner, /quiz-question-screen/);
  assert.match(banner, /overflow: hidden !important/);
  assert.match(banner, /scroll-margin-bottom: calc\(var\(--kyr-consent-bar, 0px\) \+ 12px\)/);
  assert.match(banner, /focusMainContent\(document, window\)/);
  assert.equal(cookieBannerPlacement("/quiz"), "bottom-bar");
  assert.equal(cookieBannerPlacement("/quiz/start"), "bottom-bar");
  assert.equal(cookieBannerPlacement("/results"), "bottom-bar");
  assert.equal(cookieBannerPlacement("/"), "bottom-bar");
  assert.equal(consentFromChoice("accept", "2026-10-30T00:00:00.000Z").analytics, true);
  assert.equal(consentFromChoice("accept", "2026-10-30T00:00:00.000Z").marketing, false);
  assert.equal(consentFromChoice("reject", "2026-10-30T00:00:00.000Z").analytics, false);
  assert.equal(consentFromChoice("reject", "2026-10-30T00:00:00.000Z").marketing, false);
  assert.equal(consentFromChoice("reject", "2026-10-30T00:00:00.000Z").necessary, true);
  const focused = [];
  const view = {
    scrollY: 240,
    scrollTo(x, y) { this.scrollY = y; focused.push(`scroll:${x},${y}`); },
  };
  const main = {
    tabIndex: -1,
    focus(options) { focused.push(options); view.scrollY = 0; },
  };
  assert.equal(focusMainContent({ querySelector: () => main }, view), true);
  assert.equal(main.tabIndex, -1);
  assert.deepEqual(focused[0], { preventScroll: true });
  assert.equal(view.scrollY, 240);
  assert.equal(shouldShowCookieBanner({ showBanner: true, onboardingActive: false }), true);
  assert.equal(shouldShowCookieBanner({ showBanner: true, onboardingActive: true }), false);
  assert.match(analyticsComponent, /INSTALL_CONFIG_JSON/);
  assert.match(analyticsComponent, /KYR_GTAG_READY_EVENT/);
  assert.match(analyticsComponent, /claimNavigationPageView/);
  assert.match(analyticsComponent, /__kyrSendPageView/);
  assert.equal(analyticsComponent.includes("useSearchParams"), false);
  assert.equal(analyticsComponent.includes("page_path: pageUrl.pathname"), false);
  assert.equal(installTagConfig().send_page_view, false);
  assert.equal(installTagConfig().anonymize_ip, true);
  assert.equal(KYR_GTAG_READY_EVENT, "kyr-gtag-ready");
  assert.equal(layout.includes("kyr-consent-reserve"), false);
  assert.equal(layout.includes("data-kyr-consent"), false);
  assert.match(layout, /ConsentBeforePaint/);
  const beforePaint = readFileSync(join(root, "src/components/ConsentBeforePaint.tsx"), "utf8");
  assert.match(beforePaint, /kyr_cookie_consent/);
  assert.match(beforePaint, /data-kyr-consent/);
  assert.match(beforePaint, /--kyr-consent-bar/);
  assert.match(banner, /if \(readCookieConsent\(\)\)/);
  assert.match(banner, /reserved !== height/);
  assert.match(nextConfig, /canonicalHostRedirects/);
  const decision = buildMeasurementConfig({
    hostname: "knowyourole.com",
    nodeEnv: "production",
    vercelEnv: "production",
    page_path: "/quiz",
    page_location: "https://knowyourole.com/quiz",
    page_title: "Quiz",
  });
  assert.equal(decision.load, true);
  assert.equal(decision.config.send_page_view, true);
  assert.equal(decision.config.anonymize_ip, true);

  resetNavigationPageViews();
  const home = "https://knowyourole.com/";
  const quiz = "https://knowyourole.com/quiz?utm_source=newsletter";
  assert.equal(navigationPagePath(quiz), "/quiz");
  assert.equal(claimNavigationPageView(home), true);
  assert.equal(claimNavigationPageView(home), false);
  assert.equal(claimNavigationPageView(quiz), true);
  assert.equal(claimNavigationPageView("https://knowyourole.com/quiz?page=2"), false);
  assert.equal(claimNavigationPageView(home), true);
  resetNavigationPageViews();

  assert.equal(claimNavigationPageView("https://knowyourole.com/quiz"), true);
  assert.equal(claimNavigationPageView("https://knowyourole.com/results"), true);
  assert.equal(claimNavigationPageView("https://knowyourole.com/results?page=main"), false);
  assert.equal(claimNavigationPageView("https://knowyourole.com/results?page=role"), false);
  assert.equal(claimNavigationPageView("https://knowyourole.com/results?page=mbti"), false);
  assert.equal(claimNavigationPageView("https://knowyourole.com/results?page=disc#share"), false);
  assert.equal(claimNavigationPageView("https://knowyourole.com/quiz"), true);
  assert.equal(claimNavigationPageView("https://knowyourole.com/results?page=share"), true);
  resetNavigationPageViews();

  assert.equal(canonicalHostRedirect("www.knowyourole.com", "/quiz", "?page=1"), "https://knowyourole.com/quiz?page=1");
  assert.equal(canonicalHostRedirect("WWW.KnowYouRole.com.", "/", ""), "https://knowyourole.com/");
  assert.equal(canonicalHostRedirect("knowyourole.com", "/quiz", ""), null);
  assert.equal(canonicalHostRedirect("knowyourole.vercel.app", "/", ""), null);
  const rules = canonicalHostRedirects();
  assert.equal(rules.every((rule) => rule.permanent && rule.has[0].value === "www.knowyourole.com"), true);
  assert.match(rules.map((rule) => rule.destination).join(" "), /https:\/\/knowyourole\.com/);
});
