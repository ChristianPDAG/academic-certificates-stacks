import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentDashboard from "@/components/student-dashboard";

export default async function StudentPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }
  const dataUser = {
    id: data.claims.sub,
    email: data.claims.email,
  }
  return <StudentDashboard user={dataUser} />;
}
