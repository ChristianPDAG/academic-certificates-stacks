import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudentCertificates } from "@/app/(dashboard)/student/_components/student-certificates";

export default async function StudentCertificatesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/auth/login");
  }

  if (data.user.user_metadata.role !== "student") {
    redirect("/auth/login");
  }

  return <StudentCertificates email={data.user.email as string} />;
}
