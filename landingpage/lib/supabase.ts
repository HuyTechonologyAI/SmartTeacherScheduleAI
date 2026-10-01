import { createClient } from "@supabase/supabase-js";

const CANONICAL_SUPABASE_URL = "https://bdeluacbzbdflxubhpha.supabase.co";
const CANONICAL_ANON_KEY = "sb_publishable_2nBo7eIeJtB3pVL1v239Ag_TJIMHNgq";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const isLegacyUrl = rawUrl && (rawUrl.includes("kdpouzqjowbuxtfrqsds") || rawUrl.includes("your-project"));

const supabaseUrl = (rawUrl && !isLegacyUrl) ? rawUrl : CANONICAL_SUPABASE_URL;

// On server side (Node.js/Next API), prefer service role key if available for full RLS bypass
const supabaseKey = 
  (typeof window === "undefined" && process.env.SUPABASE_SERVICE_ROLE_KEY) ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  CANONICAL_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && !supabaseUrl.includes("your-project.supabase.co") && !supabaseUrl.includes("kdpouzqjowbuxtfrqsds")
);

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

