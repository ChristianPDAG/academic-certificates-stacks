import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { InfoIcon, Settings } from "lucide-react";
import { AdminContent } from "@/components/admin-content";

export default async function AdminPage() {
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
          Panel de Administración - Gestión de Certificados Académicos
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-2 items-start">
        <h1 className="font-bold text-3xl mb-2 flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Administrador del Sistema
        </h1>
        <p className="text-muted-foreground">
          Gestiona academias, certificados y configuración del sistema
        </p>
      </div>

      {/* Main Content with Wallet Integration */}
      <AdminContent userClaims={data.claims} />
    </div>
  );
}
