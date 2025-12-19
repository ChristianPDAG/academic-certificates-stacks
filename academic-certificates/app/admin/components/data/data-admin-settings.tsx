"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Shield, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import {
    changeSuperAdminDataClient,
    getSuperAdminDataClient,
} from "@/lib/stacks/admin/data-manager";

interface MessageType {
    type: "success" | "error";
    text: string;
}

export function DataAdminSettings() {
    const [message, setMessage] = useState<MessageType | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentSuperAdmin, setCurrentSuperAdmin] = useState<string>("");

    // Estados para cambiar super admin
    const [showChangeAdminDialog, setShowChangeAdminDialog] = useState(false);
    const [newSuperAdmin, setNewSuperAdmin] = useState("");

    useEffect(() => {
        loadSuperAdmin();
    }, []);

    const loadSuperAdmin = async () => {
        try {
            const admin = await getSuperAdminDataClient();
            setCurrentSuperAdmin(admin);
        } catch (error) {
            console.error("Error loading super admin:", error);
        }
    };

    const showMessage = (type: "success" | "error", text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleChangeSuperAdmin = async () => {
        if (!newSuperAdmin.trim()) {
            showMessage("error", "Ingresa una dirección válida");
            return;
        }

        if (newSuperAdmin === currentSuperAdmin) {
            showMessage("error", "La nueva dirección debe ser diferente a la actual");
            return;
        }

        setLoading(true);
        try {
            await changeSuperAdminDataClient(newSuperAdmin);
            showMessage(
                "success",
                "Transacción enviada. El super admin será actualizado al confirmar."
            );
            setShowChangeAdminDialog(false);
            setNewSuperAdmin("");
            setTimeout(() => loadSuperAdmin(), 3000);
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
                                <Shield className="h-5 w-5" />
                                Configuración del Super Admin (Datos)
                            </CardTitle>
                            <CardDescription>
                                Administra el super administrador del contrato certificate-data
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={loadSuperAdmin}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Actualizar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Super Admin Actual */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-purple-600" />
                            Super Admin Actual del Contrato de Datos
                        </Label>
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <p className="font-mono text-sm break-all text-purple-900">
                                {currentSuperAdmin || "Cargando..."}
                            </p>
                        </div>
                    </div>

                    {/* Información Importante */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                        <p className="text-sm font-semibold text-amber-900">
                            ⚠️ Sobre el Super Admin del Contrato de Datos:
                        </p>
                        <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                            <li>Controla la autorización de contratos escritores</li>
                            <li>Puede cambiar su propia dirección a otra cuenta</li>
                            <li>Este es el nivel de seguridad más bajo (capa de datos)</li>
                            <li>Trabaja en conjunto con el Registry y Manager</li>
                        </ul>
                    </div>

                    {/* Acción */}
                    <div className="pt-4 border-t">
                        <Button
                            variant="destructive"
                            onClick={() => setShowChangeAdminDialog(true)}
                        >
                            <Shield className="h-4 w-4 mr-2" />
                            Cambiar Super Admin
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog: Cambiar Super Admin */}
            <Dialog open={showChangeAdminDialog} onOpenChange={setShowChangeAdminDialog}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Cambiar Super Admin del Contrato de Datos</DialogTitle>
                        <DialogDescription>
                            Transferir el control del contrato certificate-data a otra dirección
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Super Admin Actual</Label>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="font-mono text-xs break-all">
                                    {currentSuperAdmin}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Nuevo Super Admin</Label>
                            <Input
                                placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                                value={newSuperAdmin}
                                onChange={(e) => setNewSuperAdmin(e.target.value)}
                            />
                        </div>

                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
                            <p className="text-sm font-bold text-red-900">
                                🚨 ADVERTENCIA CRÍTICA
                            </p>
                            <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                                <li>
                                    Perderás el control del contrato de datos PERMANENTEMENTE
                                </li>
                                <li>
                                    El nuevo admin podrá autorizar/revocar contratos escritores
                                </li>
                                <li>
                                    Solo el super admin actual puede ejecutar esta acción
                                </li>
                                <li>
                                    Asegúrate de tener acceso a la nueva dirección
                                </li>
                            </ul>
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                💡 <strong>Consejo:</strong> Considera mantener el mismo super
                                admin para Registry, Manager y Data para simplificar la
                                administración.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowChangeAdminDialog(false);
                                setNewSuperAdmin("");
                            }}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleChangeSuperAdmin}
                            disabled={loading || !newSuperAdmin.trim()}
                        >
                            {loading ? "Procesando..." : "Confirmar Cambio"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
