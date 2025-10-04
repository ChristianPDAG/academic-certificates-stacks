import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentDashboard from "@/components/student-dashboard";

export default async function StudentPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return <StudentDashboard user={data.claims} />;
}
