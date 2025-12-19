import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AcademyContent } from "@/components/academy/academy-content";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Academia | Certifikurs",
    description: "Administra tu academia y certificados académicos",
};

export default async function AcademyPage() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
        redirect("/auth/login");
    }
    if (data.user.user_metadata.role !== "academy") {
        redirect("/auth/login");
    }
    return (
        <div className="flex-1 w-full flex flex-col gap-6">
            {/* Main Content with Wallet Integration */}
            <AcademyContent id={data?.user.id} />
        </div>
    );
}