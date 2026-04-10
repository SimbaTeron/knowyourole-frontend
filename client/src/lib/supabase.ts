import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://rflvyrcoczhrmmpkowch.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmbHZ5cmNvY3pocm1tcGtvd2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyODUzODgsImV4cCI6MjA4OTg2MTM4OH0.GmK8JJibxBAg8tFndF7Q8tYyA0FRqCnZcxR2biCpiAQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API base URL — serverless functions on Vercel
export const API_BASE = import.meta.env.VITE_API_URL || "/api";