import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kdpouzqjowbuxtfrqsds.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkcG91enFqb3didXh0ZnJxc2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzOTQ5MDcsImV4cCI6MjEwMzk3MDkwN30.WfJ-tqnluu8iPgveNiFXDzrssshsEKAh86h8hNb5C8Y";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});
