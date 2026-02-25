"use client";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { use } from "react";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const { t } = useTranslation();
  const params = use(searchParams);

  return (
    <AuthPageShell>
        <div className="flex flex-col gap-6">
          <Card className="rounded-2xl border border-neutral-200 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-neutral-900/70 dark:border-neutral-800">
            <CardHeader>
              <CardTitle className="text-2xl text-neutral-900 dark:text-neutral-100">
                {t("auth.error.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {params?.error ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  {t("auth.error.codeError")}: {params.error}
                </p>
              ) : (
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  {t("auth.error.unspecifiedError")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
    </AuthPageShell>
  );
}
