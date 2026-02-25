import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAcademyIdByUserId } from "@/app/actions/academy/credentials";
import { CoursesContent } from "@/components/academy/courses-content";

export default async function CoursesPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const academyId = await getAcademyIdByUserId(user.id);

    return <CoursesContent academyId={academyId} />;
}
