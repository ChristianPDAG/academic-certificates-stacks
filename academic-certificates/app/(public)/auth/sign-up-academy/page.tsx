import { SignUpForm } from "@/components/auth/sign-up-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro de Academia",
  description: "Regístrate como academia para emitir y gestionar certificados académicos",
};

export default function Page2() {
  return (
    <AuthPageShell>
        <SignUpForm
          type="academy"
        />
    </AuthPageShell>
  );
}
