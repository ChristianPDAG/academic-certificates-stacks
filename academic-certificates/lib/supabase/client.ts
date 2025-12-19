import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/config/env/env.client"

export function createClient() {
  return createBrowserClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
  );
}
