import { AdminContent } from "@/app/(dashboard)/admin/_components/dashboard/admin-content";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administrador",
  description: "Panel de administración para gestionar academias y certificados",
};

export default async function AdminPage() {
  return <AdminContent />;
}
