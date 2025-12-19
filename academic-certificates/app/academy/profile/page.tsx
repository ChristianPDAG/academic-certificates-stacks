import { AcademyProfile } from "@/components/academy/academy-profile";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AcademyProfilePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Verificar que el usuario sea una academia
    const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id_user", user.id)
        .single();

    if (userData?.role !== "academy") {
        redirect("/");
    }

    return <AcademyProfile id={user.id} />;
}
