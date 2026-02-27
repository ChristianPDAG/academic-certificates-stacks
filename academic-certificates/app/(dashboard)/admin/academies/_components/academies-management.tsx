"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getAllAcademies } from "@/app/actions/admin/academies";
import { AcademyCard } from "./academy-card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  School,
  Search,
  RefreshCw,
  TrendingUp,
  Users,
  Award,
  Coins,
} from "lucide-react";

interface Academy {
  id_academy: string;
  legal_name: string;
  contact_academy_email: string;
  stacks_address: string;
  credits: number;
  validation_status: string;
  created_at: string;
  disabled_at: string | null;
}

interface AcademiesManagementProps {
  initialAcademies: Academy[];
}

type FilterStatus = "all" | "active" | "inactive" | "pending";

export function AcademiesManagement({ initialAcademies }: AcademiesManagementProps) {
  const { t } = useTranslation();
  const [academies, setAcademies]       = useState<Academy[]>(initialAcademies);
  const [searchTerm, setSearchTerm]     = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const data = await getAllAcademies();
      setAcademies(data);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filtered = academies.filter((a) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      a.legal_name.toLowerCase().includes(q) ||
      a.contact_academy_email.toLowerCase().includes(q) ||
      a.stacks_address.toLowerCase().includes(q);

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active"   && !a.disabled_at) ||
      (filterStatus === "inactive" && !!a.disabled_at) ||
      (filterStatus === "pending"  && a.validation_status === "pending");

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total:        academies.length,
    active:       academies.filter((a) => !a.disabled_at).length,
    pending:      academies.filter((a) => a.validation_status === "pending").length,
    totalCredits: academies.reduce((s, a) => s + (a.credits || 0), 0),
  };

  const statCards = [
    {
      label:   t("admin.academies.stats.totalAcademies"),
      value:   stats.total,
      icon:    Users,
      color:   "text-sky-500 dark:text-sky-400",
      bg:      "bg-sky-500/10",
      border:  "border-sky-500/20",
      accent:  "bg-sky-500",
    },
    {
      label:  t("admin.academies.stats.active"),
      value:  stats.active,
      icon:   TrendingUp,
      color:  "text-emerald-600 dark:text-emerald-400",
      bg:     "bg-emerald-500/10",
      border: "border-emerald-500/20",
      accent: "bg-emerald-500",
    },
    {
      label:  t("admin.academies.stats.pending"),
      value:  stats.pending,
      icon:   Award,
      color:  "text-amber-600 dark:text-amber-400",
      bg:     "bg-amber-500/10",
      border: "border-amber-500/20",
      accent: "bg-amber-500",
    },
    {
      label:  t("admin.academies.stats.totalCredits"),
      value:  stats.totalCredits,
      icon:   Coins,
      color:  "text-violet-600 dark:text-violet-400",
      bg:     "bg-violet-500/10",
      border: "border-violet-500/20",
      accent: "bg-violet-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-neutral-200 bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10">
                <School className="h-4 w-4 text-sky-500 dark:text-sky-400" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">
                {t("admin.academies.sectionLabel")}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {t("admin.academies.title")}{" "}
              <span className="text-sky-600 dark:text-sky-400">
                {t("admin.academies.titleHighlight")}
              </span>
            </h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {t("admin.academies.description")}
            </p>
          </div>

          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="sm"
            className="self-start gap-2 bg-sky-500 text-white hover:bg-sky-600 sm:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t("admin.academies.refresh")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, border, accent }) => (
          <div
            key={label}
            className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/70"
          >
            <div className={`absolute inset-x-0 top-0 h-0.5 ${accent}`} />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{label}</p>
                <p className={`mt-1 text-3xl font-bold tabular-nums ${color}`}>{value}</p>
              </div>
              <div className={`rounded-xl border p-2 ${bg} ${border}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/70 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder={t("admin.academies.search.placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { value: "all", label: t("admin.academies.filter.all") },
              { value: "active", label: t("admin.academies.filter.active") },
              { value: "pending", label: t("admin.academies.filter.pending") },
              { value: "inactive", label: t("admin.academies.filter.inactive") },
            ] as { value: FilterStatus; label: string }[]
          ).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilterStatus(value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                filterStatus === value
                  ? "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                  : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white/80 py-20 shadow-lg backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-900/70">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <School className="h-7 w-7 text-neutral-400" />
          </div>
          <p className="text-base font-semibold text-neutral-700 dark:text-neutral-300">
            {t("admin.academies.noResults")}
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {searchTerm || filterStatus !== "all"
              ? t("admin.academies.changeFilters")
              : t("admin.academies.noAcademies")}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {t("admin.academies.results")}
            </span>
            <Badge className="border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300">
              {filtered.length}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filtered.map((academy) => (
              <AcademyCard
                key={academy.id_academy}
                academy={academy}
                onUpdate={handleRefresh}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
