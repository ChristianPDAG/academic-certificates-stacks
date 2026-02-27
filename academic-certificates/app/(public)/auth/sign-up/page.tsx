import { SignUpForm } from "@/components/auth/sign-up-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro de Estudiante",
  description: "Regístrate como estudiante para validar y gestionar tus certificados académicos",
};

export default function Page() {
  return (
    <AuthPageShell>
        <SignUpForm
          type="student"
        />
    </AuthPageShell>
  );
}
