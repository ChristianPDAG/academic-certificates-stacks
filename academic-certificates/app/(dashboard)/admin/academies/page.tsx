import { getAllAcademies } from "@/app/actions/admin/academies";
import { AcademiesManagement } from "@/app/admin/components/academies";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AcademiesPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Verificar que el usuario sea admin
    const { data: userData } = await supabase.from("users").select("role").eq("id_user", user.id).single();

    if (userData?.role !== "admin") {
        redirect("/");
    }

    const academies = await getAllAcademies();

    return <AcademiesManagement initialAcademies={academies} />;
}
