import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentDashboard from "@/components/student-dashboard";

export default async function StudentPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }
  if (data.user.user_metadata.role !== "student") {
    redirect("/auth/login");
  }
  const dataUser = {
    id: data.user.id as string,
    email: data.user.email as string,
  }
  return <StudentDashboard user={dataUser} />;
}
