// components/navigation/Header/index.tsx
import { createClient } from "@/lib/supabase/server";
import { FloatingNavClient } from "./navbar-client";
export default async function FloatingNav() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = (data?.claims.user_metadata as { email?: string; role?: string } | null) ?? null;

  return (
    <FloatingNavClient
      userEmail={user?.email ?? null}
      userRole={user?.role ?? null}
    />
  );
}
