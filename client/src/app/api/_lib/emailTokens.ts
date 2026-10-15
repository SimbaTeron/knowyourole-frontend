import { createHash, createHmac, timingSafeEqual } from "crypto";
import type { ResultEmailSummary } from "@/lib/email/emailRequestCore";

/**
 * Stateless signed tokens for email links. Nothing secret is stored in the DB:
 *  - action tokens (confirm / unsubscribe / delete) sign the purpose + a hash of the email
 *  - the private result link signs the summary snapshot only (never the email)
 */
export type EmailTokenPurpose = "confirm" | "unsubscribe" | "delete";

const DEV_SECRET = "kyr-dev-only-email-token-secret-not-for-production";

export function isProductionEnv(): boolean {
  return process.env.VERCEL_ENV === "production";
}

export function getEmailTokenSecret(): string | null {
  const secret = process.env.EMAIL_TOKEN_SECRET;
  if (secret && secret.length >= 32) return secret;
  return isProductionEnv() ? null : DEV_SECRET;
}

function hmac(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data, "utf8").digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Keyed hash of a normalized email; used as the lookup key and rate-limit bucket. */
export function hashEmail(normalizedEmail: string, secret: string): string {
  return createHmac("sha256", secret).update(`email:${normalizedEmail}`, "utf8").digest("hex");
}

export function hashBucket(kind: string, value: string, secret: string): string {
  return `${kind}:${createHash("sha256").update(`${secret}:${kind}:${value}`, "utf8").digest("hex").slice(0, 40)}`;
}

export function createActionToken(purpose: EmailTokenPurpose, emailHash: string, secret: string): string {
  const body = `${purpose}.${emailHash}`;
  return `${Buffer.from(body).toString("base64url")}.${hmac(body, secret)}`;
}

export function verifyActionToken(token: unknown, purpose: EmailTokenPurpose, secret: string): string | null {
  if (typeof token !== "string" || token.length > 400) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;
  let body: string;
  try { body = Buffer.from(encoded, "base64url").toString("utf8"); } catch { return null; }
  if (!safeEqual(sig, hmac(body, secret))) return null;
  const [tokenPurpose, emailHash] = body.split(".");
  if (tokenPurpose !== purpose || !/^[a-f0-9]{64}$/.test(emailHash || "")) return null;
  return emailHash;
}

export function createSummaryToken(summary: ResultEmailSummary, secret: string): string {
  const body = Buffer.from(JSON.stringify(summary)).toString("base64url");
  return `${body}.${hmac(`summary.${body}`, secret)}`;
}

export function verifySummaryToken(token: unknown, secret: string): ResultEmailSummary | null {
  if (typeof token !== "string" || token.length > 3000) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig || !safeEqual(sig, hmac(`summary.${body}`, secret))) return null;
  try { return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as ResultEmailSummary; } catch { return null; }
}
