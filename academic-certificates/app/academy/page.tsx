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
            {/* Header */}
            <div className="w-full">
                <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
                    <InfoIcon size="16" strokeWidth={2} />
                    Panel de Academia - Sistema de Certificación Blockchain
                </div>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-2 items-start">
                <h1 className="font-bold text-3xl mb-2 flex items-center gap-2">
                    <School className="h-8 w-8" />
                    Academia
                </h1>
                <p className="text-muted-foreground">
                    Emite certificados verificables para tus estudiantes
                </p>
            </div>

            {/* Main Content with Wallet Integration */}
            <AcademyContent />
        </div>
    );
}