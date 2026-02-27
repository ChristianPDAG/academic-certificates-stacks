import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudentProfile } from "@/app/(dashboard)/student/_components/student-profile";

export default async function StudentProfilePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/auth/login");
  }

  if (data.user.user_metadata.role !== "student") {
    redirect("/auth/login");
  }

  return <StudentProfile email={data.user.email as string} />;
}
