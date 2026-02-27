import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AcademyContent } from "@/app/(dashboard)/academy/_components/create-certificate/academy-content";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Academia",
    description: "Administra tu academia y certificados académicos",
};

export default async function AcademyPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    return <AcademyContent id={user.id} />;
}
