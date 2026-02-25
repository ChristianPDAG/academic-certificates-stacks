"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded-2xl border border-neutral-200 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-neutral-900/70 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="text-2xl text-neutral-900 dark:text-neutral-100">{t("auth.updatePassword.title")}</CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-300">
            {t("auth.updatePassword.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">{t("auth.updatePassword.newPassword")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("auth.updatePassword.newPasswordPlaceholder")}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus-visible:ring-sky-500"
                />
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <Button type="submit" className="w-full h-11 bg-sky-500 hover:bg-sky-600 text-white" disabled={isLoading}>
                {isLoading ? t("auth.updatePassword.saving") : t("auth.updatePassword.save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
