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
import { Settings, CheckCircle, AlertCircle, Shield, RefreshCw } from "lucide-react";
import {
    setActiveManagerClient,
    getActiveManagerClient,
    changeSuperAdminRegistryClient,
    getSuperAdminRegistryClient,
} from "@/lib/stacks-client";

export function AdminNewDashboard() {
    // Estados para datos del registry
    const [activeManager, setActiveManager] = useState<string>("");
    const [superAdmin, setSuperAdmin] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Estados para formularios
    const [newManager, setNewManager] = useState("");
    const [newSuperAdmin, setNewSuperAdmin] = useState("");

    // Estados para diálogos
    const [showManagerDialog, setShowManagerDialog] = useState(false);
    const [showSuperAdminDialog, setShowSuperAdminDialog] = useState(false);

    // Estados para mensajes
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Cargar datos al montar el componente
    useEffect(() => {
        loadRegistryData();
    }, []);

    /**
     * Carga los datos actuales del registry
     */
    const loadRegistryData = async () => {
        setRefreshing(true);
        console.log("Loading registry data...");
        try {
            const [managerData, adminData] = await Promise.all([
                getActiveManagerClient(),
                getSuperAdminRegistryClient(),
            ]);
            console.log("Fetched registry data:", { managerData, adminData });
            setActiveManager(managerData || "No disponible");
            setSuperAdmin(adminData || "No disponible");
        } catch (error) {
            console.error("Error loading registry data:", error);
            showMessage("error", "Error al cargar los datos del registry");
        } finally {
            setRefreshing(false);
        }
    };

    /**
     * Muestra un mensaje temporal
     */
    const showMessage = (type: "success" | "error", text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    /**
     * Maneja el cambio del manager activo
     */
    const handleSetActiveManager = async () => {
        if (!newManager.trim()) {
            showMessage("error", "Por favor ingresa una dirección válida");
            return;
        }

        setLoading(true);
        try {
            await setActiveManagerClient(newManager);
            showMessage("success", "Transacción enviada. Manager activo actualizado.");
            setShowManagerDialog(false);
            setNewManager("");
            // Recargar datos después de un breve delay para dar tiempo a la blockchain
            setTimeout(() => loadRegistryData(), 3000);
        } catch (error) {
            console.error("Error setting active manager:", error);
            showMessage("error", `Error al cambiar el manager: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Maneja el cambio del super admin
     */
    const handleChangeSuperAdmin = async () => {
        if (!newSuperAdmin.trim()) {
            showMessage("error", "Por favor ingresa una dirección válida");
            return;
        }

        setLoading(true);
        try {
            await changeSuperAdminRegistryClient(newSuperAdmin);
            showMessage("success", "Transacción enviada. Super Admin actualizado.");
            setShowSuperAdminDialog(false);
            setNewSuperAdmin("");
            // Recargar datos después de un breve delay
            setTimeout(() => loadRegistryData(), 3000);
        } catch (error) {
            console.error("Error changing super admin:", error);
            showMessage("error", `Error al cambiar el super admin: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Mensajes de estado */}
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

            {/* Card principal: Estado del Registry */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Gestión del Registry
                            </CardTitle>
                            <CardDescription>
                                Administra el contrato registry del sistema
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadRegistryData}
                            disabled={refreshing}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                            Actualizar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Información actual */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Super Admin Actual
                            </Label>
                            <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                                {superAdmin}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                Manager Activo
                            </Label>
                            <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                                {activeManager}
                            </div>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                        <Button
                            onClick={() => setShowManagerDialog(true)}
                            variant="default"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Cambiar Manager Activo
                        </Button>

                        <Button
                            onClick={() => setShowSuperAdminDialog(true)}
                            variant="destructive"
                        >
                            <Shield className="h-4 w-4 mr-2" />
                            Cambiar Super Admin
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog: Cambiar Manager Activo */}
            <Dialog open={showManagerDialog} onOpenChange={setShowManagerDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cambiar Manager Activo</DialogTitle>
                        <DialogDescription>
                            Ingresa la dirección del nuevo contrato manager que será el activo en el sistema.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-manager">Dirección del Nuevo Manager</Label>
                            <Input
                                id="new-manager"
                                placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.certificate-manager-v1"
                                value={newManager}
                                onChange={(e) => setNewManager(e.target.value)}
                            />
                        </div>

                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                ⚠️ Solo el super admin puede ejecutar esta acción.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowManagerDialog(false);
                                setNewManager("");
                            }}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSetActiveManager}
                            disabled={loading || !newManager.trim()}
                        >
                            {loading ? "Procesando..." : "Confirmar Cambio"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Cambiar Super Admin */}
            <Dialog open={showSuperAdminDialog} onOpenChange={setShowSuperAdminDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cambiar Super Admin</DialogTitle>
                        <DialogDescription>
                            Ingresa la dirección del nuevo super administrador. Esta es una acción crítica.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-super-admin">Dirección del Nuevo Super Admin</Label>
                            <Input
                                id="new-super-admin"
                                placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                                value={newSuperAdmin}
                                onChange={(e) => setNewSuperAdmin(e.target.value)}
                            />
                        </div>

                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800 font-semibold">
                                ⚠️ ADVERTENCIA: Esta acción transferirá el control total del sistema.
                                Solo el super admin actual puede ejecutarla.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowSuperAdminDialog(false);
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
