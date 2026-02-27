"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Mail, UserRound, Wallet, ShieldCheck } from "lucide-react";
import { useStudentData } from "@/app/(dashboard)/student/_components/use-student-data";

interface StudentProfileProps {
  email: string;
}

export function StudentProfile({ email }: StudentProfileProps) {
  const { t } = useTranslation();
  const { data, loading, error } = useStudentData({ email });

  const safeName = useMemo(() => data?.fullName || email.split("@")[0], [data?.fullName, email]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500 dark:text-slate-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-sky-500" />
        <span>{t("studentPortal.common.loading")}</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {error === "no-stacks-address" ? t("studentPortal.common.noStacksAddress") : t("studentPortal.common.errorGeneric")}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("studentPortal.profile.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("studentPortal.profile.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="h-0.5 w-full bg-sky-500" />
          <div className="p-5">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <UserRound className="h-3.5 w-3.5 text-sky-500" />
              {t("studentPortal.profile.fullName")}
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{safeName}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="h-0.5 w-full bg-sky-500" />
          <div className="p-5">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Mail className="h-3.5 w-3.5 text-sky-500" />
              {t("studentPortal.profile.email")}
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{email}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="h-0.5 w-full bg-sky-500" />
        <div className="p-5">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Wallet className="h-3.5 w-3.5 text-sky-500" />
            {t("studentPortal.profile.wallet")}
          </p>
          <p className="break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {data.stacksAddress}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 dark:border-sky-800/50 dark:bg-sky-950/30">
        <p className="flex items-start gap-2 text-xs text-sky-800 dark:text-sky-300">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t("studentPortal.profile.securityNote")}
        </p>
      </div>
    </div>
  );
}
