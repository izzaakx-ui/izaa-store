import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error("Missing Supabase URL or publishable key.");
}

export const supabase = createClient(url, key, {
  global: {
    fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
  },
});
