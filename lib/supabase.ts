import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gealgvgsnhskyrbbnxay.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlYWxndmdzbmhza3lyYmJueGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MjM2NzEsImV4cCI6MjA5NjQ5OTY3MX0.Cx7HazV2sW85bKBFYiML4RcaXPDoWpcMBH8Xp8oU7Vc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
