"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
    AlertCircle,
    CheckCircle2,
    ExternalLink,
    RefreshCw,
    XCircle,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
} from "lucide-react";

export interface CertificateRow {
    id_certificate: string;
    chain_cert_id: number | null;
    student_name: string;
    student_email: string | null;
    student_wallet: string;
    grade: string | null;
    status: string;
    created_at: string;
    tx_id: string | null;
    metadata_uri: string | null;
    id_course?: {
        title: string;
        category: string | null;
    };
}

interface CertificatesTableProps {
    certificates: CertificateRow[];
    selectedIds: Set<string>;
    onSelectChange: (id: string, checked: boolean) => void;
    onSelectAll: (checked: boolean) => void;
    onRevoke: (certId: string, chainCertId: number) => Promise<void>;
    onReactivate: (certId: string, chainCertId: number) => Promise<void>;
    onSync: (certId: string, chainCertId: number) => Promise<void>;
    loading: boolean;
    sortField: keyof CertificateRow | null;
    sortDirection: "asc" | "desc";
    onSort: (field: keyof CertificateRow) => void;
}

export function CertificatesTable({
    certificates,
    selectedIds,
    onSelectChange,
    onSelectAll,
    onRevoke,
    onReactivate,
    onSync,
    loading,
    sortField,
    sortDirection,
    onSort,
}: CertificatesTableProps) {
    const [actionCert, setActionCert] = useState<{ id: string; chainId: number; action: "revoke" | "reactivate" } | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleActionConfirm = async () => {
        if (!actionCert) return;

        setProcessing(true);
        try {
            if (actionCert.action === "revoke") {
                await onRevoke(actionCert.id, actionCert.chainId);
            } else {
                await onReactivate(actionCert.id, actionCert.chainId);
            }
        } finally {
            setProcessing(false);
            setActionCert(null);
        }
    };

    const allSelected = certificates.length > 0 && certificates.every(cert => selectedIds.has(cert.id_certificate));
    const someSelected = certificates.some(cert => selectedIds.has(cert.id_certificate)) && !allSelected;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "issued":
                return <Badge className="bg-green-500 hover:bg-green-600 text-white">Activo</Badge>;
            case "revoked":
                return <Badge className="bg-red-500 hover:bg-red-600 text-white">Revocado</Badge>;
            case "draft":
                return <Badge variant="outline" className="text-amber-600 border-amber-600">Borrador</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const SortIcon = ({ field }: { field: keyof CertificateRow }) => {
        if (sortField !== field) {
            return <ChevronsUpDown className="h-4 w-4 text-neutral-400" />;
        }
        return sortDirection === "asc" ? (
            <ChevronUp className="h-4 w-4 text-sky-500" />
        ) : (
            <ChevronDown className="h-4 w-4 text-sky-500" />
        );
    };

    const SortableHeader = ({ field, children }: { field: keyof CertificateRow; children: React.ReactNode }) => (
        <th
            className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            onClick={() => onSort(field)}
        >
            <div className="flex items-center gap-2">
                {children}
                <SortIcon field={field} />
            </div>
        </th>
    );

    return (
        <>
            <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                    <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                        <tr>
                            <th className="px-4 py-3 text-left">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={onSelectAll}
                                    aria-label="Seleccionar todos"
                                    className={someSelected ? "opacity-50" : ""}
                                />
                            </th>
                            <SortableHeader field="chain_cert_id">ID</SortableHeader>
                            <SortableHeader field="student_name">Estudiante</SortableHeader>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                                Curso
                            </th>
                            <SortableHeader field="created_at">Fecha</SortableHeader>
                            <SortableHeader field="status">Estado</SortableHeader>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-neutral-950 divide-y divide-neutral-200 dark:divide-neutral-800">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <RefreshCw className="h-5 w-5 animate-spin text-sky-500" />
                                        <span className="text-neutral-600 dark:text-neutral-400">Cargando certificados...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : certificates.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                                    No se encontraron certificados
                                </td>
                            </tr>
                        ) : (
                            certificates.map((cert) => (
                                <tr
                                    key={cert.id_certificate}
                                    className="hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <Checkbox
                                            checked={selectedIds.has(cert.id_certificate)}
                                            onCheckedChange={(checked) => onSelectChange(cert.id_certificate, checked as boolean)}
                                            aria-label={`Seleccionar certificado ${cert.chain_cert_id}`}
                                            disabled={!cert.chain_cert_id}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-sm font-mono text-neutral-900 dark:text-neutral-100">
                                        {cert.chain_cert_id ? (
                                            <div className="flex items-center gap-2">
                                                <span>#{cert.chain_cert_id}</span>
                                                {cert.tx_id && (
                                                    <a
                                                        href={`https://explorer.hiro.so/txid/${cert.tx_id}?chain=testnet`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sky-500 hover:text-sky-600"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-neutral-400">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                                {cert.student_name}
                                            </span>
                                            {cert.student_email && (
                                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    {cert.student_email}
                                                </span>
                                            )}
                                            <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500 truncate max-w-[200px]">
                                                {cert.student_wallet}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-neutral-900 dark:text-neutral-100">
                                                {cert.id_course?.title || "Sin título"}
                                            </span>
                                            {cert.grade && (
                                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    Calificación: {cert.grade}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                                        {new Date(cert.created_at).toLocaleDateString("es-ES", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </td>
                                    <td className="px-4 py-3">{getStatusBadge(cert.status)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {cert.chain_cert_id ? (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onSync(cert.id_certificate, cert.chain_cert_id!)}
                                                        title="Sincronizar con blockchain"
                                                    >
                                                        <RefreshCw className="h-4 w-4" />
                                                    </Button>
                                                    {cert.status === "issued" ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                setActionCert({
                                                                    id: cert.id_certificate,
                                                                    chainId: cert.chain_cert_id!,
                                                                    action: "revoke",
                                                                })
                                                            }
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                                            title="Revocar certificado"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    ) : cert.status === "revoked" ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                setActionCert({
                                                                    id: cert.id_certificate,
                                                                    chainId: cert.chain_cert_id!,
                                                                    action: "reactivate",
                                                                })
                                                            }
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                                                            title="Reactivar certificado"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </Button>
                                                    ) : null}
                                                </>
                                            ) : (
                                                <span className="text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Sin blockchain
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={!!actionCert} onOpenChange={(open) => !open && setActionCert(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {actionCert?.action === "revoke" ? "Revocar Certificado" : "Reactivar Certificado"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionCert?.action === "revoke"
                                ? "¿Estás seguro de que deseas revocar este certificado? Esta acción se registrará en la blockchain."
                                : "¿Estás seguro de que deseas reactivar este certificado? Esta acción se registrará en la blockchain."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleActionConfirm}
                            disabled={processing}
                            className={
                                actionCert?.action === "revoke"
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-green-600 hover:bg-green-700"
                            }
                        >
                            {processing ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Procesando...
                                </>
                            ) : actionCert?.action === "revoke" ? (
                                "Revocar"
                            ) : (
                                "Reactivar"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
