"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CertificatesTable, CertificateRow } from "@/components/academy/certificates-table";
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
                    : { title: 'Sin título', category: null }
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
            alert("Error al cargar los certificados");
        } finally {
            setLoading(false);
        }
    }, [userId]);

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
            alert("✅ Certificado revocado exitosamente");
        } catch (error: any) {
            console.error("Error revoking certificate:", error);
            alert(`❌ Error al revocar: ${error.message}`);
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
            alert("✅ Certificado reactivado exitosamente");
        } catch (error: any) {
            console.error("Error reactivating certificate:", error);
            alert(`❌ Error al reactivar: ${error.message}`);
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
                    `✅ Sincronizado: Estado en blockchain es "${result.blockchainStatus}". Base de datos actualizada.`
                );
            } else {
                alert(`✅ Ya está sincronizado: Estado "${result.blockchainStatus}"`);
            }
        } catch (error: any) {
            console.error("Error syncing certificate:", error);
            alert(`❌ Error al sincronizar: ${error.message}`);
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
                alert("No hay certificados válidos seleccionados");
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
                    `✅ ${result.success} certificados procesados\n❌ ${result.failed} fallaron\n\nErrores:\n${result.errors.join("\n")}`
                );
            } else {
                alert(`✅ ${result.success} certificados procesados exitosamente`);
            }
        } catch (error: any) {
            console.error("Error in bulk action:", error);
            alert(`❌ Error: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    // Export to CSV
    const handleExport = () => {
        const csvData = filteredAndSortedCertificates.map((cert) => ({
            ID: cert.chain_cert_id || "N/A",
            Estudiante: cert.student_name,
            Email: cert.student_email || "N/A",
            Wallet: cert.student_wallet,
            Curso: cert.id_course?.title || "N/A",
            Calificación: cert.grade || "N/A",
            Estado: cert.status,
            Fecha: new Date(cert.created_at).toLocaleDateString("es-ES"),
            TX_ID: cert.tx_id || "N/A",
        }));

        const headers = Object.keys(csvData[0]).join(",");
        const rows = csvData.map((row) => Object.values(row).join(","));
        const csv = [headers, ...rows].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `certificados_${new Date().toISOString().split("T")[0]}.csv`;
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
        <div className="container mx-auto max-w-7xl py-8 px-4">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Award className="h-8 w-8 text-sky-500" />
                    <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                        Gestión de Certificados
                    </h1>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400">
                    Administra, filtra y sincroniza todos los certificados emitidos por tu academia
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                            {certificates.length}
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Certificados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">
                            {certificates.filter((c) => c.status === "issued").length}
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Activos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-600">
                            {certificates.filter((c) => c.status === "revoked").length}
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Revocados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-amber-600">
                            {certificates.filter((c) => c.status === "draft").length}
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Borradores</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Actions */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filtros y Acciones
                            </CardTitle>
                            <CardDescription>
                                Busca y filtra certificados, realiza acciones en masa
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => loadCertificates(true)} disabled={loading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                                Actualizar
                            </Button>
                            <Button variant="outline" onClick={handleExport} disabled={filteredAndSortedCertificates.length === 0}>
                                <Download className="h-4 w-4 mr-2" />
                                Exportar CSV
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search and filters row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <Label htmlFor="search">Buscar</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <Input
                                    id="search"
                                    placeholder="Nombre, email, wallet o curso..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="status-filter">Estado</Label>
                            <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
                                <SelectTrigger id="status-filter">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="issued">Activos</SelectItem>
                                    <SelectItem value="revoked">Revocados</SelectItem>
                                    <SelectItem value="draft">Borradores</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Bulk actions */}
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-3 p-4 bg-sky-50 dark:bg-sky-950/20 rounded-lg border border-sky-200 dark:border-sky-900">
                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {selectedIds.size} certificado{selectedIds.size > 1 ? "s" : ""} seleccionado{selectedIds.size > 1 ? "s" : ""}
                            </span>
                            <div className="flex gap-2 ml-auto">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setBulkAction("revoke")}
                                    disabled={processing}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Revocar Seleccionados
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => setBulkAction("reactivate")}
                                    disabled={processing}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Reactivar Seleccionados
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedIds(new Set())}
                                >
                                    Limpiar
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardContent className="pt-6">
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
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="items-per-page" className="text-sm">
                                    Por página:
                                </Label>
                                <Select
                                    value={itemsPerPage.toString()}
                                    onValueChange={(val) => setItemsPerPage(parseInt(val))}
                                >
                                    <SelectTrigger id="items-per-page" className="w-20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                                            <SelectItem key={option} value={option.toString()}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
                                    {Math.min(currentPage * itemsPerPage, filteredAndSortedCertificates.length)} de{" "}
                                    {filteredAndSortedCertificates.length}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium">
                                    Página {currentPage} de {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bulk Action Confirmation Dialog */}
            <AlertDialog open={!!bulkAction} onOpenChange={(open) => !open && setBulkAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {bulkAction === "revoke" ? "Revocar Certificados" : "Reactivar Certificados"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro de que deseas {bulkAction === "revoke" ? "revocar" : "reactivar"}{" "}
                            {selectedIds.size} certificado{selectedIds.size > 1 ? "s" : ""}? Esta acción se
                            registrará en la blockchain.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
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
                                    Procesando...
                                </>
                            ) : bulkAction === "revoke" ? (
                                "Revocar Todos"
                            ) : (
                                "Reactivar Todos"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
