"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function LogoutButton({ className, variant = "default", size = "default" }: LogoutButtonProps = {}) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh(); // Fuerza refresco para que el navbar se actualice
  };

  return <Button className={className} variant={variant} size={size} onClick={logout}>Logout</Button>;
}
