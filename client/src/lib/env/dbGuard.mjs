// @ts-check
/**
 * Refuses to connect to a hosted Supabase project outside Vercel production.
 * Local dev, CI, box servers and Vercel previews get a clear error instead of
 * silently reading or writing the live database.
 *
 * Opt in explicitly (for example a deliberate read-only debug session):
 *   KYR_ALLOW_REAL_DB=1
 *
 * Plain .mjs so next.config.ts, API routes and node tests can all import it.
 */

export const REAL_DB_OPT_IN_VAR = "KYR_ALLOW_REAL_DB";

/** Hostnames that are placeholders, never a real project. */
const PLACEHOLDER_HOSTS = new Set(["example.supabase.co"]);

/** @param {string | undefined} url */
export function isHostedSupabaseUrl(url) {
  if (!url) return false;
  let host;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  if (PLACEHOLDER_HOSTS.has(host)) return false;
  return host.endsWith(".supabase.co") || host.endsWith(".supabase.com");
}

/**
 * @param {Record<string, string | undefined>} env
 * @returns {{ ok: true } | { ok: false; reason: string }}
 */
export function checkSupabaseTarget(env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!isHostedSupabaseUrl(url)) return { ok: true };
  if (env.VERCEL_ENV === "production") return { ok: true };
  if (env[REAL_DB_OPT_IN_VAR] === "1") return { ok: true };
  const where = env.VERCEL_ENV ? `Vercel ${env.VERCEL_ENV}` : "a non-Vercel environment";
  return {
    ok: false,
    reason:
      `Refusing to use the hosted Supabase project (${url}) from ${where}. ` +
      `Only Vercel production may use it. Point NEXT_PUBLIC_SUPABASE_URL at a local or dead address ` +
      `(see scripts/box-bootstrap.sh), or set ${REAL_DB_OPT_IN_VAR}=1 if you really mean it.`,
  };
}

/** @param {Record<string, string | undefined>} [env] */
export function assertSafeSupabaseTarget(env = process.env) {
  const result = checkSupabaseTarget(env);
  if (!result.ok) throw new Error(result.reason);
}
