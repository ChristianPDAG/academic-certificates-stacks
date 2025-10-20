// components/navigation/Header/index.tsx
import { createClient } from "@/lib/supabase/server";
import { FloatingNavClient } from "./navbar-client";
export default async function FloatingNav() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = (data?.claims as { email?: string } | null) ?? null;

  const hasEnvVars =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

  return (
    <FloatingNavClient
      userEmail={user?.email ?? null}
      hasEnvVars={hasEnvVars}
    />
  );
}
