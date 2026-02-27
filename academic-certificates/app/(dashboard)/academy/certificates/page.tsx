"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CertificatesTable, CertificateRow } from "@/app/(dashboard)/academy/_components/certificates/certificates-table";
import {
    Award,
    Search,
    Download,
    RefreshCw,
    Filter,
    XCircle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import {
    getCertificatesByAcademy,
    revokeCertificateAction,
    reactivateCertificateAction,
    syncCertificateStatus,
    updateCertificateStatus,
    bulkRevokeCertificates,
    bulkReactivateCertificates,
} from "@/app/actions/academy/certificates";
import { createClient } from "@/lib/supabase/client";

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedData {
    certificates: CertificateRow[];
    timestamp: number;
}

interface MetadataCache {
    [key: string]: {
        data: any;
        timestamp: number;
    };
}

export default function CertificatesPage() {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [userId, setUserId] = useState<string>("");
    const [certificates, setCertificates] = useState<CertificateRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "issued" | "revoked" | "draft">("all");
    const [dateSort, setDateSort] = useState<"newest" | "oldest">("newest");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [bulkAction, setBulkAction] = useState<"revoke" | "reactivate" | null>(null);
    const [processing, setProcessing] = useState(false);
    const [metadataCache, setMetadataCache] = useState<MetadataCache>({});
    const [sortField, setSortField] = useState<keyof CertificateRow | null>("created_at");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    // Authentication check
    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data } = await supabase.auth.getClaims();

            if (!data?.claims?.sub) {
                router.push("/auth/login");
                return;
            }

            setUserId(data.claims.sub);
        };

        checkAuth();
    }, [router]);

    // Load certificates with caching
    const loadCertificates = useCallback(async (forceRefresh = false) => {
        if (!userId) return;

        try {
            setLoading(true);

            // Check cache
            const cacheKey = `certificates_${userId}`;
            const cached = sessionStorage.getItem(cacheKey);

            if (cached && !forceRefresh) {
                const { certificates: cachedCerts, timestamp }: CachedData = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    setCertificates(cachedCerts);
                    setLoading(false);
                    return;
                }
            }

            // Fetch from server
            const data = await getCertificatesByAcademy(userId);
            console.log("Fetched certificates:", data);
            // Transform data to match CertificateRow structure
            const transformedData: CertificateRow[] = data.map((cert: any) => ({
                ...cert,
                courses: Array.isArray(cert.courses) && cert.courses.length > 0
                    ? cert.courses[0]
                    : { title: t("academy.certificates.table.noTitle"), category: null }
            }));
            setCertificates(transformedData);

            // Cache the data
            const cacheData: CachedData = {
                certificates: transformedData,
                timestamp: Date.now(),
            };
            sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.error("Error loading certificates:", error);
            alert(t("academy.certificates.errorLoading"));
        } finally {
            setLoading(false);
        }
    }, [userId, t]);

    useEffect(() => {
        if (userId) {
            loadCertificates();
        }
    }, [userId, loadCertificates]);

    // Filter and sort logic
    const filteredAndSortedCertificates = useMemo(() => {
        let filtered = certificates;

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (cert) =>
                    cert.student_name.toLowerCase().includes(search) ||
                    cert.student_email?.toLowerCase().includes(search) ||
                    cert.student_wallet.toLowerCase().includes(search) ||
                    cert.id_course?.title.toLowerCase().includes(search)
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter((cert) => cert.status === statusFilter);
        }

        // Sorting
        if (sortField) {
            filtered = [...filtered].sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];

                // Handle nested course title
                if (sortField === "created_at") {
                    aVal = new Date(a.created_at).getTime();
                    bVal = new Date(b.created_at).getTime();
                }

                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

                if (sortDirection === "asc") {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }

        return filtered;
    }, [certificates, searchTerm, statusFilter, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedCertificates.length / itemsPerPage);
    const paginatedCertificates = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredAndSortedCertificates.slice(start, end);
    }, [filteredAndSortedCertificates, currentPage, itemsPerPage]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, itemsPerPage]);

    // Selection handlers
    const handleSelectChange = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedIds(newSelected);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(
                paginatedCertificates
                    .filter((cert) => cert.chain_cert_id !== null)
                    .map((cert) => cert.id_certificate)
            );
            setSelectedIds(allIds);
        } else {
            setSelectedIds(new Set());
        }
    };

    // Action handlers
    const handleRevoke = async (certId: string, chainCertId: number) => {
        try {
            setProcessing(true);
            await revokeCertificateAction(userId, chainCertId);
            await updateCertificateStatus(certId, "revoked");
            await loadCertificates(true);
            alert(`✅ ${t("academy.certificates.successRevoked")}`);
        } catch (error: any) {
            console.error("Error revoking certificate:", error);
            alert(`❌ ${t("academy.certificates.errorRevoke")}: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleReactivate = async (certId: string, chainCertId: number) => {
        try {
            setProcessing(true);
            await reactivateCertificateAction(userId, chainCertId);
            await updateCertificateStatus(certId, "issued");
            await loadCertificates(true);
            alert(`✅ ${t("academy.certificates.successReactivated")}`);
        } catch (error: any) {
            console.error("Error reactivating certificate:", error);
            alert(`❌ ${t("academy.certificates.errorReactivate")}: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleSync = async (certId: string, chainCertId: number) => {
        try {
            const result = await syncCertificateStatus(certId, chainCertId);
            if (result.updated) {
                await loadCertificates(true);
                alert(
                    `✅ ${t("academy.certificates.successSynced")} (${result.blockchainStatus})`
                );
            } else {
                alert(`✅ ${t("academy.certificates.alreadySynced")} (${result.blockchainStatus})`);
            }
        } catch (error: any) {
            console.error("Error syncing certificate:", error);
            alert(`❌ ${t("academy.certificates.errorSync")}: ${error.message}`);
        }
    };

    const handleBulkAction = async () => {
        if (!bulkAction || selectedIds.size === 0) return;

        try {
            setProcessing(true);

            // Get chain cert IDs
            const certIdsToProcess = Array.from(selectedIds)
                .map((id) => {
                    const cert = certificates.find((c) => c.id_certificate === id);
                    return cert?.chain_cert_id;
                })
                .filter((id): id is number => id !== null && id !== undefined);

            if (certIdsToProcess.length === 0) {
                alert(t("academy.certificates.noValidSelected"));
                return;
            }

            let result;
            if (bulkAction === "revoke") {
                result = await bulkRevokeCertificates(userId, certIdsToProcess);
            } else {
                result = await bulkReactivateCertificates(userId, certIdsToProcess);
            }

            // Update DB status for successful ones
            const successIds = Array.from(selectedIds).slice(0, result.success);
            for (const id of successIds) {
                await updateCertificateStatus(id, bulkAction === "revoke" ? "revoked" : "issued");
            }

            await loadCertificates(true);
            setSelectedIds(new Set());
            setBulkAction(null);

            if (result.failed > 0) {
                alert(
                    `✅ ${t("academy.certificates.bulkProcessed", { count: result.success })}\n❌ ${t("academy.certificates.bulkFailed", { count: result.failed })}\n\n${t("academy.certificates.bulkErrors")}:\n${result.errors.join("\n")}`
                );
            } else {
                alert(`✅ ${t("academy.certificates.bulkProcessed", { count: result.success })}`);
            }
        } catch (error: any) {
            console.error("Error in bulk action:", error);
            alert(`❌ ${t("academy.certificates.bulkError")}: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    // Export to CSV
    const handleExport = () => {
        const locale = i18n.language?.startsWith("en") ? "en-US" : "es-ES";
        const csvData = filteredAndSortedCertificates.map((cert) => ({
            [t("academy.certificates.exportHeaders.id")]: cert.chain_cert_id || t("academy.certificates.table.notAvailable"),
            [t("academy.certificates.exportHeaders.student")]: cert.student_name,
            [t("academy.certificates.exportHeaders.email")]: cert.student_email || t("academy.certificates.table.notAvailable"),
            [t("academy.certificates.exportHeaders.wallet")]: cert.student_wallet,
            [t("academy.certificates.exportHeaders.course")]: cert.id_course?.title || t("academy.certificates.table.notAvailable"),
            [t("academy.certificates.exportHeaders.grade")]: cert.grade || t("academy.certificates.table.notAvailable"),
            [t("academy.certificates.exportHeaders.status")]: cert.status,
            [t("academy.certificates.exportHeaders.date")]: new Date(cert.created_at).toLocaleDateString(locale),
            [t("academy.certificates.exportHeaders.txId")]: cert.tx_id || t("academy.certificates.table.notAvailable"),
        }));

        if (csvData.length === 0) return;
        const headers = Object.keys(csvData[0]).join(",");
        const rows = csvData.map((row) => Object.values(row).join(","));
        const csv = [headers, ...rows].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${t("academy.certificates.exportFilePrefix")}_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSort = (field: keyof CertificateRow) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    return (
        <div className="space-y-6">

            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/10">
                            <Award className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">
                            {t("academy.certificates.title")}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {t("academy.certificates.titleHighlight")}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {t("academy.certificates.description")}
                    </p>
                </div>
                <div className="flex gap-2 self-start sm:self-auto">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => loadCertificates(true)} disabled={loading}>
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                        {t("academy.certificates.table.sync")}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport} disabled={filteredAndSortedCertificates.length === 0}>
                        <Download className="h-3.5 w-3.5" />
                        {t("academy.certificates.export")}
                    </Button>
                </div>
            </div>

            {/* ── Stat cards ──────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-sky-500" />
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{t("academy.certificates.stats.total")}</p>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{certificates.length}</p>
                        <Award className="h-5 w-5 text-sky-400 mb-0.5" />
                    </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500" />
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{t("academy.certificates.stats.issued")}</p>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{certificates.filter((c) => c.status === "issued").length}</p>
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-0.5" />
                    </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-500/20 dark:bg-red-500/10">
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-red-500" />
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{t("academy.certificates.stats.revoked")}</p>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold tabular-nums text-red-600 dark:text-red-400">{certificates.filter((c) => c.status === "revoked").length}</p>
                        <XCircle className="h-5 w-5 text-red-500 mb-0.5" />
                    </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-amber-500" />
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{t("academy.certificates.stats.drafts")}</p>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{certificates.filter((c) => c.status === "draft").length}</p>
                        <Filter className="h-5 w-5 text-amber-500 mb-0.5" />
                    </div>
                </div>
            </div>

            {/* ── Toolbar ─────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                        id="search"
                        placeholder={t("academy.certificates.filters.search")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm"
                    />
                </div>
                <div className="flex gap-1.5">
                    {(["all", "issued", "revoked", "draft"] as const).map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setStatusFilter(s)}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                                statusFilter === s
                                    ? "bg-sky-600 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            }`}
                        >
                            {t(`academy.certificates.filters.${s}`)}
                        </button>
                    ))}
                </div>
                {filteredAndSortedCertificates.length > 0 && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {t("academy.certificates.results", { count: filteredAndSortedCertificates.length })}
                    </span>
                )}
            </div>

            {/* ── Bulk actions ────────────────────────────────────────── */}
            {selectedIds.size > 0 && (
                <div className="flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 dark:border-sky-800/50 dark:bg-sky-950/30">
                    <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">
                        {selectedIds.size} {t("academy.certificates.bulkActions.selected")}
                    </span>
                    <div className="flex gap-2 ml-auto">
                        <Button size="sm" variant="destructive" className="h-7 gap-1 text-xs" onClick={() => setBulkAction("revoke")} disabled={processing}>
                            <XCircle className="h-3 w-3" />
                            {t("academy.certificates.dialogs.revoke")}
                        </Button>
                        <Button size="sm" className="h-7 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setBulkAction("reactivate")} disabled={processing}>
                            <CheckCircle2 className="h-3 w-3" />
                            {t("academy.certificates.dialogs.reactivate")}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSelectedIds(new Set())}>
                            {t("academy.certificates.dialogs.cancel")}
                        </Button>
                    </div>
                </div>
            )}

            {/* ── Table card ──────────────────────────────────────────── */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="h-0.5 w-full bg-sky-500" />
                <CertificatesTable
                    certificates={paginatedCertificates}
                    selectedIds={selectedIds}
                    onSelectChange={handleSelectChange}
                    onSelectAll={handleSelectAll}
                    onRevoke={handleRevoke}
                    onReactivate={handleReactivate}
                    onSync={handleSync}
                    loading={loading}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="items-per-page" className="text-xs text-slate-500 dark:text-slate-400">
                                {t("academy.certificates.pagination.itemsPerPage")}
                            </Label>
                            <Select
                                value={itemsPerPage.toString()}
                                onValueChange={(val) => setItemsPerPage(parseInt(val))}
                            >
                                <SelectTrigger id="items-per-page" className="h-7 w-16 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                                        <SelectItem key={option} value={option.toString()} className="text-xs">
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredAndSortedCertificates.length)} {t("academy.certificates.pagination.of")} {filteredAndSortedCertificates.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Button variant="outline" size="sm" className="h-7 w-7 p-0"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 px-1">
                                {currentPage} / {totalPages}
                            </span>
                            <Button variant="outline" size="sm" className="h-7 w-7 p-0"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bulk Action Confirmation Dialog */}
            <AlertDialog open={!!bulkAction} onOpenChange={(open) => !open && setBulkAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {bulkAction === "revoke" ? t("academy.certificates.dialogs.revokeTitle") : t("academy.certificates.dialogs.reactivateTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {bulkAction === "revoke" 
                                ? t("academy.certificates.dialogs.revokeDescription")
                                : t("academy.certificates.dialogs.reactivateDescription")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>{t("academy.certificates.dialogs.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkAction}
                            disabled={processing}
                            className={
                                bulkAction === "revoke"
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-green-600 hover:bg-green-700"
                            }
                        >
                            {processing ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    {t("academy.certificates.dialogs.processing")}
                                </>
                            ) : bulkAction === "revoke" ? (
                                t("academy.certificates.dialogs.revoke")
                            ) : (
                                t("academy.certificates.dialogs.reactivate")
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
