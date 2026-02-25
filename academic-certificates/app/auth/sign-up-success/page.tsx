"use client";

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
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {t("auth.signupSuccess.title")}
              </CardTitle>
              <CardDescription>{t("auth.signupSuccess.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("auth.signupSuccess.message")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
