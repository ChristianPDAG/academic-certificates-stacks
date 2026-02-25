import { LoginForm } from "@/components/auth/login-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicia Sesión | Certifikurs",
  description: "Accede a tu cuenta para gestionar tus certificados académicos",
};

export default function Page() {
  return (
    <AuthPageShell>
        <LoginForm />
    </AuthPageShell>
  );
}
