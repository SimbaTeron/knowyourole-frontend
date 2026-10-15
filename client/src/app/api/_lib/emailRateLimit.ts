import { MemoryRateLimiter } from "@/lib/email/emailRequestCore";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";

const memory = new MemoryRateLimiter();

/**
 * Two layers: an in-process counter (cheap, per serverless instance) and a
 * shared Postgres counter via public.email_rate_limit_hit (service role only).
 * Buckets are keyed hashes, never raw IPs or emails.
 */
export async function allowRateLimited(bucket: string, max: number, windowSeconds: number): Promise<boolean> {
  if (!memory.hit(bucket, max, windowSeconds)) return false;
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return true; // local dev without DB
  try {
    const { data, error } = await getSupabaseAdmin().rpc("email_rate_limit_hit", {
      p_bucket: bucket,
      p_window_seconds: windowSeconds,
      p_max: max,
    });
    if (error) {
      console.error("[email rate limit] rpc failed", { code: error.code });
      return true; // fail open on DB hiccup; in-memory layer still applies
    }
    return data === true;
  } catch {
    return true;
  }
}

export function getClientIp(headers: Headers): string {
  return (headers.get("x-forwarded-for") || "").split(",")[0].trim() || headers.get("x-real-ip") || "unknown";
}
