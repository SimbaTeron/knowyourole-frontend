import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
import { getOptionalAuthUser } from "@/app/api/_lib/auth";
import { getSupabaseAdmin } from "@/app/api/_lib/supabase";

const CAPABILITY_HEADER = "x-kyr-anonymous-capability";
const CAPABILITY_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function createAnonymousCapability(): { token: string; tokenHash: string; expiresAt: string } {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: hashAnonymousCapability(token),
    expiresAt: new Date(Date.now() + CAPABILITY_TTL_MS).toISOString(),
  };
}

export function hashAnonymousCapability(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export async function canAccessResult(req: NextRequest, result: { user_id: string | null; session_id: string | null }): Promise<boolean> {
  const user = await getOptionalAuthUser(req);
  if (result.user_id) return user?.sub === result.user_id;
  if (!result.session_id) return false;

  const token = req.headers.get(CAPABILITY_HEADER);
  if (!token || token.length < 40 || token.length > 200) return false;
  const submittedHash = hashAnonymousCapability(token);
  const { data, error } = await getSupabaseAdmin()
    .from("anonymous_result_capabilities")
    .select("token_hash")
    .eq("session_id", result.session_id)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error || !data) return false;

  const expected = Buffer.from(data.token_hash, "hex");
  const submitted = Buffer.from(submittedHash, "hex");
  return expected.length === submitted.length && timingSafeEqual(expected, submitted);
}

export async function deleteAnonymousResult(sessionId: string, token: string): Promise<boolean> {
  if (!sessionId || !token || token.length < 40 || token.length > 200) return false;
  const supabase = getSupabaseAdmin();
  const tokenHash = hashAnonymousCapability(token);
  const { data: capability, error } = await supabase
    .from("anonymous_result_capabilities")
    .select("token_hash")
    .eq("session_id", sessionId)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error || !capability) return false;

  const expected = Buffer.from(capability.token_hash, "hex");
  const submitted = Buffer.from(tokenHash, "hex");
  if (expected.length !== submitted.length || !timingSafeEqual(expected, submitted)) return false;

  const { data, error: deleteError } = await supabase.rpc("delete_anonymous_result_data", { p_session_id: sessionId });
  if (deleteError) throw new Error(deleteError.message);
  return data === true;
}

export { CAPABILITY_HEADER, CAPABILITY_TTL_MS };
