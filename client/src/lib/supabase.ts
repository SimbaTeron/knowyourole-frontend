import { createClient } from "@supabase/supabase-js";

function requirePublicEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required to initialize the browser Supabase client`);
  }
  return value;
}

const supabaseUrl = requirePublicEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = requirePublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// App Router API routes are served from the same Next origin.
export const API_BASE = "/api";
