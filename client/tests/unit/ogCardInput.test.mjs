import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ogImagePath, publicPages } from "../../src/lib/seo.ts";
import { OG_DEFAULT_PATH, OG_DEFAULT_TITLE, resolveOgCardInput } from "../../src/app/og/ogCardInput.ts";

const clientRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

function fromCard(title, path) {
  const url = new URL(ogImagePath(title, path), "https://knowyourole.com");
  return resolveOgCardInput(url.searchParams);
}

test("every public page card is accepted with its own title", () => {
  assert.ok(publicPages.length > 10);
  for (const page of publicPages) {
    const resolved = fromCard(page.title, page.path);
    assert.equal(resolved.accepted, true, page.path);
    assert.equal(resolved.path, page.path);
    const expected = new URL(ogImagePath(page.title, page.path), "https://knowyourole.com").searchParams.get("title");
    assert.equal(resolved.title, expected);
  }
});

test("noindex layouts keep the card they already request", () => {
  const pairs = [
    ["/results", "My work style starting point"],
    ["/auth", "Auth | KnowYouRole"],
    ["/callback", "Auth Callback | KnowYouRole"],
    ["/checkout-cancel", "Checkout Cancelled | KnowYouRole"],
    ["/checkout-success", "Checkout Success | KnowYouRole"],
    ["/profile", "Profile | KnowYouRole"],
  ];
  for (const [path, title] of pairs) {
    const resolved = fromCard(title, path);
    assert.equal(resolved.accepted, true, path);
    assert.equal(resolved.path, path);
  }
  const resultsLayout = readFileSync(join(clientRoot, "src/app/results/layout.tsx"), "utf8");
  assert.match(resultsLayout, /My work style starting point/);
});

test("arbitrary text, swapped titles, and unknown params fall back to the default card", () => {
  const attacks = [
    { title: "<script>alert(1)</script>", path: "/" },
    { title: "x".repeat(500), path: "/quiz" },
    { title: "Free personality quiz\nhttps://evil.example", path: "/quiz" },
    { title: publicPages[0].title, path: "/quiz" },
    { title: "INTJ", path: "/results" },
    { title: "result-123", path: "/results/abc" },
  ];
  for (const attack of attacks) {
    const params = new URLSearchParams(attack);
    const resolved = resolveOgCardInput(params);
    assert.equal(resolved.accepted, false);
    assert.equal(resolved.title, OG_DEFAULT_TITLE);
    assert.equal(resolved.path, OG_DEFAULT_PATH);
  }
});

test("a bare /og request stays on the default card", () => {
  const resolved = resolveOgCardInput(new URLSearchParams());
  assert.equal(resolved.title, OG_DEFAULT_TITLE);
  assert.equal(resolved.path, OG_DEFAULT_PATH);
});
