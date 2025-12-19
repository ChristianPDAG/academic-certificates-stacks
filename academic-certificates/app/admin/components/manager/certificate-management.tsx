"use client";

import { useState, useEffect } from "react";
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
            showMessage("error", "ID de certificado inválido");
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
                showMessage("error", "Certificado no encontrado");
            }
        } catch (error) {
            showMessage("error", `Error: ${error}`);
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
            showMessage("success", `Certificado #${certId} revocado`);
            setShowRevokeDialog(false);
            setActionCertId("");
            // Recargar si es el certificado actual
            if (queryCertId === actionCertId) {
                handleQueryCertificate();
            }
        } catch (error) {
            showMessage("error", `Error: ${error}`);
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
            showMessage("success", `Certificado #${certId} reactivado`);
            setShowReactivateDialog(false);
            setActionCertId("");
            // Recargar si es el certificado actual
            if (queryCertId === actionCertId) {
                handleQueryCertificate();
            }
        } catch (error) {
            showMessage("error", `Error: ${error}`);
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
                                Gestión de Certificados
                            </CardTitle>
                            <CardDescription>Administra certificados del sistema</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={loadTotalCertificates}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Actualizar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Estadística */}
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-600 font-medium">
                                    Total de Certificados
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
                        <h3 className="font-semibold">Consultar Certificado</h3>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="ID del certificado"
                                value={queryCertId}
                                onChange={(e) => setQueryCertId(e.target.value)}
                            />
                            <Button onClick={handleQueryCertificate} disabled={loading}>
                                Consultar
                            </Button>
                        </div>

                        {certInfo && (
                            <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">Certificado #{queryCertId}</h4>
                                    {isValid !== null && (
                                        <Badge variant={isValid ? "default" : "destructive"}>
                                            {isValid ? "Válido" : "Inválido"}
                                        </Badge>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Escuela</p>
                                        <p className="font-mono text-xs break-all">
                                            {certInfo["school-id"]?.value}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Estudiante</p>
                                        <p className="font-mono text-xs break-all">
                                            {certInfo["student-wallet"]?.value}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Calificación</p>
                                        <p>{certInfo.grade?.value || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Estado</p>
                                        <Badge variant={certInfo.revoked ? "destructive" : "default"}>
                                            {certInfo.revoked ? "Revocado" : "Activo"}
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
                                            Reactivar
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
                                            Revocar
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
                            Revocar Certificado
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowReactivateDialog(true)}
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reactivar Certificado
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog: Revocar */}
            <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Revocar Certificado</DialogTitle>
                        <DialogDescription>
                            Ingresa el ID del certificado que deseas revocar
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>ID del Certificado</Label>
                            <Input
                                type="number"
                                placeholder="123"
                                value={actionCertId}
                                onChange={(e) => setActionCertId(e.target.value)}
                            />
                        </div>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                                ⚠️ Esta acción marcará el certificado como revocado
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRevokeDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRevokeCertificate}
                            disabled={loading}
                        >
                            {loading ? "Procesando..." : "Revocar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Reactivar */}
            <Dialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reactivar Certificado</DialogTitle>
                        <DialogDescription>
                            Ingresa el ID del certificado revocado que deseas reactivar
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>ID del Certificado</Label>
                            <Input
                                type="number"
                                placeholder="123"
                                value={actionCertId}
                                onChange={(e) => setActionCertId(e.target.value)}
                            />
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                💡 Solo certificados revocados pueden ser reactivados
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReactivateDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleReactivateCertificate} disabled={loading}>
                            {loading ? "Procesando..." : "Reactivar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}