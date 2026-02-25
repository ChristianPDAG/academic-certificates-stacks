"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Award, CheckCircle, AlertCircle, Ban, RotateCcw, RefreshCw } from "lucide-react";
import {
    revokeCertificateManagerClient,
    reactivateCertificateManagerClient,
    getTotalCertificatesManagerClient,
    getCertificateManagerClient,
    isCertificateValidManagerClient,
} from "@/lib/stacks/admin/certificates-manager";

interface MessageType {
    type: "success" | "error";
    text: string;
}

export function CertificateManagement() {
    const { t } = useTranslation();
    const [message, setMessage] = useState<MessageType | null>(null);
    const [loading, setLoading] = useState(false);
    const [totalCertificates, setTotalCertificates] = useState<number>(0);

    // Estados para consultar certificado
    const [queryCertId, setQueryCertId] = useState("");
    const [certInfo, setCertInfo] = useState<any>(null);
    const [isValid, setIsValid] = useState<boolean | null>(null);

    // Estados para diálogos
    const [showRevokeDialog, setShowRevokeDialog] = useState(false);
    const [showReactivateDialog, setShowReactivateDialog] = useState(false);
    const [actionCertId, setActionCertId] = useState("");

    useEffect(() => {
        loadTotalCertificates();
    }, []);

    const loadTotalCertificates = async () => {
        try {
            const total = await getTotalCertificatesManagerClient();
            setTotalCertificates(total);
        } catch (error) {
            console.error("Error loading total certificates:", error);
        }
    };

    const showMessage = (type: "success" | "error", text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleQueryCertificate = async () => {
        const certId = parseInt(queryCertId);
        if (isNaN(certId)) {
            showMessage("error", t("admin.certificates.invalidId"));
            return;
        }

        setLoading(true);
        try {
            const [cert, valid] = await Promise.all([
                getCertificateManagerClient(certId),
                isCertificateValidManagerClient(certId),
            ]);

            setCertInfo(cert);
            setIsValid(valid);

            if (!cert) {
                showMessage("error", t("admin.certificates.notFound"));
            }
        } catch (error) {
            showMessage("error", `${t("admin.certificates.error")}: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeCertificate = async () => {
        const certId = parseInt(actionCertId);
        if (isNaN(certId)) return;

        setLoading(true);
        try {
            await revokeCertificateManagerClient(certId);
            showMessage("success", t("admin.certificates.revoked", { id: certId }));
            setShowRevokeDialog(false);
            setActionCertId("");
            // Recargar si es el certificado actual
            if (queryCertId === actionCertId) {
                handleQueryCertificate();
            }
        } catch (error) {
            showMessage("error", `${t("admin.certificates.error")}: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReactivateCertificate = async () => {
        const certId = parseInt(actionCertId);
        if (isNaN(certId)) return;

        setLoading(true);
        try {
            await reactivateCertificateManagerClient(certId);
            showMessage("success", t("admin.certificates.reactivated", { id: certId }));
            setShowReactivateDialog(false);
            setActionCertId("");
            // Recargar si es el certificado actual
            if (queryCertId === actionCertId) {
                handleQueryCertificate();
            }
        } catch (error) {
            showMessage("error", `${t("admin.certificates.error")}: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {message && (
                <div
                    className={`p-4 rounded-lg flex items-center gap-2 ${message.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                >
                    {message.type === "success" ? (
                        <CheckCircle className="h-5 w-5" />
                    ) : (
                        <AlertCircle className="h-5 w-5" />
                    )}
                    <span>{message.text}</span>
                </div>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                {t("admin.certificates.title")}
                            </CardTitle>
                            <CardDescription>{t("admin.certificates.description")}</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={loadTotalCertificates}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {t("admin.certificates.refresh")}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Estadística */}
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-600 font-medium">
                                    {t("admin.certificates.totalCertificates")}
                                </p>
                                <p className="text-3xl font-bold text-purple-900">
                                    {totalCertificates}
                                </p>
                            </div>
                            <Award className="h-8 w-8 text-purple-400" />
                        </div>
                    </div>

                    {/* Consultar Certificado */}
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold">{t("admin.certificates.queryCertificate")}</h3>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder={t("admin.certificates.certificateId")}
                                value={queryCertId}
                                onChange={(e) => setQueryCertId(e.target.value)}
                            />
                            <Button onClick={handleQueryCertificate} disabled={loading}>
                                {t("admin.certificates.query")}
                            </Button>
                        </div>

                        {certInfo && (
                            <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">{t("admin.certificates.certificateNumber", { id: queryCertId })}</h4>
                                    {isValid !== null && (
                                        <Badge variant={isValid ? "default" : "destructive"}>
                                            {isValid ? t("admin.certificates.valid") : t("admin.certificates.invalid")}
                                        </Badge>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">{t("admin.certificates.school")}</p>
                                        <p className="font-mono text-xs break-all">
                                            {certInfo["school-id"]?.value}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">{t("admin.certificates.student")}</p>
                                        <p className="font-mono text-xs break-all">
                                            {certInfo["student-wallet"]?.value}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">{t("admin.certificates.grade")}</p>
                                        <p>{certInfo.grade?.value || t("admin.certificates.notApplicable")}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">{t("admin.certificates.status")}</p>
                                        <Badge variant={certInfo.revoked ? "destructive" : "default"}>
                                            {certInfo.revoked ? t("admin.certificates.revoked") : t("admin.certificates.active")}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2 border-t">
                                    {certInfo.revoked ? (
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setActionCertId(queryCertId);
                                                setShowReactivateDialog(true);
                                            }}
                                        >
                                            <RotateCcw className="h-4 w-4 mr-2" />
                                            {t("admin.certificates.reactivate")}
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => {
                                                setActionCertId(queryCertId);
                                                setShowRevokeDialog(true);
                                            }}
                                        >
                                            <Ban className="h-4 w-4 mr-2" />
                                            {t("admin.certificates.revoke")}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Acciones Rápidas */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                        <Button
                            variant="destructive"
                            onClick={() => setShowRevokeDialog(true)}
                        >
                            <Ban className="h-4 w-4 mr-2" />
                            {t("admin.certificates.revokeCertificate")}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowReactivateDialog(true)}
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            {t("admin.certificates.reactivateCertificate")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog: Revocar */}
            <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("admin.certificates.revokeCertificate")}</DialogTitle>
                        <DialogDescription>
                            {t("admin.certificates.revokeDialogDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("admin.certificates.certificateId")}</Label>
                            <Input
                                type="number"
                                placeholder="123"
                                value={actionCertId}
                                onChange={(e) => setActionCertId(e.target.value)}
                            />
                        </div>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                                {t("admin.certificates.revokeWarning")}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRevokeDialog(false)}>
                            {t("admin.certificates.cancel")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRevokeCertificate}
                            disabled={loading}
                        >
                            {loading ? t("admin.certificates.processing") : t("admin.certificates.revoke")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Reactivar */}
            <Dialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("admin.certificates.reactivateCertificate")}</DialogTitle>
                        <DialogDescription>
                            {t("admin.certificates.reactivateDialogDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("admin.certificates.certificateId")}</Label>
                            <Input
                                type="number"
                                placeholder="123"
                                value={actionCertId}
                                onChange={(e) => setActionCertId(e.target.value)}
                            />
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                {t("admin.certificates.reactivateInfo")}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReactivateDialog(false)}>
                            {t("admin.certificates.cancel")}
                        </Button>
                        <Button onClick={handleReactivateCertificate} disabled={loading}>
                            {loading ? t("admin.certificates.processing") : t("admin.certificates.reactivate")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}