import test from "node:test";
import assert from "node:assert/strict";
import { checkSupabaseTarget, isHostedSupabaseUrl } from "../../src/lib/env/dbGuard.mjs";

const REAL = "https://abcdefghijklmnop.supabase.co";

test("placeholder and local URLs are always allowed", () => {
  for (const url of [undefined, "", "http://127.0.0.1:9", "http://localhost:54321", "https://example.supabase.co"]) {
    assert.equal(isHostedSupabaseUrl(url), false, String(url));
    assert.deepEqual(checkSupabaseTarget({ NEXT_PUBLIC_SUPABASE_URL: url }), { ok: true });
  }
});

test("hosted project is refused locally and on previews", () => {
  assert.equal(checkSupabaseTarget({ NEXT_PUBLIC_SUPABASE_URL: REAL }).ok, false);
  assert.equal(checkSupabaseTarget({ NEXT_PUBLIC_SUPABASE_URL: REAL, VERCEL_ENV: "preview" }).ok, false);
  assert.equal(checkSupabaseTarget({ NEXT_PUBLIC_SUPABASE_URL: REAL, VERCEL_ENV: "development" }).ok, false);
});

test("hosted project is allowed in Vercel production or with explicit opt-in", () => {
  assert.equal(checkSupabaseTarget({ NEXT_PUBLIC_SUPABASE_URL: REAL, VERCEL_ENV: "production" }).ok, true);
  assert.equal(checkSupabaseTarget({ NEXT_PUBLIC_SUPABASE_URL: REAL, KYR_ALLOW_REAL_DB: "1" }).ok, true);
  assert.equal(checkSupabaseTarget({ NEXT_PUBLIC_SUPABASE_URL: REAL, KYR_ALLOW_REAL_DB: "true" }).ok, false);
});
