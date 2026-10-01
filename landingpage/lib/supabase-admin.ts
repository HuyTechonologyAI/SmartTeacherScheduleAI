import { createClient } from "@supabase/supabase-js";

// Canonical Server-side Supabase client for EduViet Gateway
// Connects to HuyAI (org-02-aischool) control/data plane
// NEVER expose this client to the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bdeluacbzbdflxubhpha.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
