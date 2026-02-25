import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AcademyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    return (
        <div className="w-full">
            {children}
        </div>
    );
}