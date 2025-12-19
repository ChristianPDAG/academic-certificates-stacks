import { SignUpForm } from "@/components/auth/sign-up-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro de Academia | Certifikurs",
  description: "Regístrate como academia para emitir y gestionar certificados académicos",
};

export default function Page2() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm mt-12">
        <SignUpForm
          type="academy"
        />
      </div>
    </div>
  );
}
