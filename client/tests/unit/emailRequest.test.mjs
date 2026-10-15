import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getAgeGateState, buildConsentFlags, decideStorage, isValidEmail, normalizeEmail,
  parseEmailRequest, sanitizeSummary, MemoryRateLimiter, EMAIL_CARD_COPY,
} from "../../src/lib/email/emailRequestCore.ts";

const summary = { identity: "Systems Builder", mbtiType: "INTJ", discLabel: "Conscientious", topTraits: "Openness", clarityHeading: "Clear result", roleTitle: "Product Strategist", snapshot: "A calm planner." };
const good = { email: "Kid@Example.com ", ageGatePassed: true, updates: false, website: "", summary };

test("age gate: unanswered shows nothing", () => {
  assert.deepEqual(getAgeGateState("unanswered"), { showEmailField: false, showUnder13Help: false, ageGatePassed: false });
});
test("age gate: yes shows the email field", () => {
  const s = getAgeGateState("yes"); assert.equal(s.showEmailField, true); assert.equal(s.ageGatePassed, true);
});
test("age gate: no hides email and shows help", () => {
  const s = getAgeGateState("no"); assert.equal(s.showEmailField, false); assert.equal(s.showUnder13Help, true); assert.equal(s.ageGatePassed, false);
});
test("age question is neutral", () => {
  assert.equal(EMAIL_CARD_COPY.ageQuestion, "Are you 13 or older?");
});
test("server rejects missing / false / truthy-non-boolean age gate", () => {
  for (const ageGatePassed of [undefined, false, "true", 1]) {
    const r = parseEmailRequest({ ...good, ageGatePassed });
    assert.equal(r.ok, false); assert.equal(r.reason, "age_gate");
  }
});

test("consent: default is send-only, nothing stored", () => {
  const f = buildConsentFlags({ updatesChecked: undefined, ageGatePassed: true });
  assert.deepEqual(f, { send_only: true, updates: false });
  assert.equal(decideStorage(f), "none");
});
test("consent: only literal true opts in to updates", () => {
  for (const v of ["true", 1, "on", null]) assert.equal(buildConsentFlags({ updatesChecked: v, ageGatePassed: true }).updates, false);
  const f = buildConsentFlags({ updatesChecked: true, ageGatePassed: true });
  assert.deepEqual(f, { send_only: false, updates: true });
  assert.equal(decideStorage(f), "store_pending_confirmation");
});
test("consent: no flags without age gate", () => {
  assert.equal(buildConsentFlags({ updatesChecked: true, ageGatePassed: false }), null);
  assert.equal(decideStorage(null), "none");
});

test("email validation", () => {
  for (const e of ["a@b.co", "first.last+tag@sub.example.org", "  X@Y.io "]) assert.equal(isValidEmail(e), true, e);
  for (const e of ["", "plain", "a@b", "a@b.c", "a..b@c.com", ".a@c.com", "a@-c.com", "a b@c.com", "a@c.com<script>", 42, null, "x".repeat(250) + "@a.com"]) assert.equal(isValidEmail(e), false, String(e));
  assert.equal(normalizeEmail("  Kid@Example.COM "), "kid@example.com");
});

test("parse: valid request normalizes email", () => {
  const r = parseEmailRequest(good);
  assert.equal(r.ok, true); assert.equal(r.email, "kid@example.com"); assert.deepEqual(r.flags, { send_only: true, updates: false });
});
test("parse: honeypot is silently dropped", () => {
  assert.deepEqual(parseEmailRequest({ ...good, website: "http://spam" }), { ok: false, reason: "honeypot" });
});
test("parse: invalid email / summary / body", () => {
  assert.equal(parseEmailRequest({ ...good, email: "nope" }).reason, "invalid_email");
  assert.equal(parseEmailRequest({ ...good, summary: { ...summary, mbtiType: "XXXX" } }).reason, "invalid_summary");
  assert.equal(parseEmailRequest(null).reason, "invalid_body");
});
test("summary sanitizer strips markup and caps length", () => {
  const s = sanitizeSummary({ ...summary, roleTitle: "<b>Hi</b>", snapshot: "x".repeat(1000) });
  assert.equal(s.roleTitle.includes("<"), false); assert.equal(s.snapshot.length, 320);
});

test("memory rate limiter", () => {
  const rl = new MemoryRateLimiter(); const t = 1_000_000_000_000;
  assert.equal(rl.hit("k", 2, 60, t), true); assert.equal(rl.hit("k", 2, 60, t), true); assert.equal(rl.hit("k", 2, 60, t), false);
  assert.equal(rl.hit("k", 2, 60, t + 61_000), true);
});
