import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InfoIcon, School } from "lucide-react";
import { AcademyContent } from "@/components/academy-content";

export default async function AcademyPage() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) {
        redirect("/auth/login");
    }

    return (
        <div className="flex-1 w-full flex flex-col gap-6">
            {/* Main Content with Wallet Integration */}
            <AcademyContent id={data?.claims.sub} />
        </div>
    );
}