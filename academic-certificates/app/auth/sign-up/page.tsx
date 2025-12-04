import { SignUpForm } from "@/components/auth/sign-up-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro de Estudiante | Certifikurs",
  description: "Regístrate como estudiante para validar y gestionar tus certificados académicos",
};

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm mt-12">
        <SignUpForm
          type="student"
        />
      </div>
    </div>
  );
}
