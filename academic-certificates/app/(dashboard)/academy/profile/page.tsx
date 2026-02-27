import { AcademyProfile } from "@/app/(dashboard)/academy/_components/profile/academy-profile";
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

    return <AcademyProfile id={user.id} />;
}
