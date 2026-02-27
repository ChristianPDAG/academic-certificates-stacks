import { AcademyShell } from "@/app/(dashboard)/academy/_components/layout/academy-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AcademyLayout({
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
        return redirect("/auth/login");
    }

    const claims = claimsData?.claims as
        | { app_metadata?: { role?: string }; user_metadata?: { role?: string } }
        | undefined;
    const roleFromClaims =
        claims?.app_metadata?.role || claims?.user_metadata?.role;

    if (roleFromClaims) {
        if (roleFromClaims !== "academy") {
            redirect("/");
        }
    } else {
        const { data: dbUser } = await supabase
            .from("users")
            .select("role")
            .eq("id_user", user.id)
            .single();

        if (dbUser?.role !== "academy") {
            redirect("/");
        }
    }

    return <AcademyShell>{children}</AcademyShell>;
}
