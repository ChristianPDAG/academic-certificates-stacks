import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar Contraseña | Certifikurs",
  description: "Recupera el acceso a tu cuenta",
};

export default function Page() {
  return (
    <AuthPageShell>
        <ForgotPasswordForm />
    </AuthPageShell>
  );
}
