"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Award, ExternalLink, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useStudentData } from "@/app/(dashboard)/student/_components/use-student-data";

interface StudentCertificatesProps {
  email: string;
}

export function StudentCertificates({ email }: StudentCertificatesProps) {
  const { t, i18n } = useTranslation();
  const { data, loading, error } = useStudentData({ email });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "issued" | "revoked" | "draft">("all");

  const filtered = useMemo(() => {
    const certificates = data?.certificates || [];
    return certificates.filter((c) => {
      const matchesSearch =
        !searchTerm ||
        c.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.academies?.legal_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data?.certificates, searchTerm, statusFilter]);

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
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/10">
            <Award className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">
            {t("studentPortal.certificates.title")}
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("studentPortal.certificates.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("studentPortal.certificates.description")}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder={t("studentPortal.certificates.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "issued", "revoked", "draft"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === status
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {t(`studentPortal.certificates.filters.${status}`)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{t("studentPortal.common.noCertificates")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((certificate) => (
            <div
              key={certificate.id_certificate}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="h-0.5 w-full bg-sky-500" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {certificate.courses?.title || t("studentPortal.common.notAvailable")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {certificate.academies?.legal_name || t("studentPortal.common.notAvailable")}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {certificate.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">{t("studentPortal.certificates.id")}</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">#{certificate.chain_cert_id}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">{t("studentPortal.certificates.date")}</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {new Date(certificate.created_at).toLocaleDateString(
                        i18n.language?.startsWith("en") ? "en-US" : "es-ES"
                      )}
                    </p>
                  </div>
                </div>

                {certificate.tx_id && (
                  <a
                    href={`https://explorer.hiro.so/txid/${certificate.tx_id}?chain=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t("studentPortal.certificates.viewTx")}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
