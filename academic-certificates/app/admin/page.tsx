import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Settings } from "lucide-react";
import { AdminContent } from "@/app/admin/components/admin-content";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administrador | Certifikurs",
  description: "Panel de administración para gestionar academias y certificados",
};

export default async function AdminPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <main className="relative min-h-screen w-full bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 mt-20">
      {/* Header */}
      {/* Title */}
      <div className="flex flex-col gap-2 items-start mb-4">
        <h1 className="font-bold text-3xl mb-2 flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Administrador del Sistema
        </h1>
        <p className="text-muted-foreground">
          Gestiona academias, certificados y configuración del sistema
        </p>
      </div>

      {/* Main Content with Wallet Integration */}
      <AdminContent />
    </main>
  );
}
