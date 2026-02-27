import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Autenticación",
  description: "Acceso y gestión de cuenta en Certifikurs.",
  path: "/auth/login",
  noIndex: true,
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
