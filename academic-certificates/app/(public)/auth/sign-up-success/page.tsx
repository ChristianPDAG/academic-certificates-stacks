"use client";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function Page() {
  const { t } = useTranslation();
  
  return (
    <AuthPageShell>
        <div className="flex flex-col gap-6">
          <Card className="rounded-2xl border border-neutral-200 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-neutral-900/70 dark:border-neutral-800">
            <CardHeader>
              <CardTitle className="text-2xl text-neutral-900 dark:text-neutral-100">
                {t("auth.signupSuccess.title")}
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-300">
                {t("auth.signupSuccess.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                {t("auth.signupSuccess.message")}
              </p>
            </CardContent>
          </Card>
        </div>
    </AuthPageShell>
  );
}
