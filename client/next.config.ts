import type { NextConfig } from "next";
import { canonicalHostRedirects } from "./src/lib/analytics/productionHost";
import { checkSupabaseTarget } from "./src/lib/env/dbGuard.mjs";

// Local/box/CI dev and builds must never point at the hosted Supabase project.
// (On Vercel, previews still build; the server-side guard in api/_lib/supabase.ts
// refuses the hosted project at runtime outside production.)
if (process.env.VERCEL !== "1") {
  const dbTarget = checkSupabaseTarget(process.env);
  if (!dbTarget.ok) throw new Error(dbTarget.reason);
}

const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
const connectSources = [
  "'self'",
  "https://*.supabase.co",
  "https://www.google-analytics.com",
  "https://region1.google-analytics.com",
  "https://api.zippopotam.us",
  auth0Domain ? `https://${auth0Domain}` : "",
].filter(Boolean).join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
  `connect-src ${connectSources}`,
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // Still inlined for diagnostics. Analytics collection is gated on the
  // hostname (knowyourole.com), not on this value.
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? "",
  },
  reactStrictMode: true,
  async redirects() {
    return canonicalHostRedirects();
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        { key: "Content-Security-Policy", value: contentSecurityPolicy },
      ],
    }];
  },
};

export default nextConfig;
