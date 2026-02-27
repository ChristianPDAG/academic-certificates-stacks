"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StacksProvider } from "@/lib/stacks-provider";
import { WalletConnection } from "@/components/wallet-connection";
import { SchoolManagement } from "@/app/(dashboard)/admin/_components/dashboard/manager/school-management";
import { CreditManagement } from "@/app/(dashboard)/admin/_components/dashboard/manager/credit-management";
import { CertificateManagement } from "@/app/(dashboard)/admin/_components/dashboard/manager/certificate-management";
import { DataContractManagement, DataAdminSettings } from "@/app/(dashboard)/admin/_components/dashboard/data";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Settings,
  Shield,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Database,
} from "lucide-react";
import {
  setActiveManagerClient,
  getActiveManagerClient,
  changeSuperAdminRegistryClient,
  getSuperAdminRegistryClient,
} from "@/lib/stacks/admin/registry";

export function AdminContent() {
  const { t } = useTranslation();

  const [activeManager, setActiveManager] = useState("");
  const [superAdmin, setSuperAdmin]       = useState("");
  const [refreshing, setRefreshing]       = useState(false);
  const [loading, setLoading]             = useState(false);

  const [newManager, setNewManager]         = useState("");
  const [newSuperAdmin, setNewSuperAdmin]   = useState("");
  const [showManagerDialog, setShowManagerDialog]       = useState(false);
  const [showSuperAdminDialog, setShowSuperAdminDialog] = useState(false);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const notify = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const loadRegistryData = async () => {
    setRefreshing(true);
    try {
      const [managerData, adminData] = await Promise.all([
        getActiveManagerClient(),
        getSuperAdminRegistryClient(),
      ]);
      setActiveManager(managerData || t("admin.dashboard.notAvailable"));
      setSuperAdmin(adminData   || t("admin.dashboard.notAvailable"));
    } catch {
      notify("error", t("admin.dashboard.loadError"));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { loadRegistryData(); }, []);

  const handleSetActiveManager = async () => {
    if (!newManager.trim()) { notify("error", t("admin.dashboard.validAddressRequired")); return; }
    setLoading(true);
    try {
      await setActiveManagerClient(newManager);
      notify("success", t("admin.dashboard.managerUpdated"));
      setShowManagerDialog(false); setNewManager("");
      setTimeout(() => loadRegistryData(), 3000);
    } catch (err: any) {
      notify("error", `${t("admin.dashboard.managerError")}: ${err}`);
    } finally { setLoading(false); }
  };

  const handleChangeSuperAdmin = async () => {
    if (!newSuperAdmin.trim()) { notify("error", t("admin.dashboard.validAddressRequired")); return; }
    setLoading(true);
    try {
      await changeSuperAdminRegistryClient(newSuperAdmin);
      notify("success", t("admin.dashboard.superAdminUpdated"));
      setShowSuperAdminDialog(false); setNewSuperAdmin("");
      setTimeout(() => loadRegistryData(), 3000);
    } catch (err: any) {
      notify("error", `${t("admin.dashboard.superAdminError")}: ${err}`);
    } finally { setLoading(false); }
  };

  return (
    <StacksProvider>
      <WalletConnection>
        <div className="space-y-8">

          {/* ── Page header ──────────────────────────────────── */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/10">
                  <Settings className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">
                  {t("admin.shell.overview")}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t("admin.dashboard.title")}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t("admin.dashboard.description")}
              </p>
            </div>
          </div>

          {/* ── Feedback banner ──────────────────────────────── */}
          {message && (
            <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "border-red-200 bg-red-50 text-red-800 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300"
            }`}>
              {message.type === "success"
                ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                : <AlertCircle   className="mt-0.5 h-4 w-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* ── Registry ─────────────────────────────────────── */}
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            {/* accent bar */}
            <div className="h-0.5 w-full bg-sky-500" />

            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-500/10">
                    <Settings className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t("admin.dashboard.registryManagement")}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 pl-9">
                  {t("admin.dashboard.registryDescription")}
                </p>
              </div>
              <Button
                variant="outline" size="sm"
                onClick={loadRegistryData}
                disabled={refreshing}
                className="gap-1.5 shrink-0"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                {t("admin.dashboard.refresh")}
              </Button>
            </div>

            <div className="grid gap-3 px-5 pb-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <Shield className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t("admin.dashboard.currentSuperAdmin")}
                  </span>
                </div>
                <p className="truncate font-mono text-xs text-slate-800 dark:text-slate-200">{superAdmin || "—"}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <Settings className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t("admin.dashboard.activeManager")}
                  </span>
                </div>
                <p className="truncate font-mono text-xs text-slate-800 dark:text-slate-200">{activeManager || "—"}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
              <Button size="sm" onClick={() => setShowManagerDialog(true)} className="gap-1.5">
                <Settings className="h-3.5 w-3.5" />
                {t("admin.dashboard.changeActiveManager")}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setShowSuperAdminDialog(true)} className="gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                {t("admin.dashboard.changeSuperAdmin")}
              </Button>
            </div>
          </div>

          {/* ── Certificate Manager ───────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-500/10">
                <Database className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {t("admin.dashboard.managerTitle")}
              </h2>
            </div>
            <SchoolManagement />
            <CreditManagement />
            <CertificateManagement />
          </div>

          {/* ── Certificate Data ──────────────────────────────── */}
          <div className="space-y-4 border-t border-slate-200 pt-8 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
                <Database className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {t("admin.dashboard.dataTitle")}
              </h2>
            </div>
            <DataContractManagement />
            <DataAdminSettings />
          </div>

        </div>

        {/* ── Dialog: Manager ───────────────────────────────── */}
        <Dialog open={showManagerDialog} onOpenChange={setShowManagerDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("admin.dashboard.changeActiveManager")}</DialogTitle>
              <DialogDescription>{t("admin.dashboard.managerDialogDescription")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="new-manager">{t("admin.dashboard.newManagerAddress")}</Label>
                <Input
                  id="new-manager"
                  placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.certificate-manager-v1"
                  value={newManager}
                  onChange={(e) => setNewManager(e.target.value)}
                />
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-300">
                {t("admin.dashboard.superAdminOnlyWarning")}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowManagerDialog(false); setNewManager(""); }} disabled={loading}>
                {t("admin.dashboard.cancel")}
              </Button>
              <Button onClick={handleSetActiveManager} disabled={loading || !newManager.trim()}>
                {loading ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />{t("admin.dashboard.processing")}</> : t("admin.dashboard.confirmChange")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Dialog: Super Admin ───────────────────────────── */}
        <Dialog open={showSuperAdminDialog} onOpenChange={setShowSuperAdminDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("admin.dashboard.changeSuperAdmin")}</DialogTitle>
              <DialogDescription>{t("admin.dashboard.superAdminDialogDescription")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="new-super-admin">{t("admin.dashboard.newSuperAdminAddress")}</Label>
                <Input
                  id="new-super-admin"
                  placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                  value={newSuperAdmin}
                  onChange={(e) => setNewSuperAdmin(e.target.value)}
                />
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-800 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300">
                {t("admin.dashboard.criticalWarning")}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowSuperAdminDialog(false); setNewSuperAdmin(""); }} disabled={loading}>
                {t("admin.dashboard.cancel")}
              </Button>
              <Button variant="destructive" onClick={handleChangeSuperAdmin} disabled={loading || !newSuperAdmin.trim()}>
                {loading ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />{t("admin.dashboard.processing")}</> : t("admin.dashboard.confirmChange")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </WalletConnection>
    </StacksProvider>
  );
}

