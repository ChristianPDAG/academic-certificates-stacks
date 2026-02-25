import { UpdatePasswordForm } from "@/components/update-password-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";

export default function Page() {
  return (
    <AuthPageShell>
        <UpdatePasswordForm />
    </AuthPageShell>
  );
}
