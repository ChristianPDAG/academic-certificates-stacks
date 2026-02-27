"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Award, CheckCircle2, AlertCircle, Loader2, XCircle, GraduationCap } from "lucide-react";
import { useStudentData } from "@/app/(dashboard)/student/_components/use-student-data";

interface StudentOverviewProps {
  email: string;
}

export function StudentOverview({ email }: StudentOverviewProps) {
  const { t, i18n } = useTranslation();
  const { data, loading, error } = useStudentData({ email });

  const stats = useMemo(() => {
    const certificates = data?.certificates || [];
    return {
      total: certificates.length,
      issued: certificates.filter((c) => c.status === "issued").length,
      revoked: certificates.filter((c) => c.status === "revoked").length,
    };
  }, [data?.certificates]);

  const recentCertificates = useMemo(() => (data?.certificates || []).slice(0, 3), [data?.certificates]);

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
      <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/50 dark:bg-red-950/30">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
        <div>
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">{t("studentPortal.common.errorTitle")}</p>
          <p className="text-xs text-red-700 dark:text-red-300">
            {error === "no-stacks-address"
              ? t("studentPortal.common.noStacksAddress")
              : t("studentPortal.common.errorGeneric")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/10">
            <GraduationCap className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">
            {t("studentPortal.overview.title")}
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("studentPortal.overview.welcome", {
            name: data.fullName || email.split("@")[0],
          })}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("studentPortal.overview.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-sky-500" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            {t("studentPortal.overview.stats.total")}
          </p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{stats.total}</p>
            <Award className="h-5 w-5 text-sky-500 mb-0.5" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            {t("studentPortal.overview.stats.issued")}
          </p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{stats.issued}</p>
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-0.5" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-500/20 dark:bg-red-500/10">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-red-500" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            {t("studentPortal.overview.stats.revoked")}
          </p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold tabular-nums text-red-600 dark:text-red-400">{stats.revoked}</p>
            <XCircle className="h-5 w-5 text-red-500 mb-0.5" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="h-0.5 w-full bg-sky-500" />
        <div className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            {t("studentPortal.overview.wallet")}
          </p>
          <p className="truncate rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {data.stacksAddress}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="h-0.5 w-full bg-sky-500" />
        <div className="p-5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            {t("studentPortal.overview.recentTitle")}
          </h2>
          {recentCertificates.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("studentPortal.common.noCertificates")}</p>
          ) : (
            <div className="space-y-2">
              {recentCertificates.map((certificate) => (
                <div
                  key={certificate.id_certificate}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {certificate.courses?.title || t("studentPortal.common.notAvailable")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(certificate.created_at).toLocaleDateString(
                        i18n.language?.startsWith("en") ? "en-US" : "es-ES"
                      )}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {certificate.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
