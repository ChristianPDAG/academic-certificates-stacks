
import { AdminShell } from "@/app/(dashboard)/admin/_components/layout/admin-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const [{ data: userDataResponse }, { data: claimsData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getClaims(),
  ]);
  const user = userDataResponse.user;

  if (!user) {
    redirect("/auth/login");
  }

  const claims = claimsData?.claims as
    | { app_metadata?: { role?: string }; user_metadata?: { role?: string } }
    | undefined;
  const roleFromClaims =
    claims?.app_metadata?.role || claims?.user_metadata?.role;

  if (roleFromClaims) {
    if (roleFromClaims !== "admin") {
      redirect("/");
    }
  } else {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id_user", user.id)
      .single();

    if (userData?.role !== "admin") {
      redirect("/");
    }
  }

  return <AdminShell>{children}</AdminShell>;
}
