"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { School, CheckCircle, AlertCircle, ShieldCheck, ShieldOff, Edit } from "lucide-react";
import {
    addSchoolManagerClient,
    deactivateSchoolManagerClient,
    reactivateSchoolManagerClient,
    verifySchoolManagerClient,
    unverifySchoolManagerClient,
    updateSchoolMetadataUrlManagerClient,
    getSchoolInfoManagerClient,
} from "@/lib/stacks-client";

interface MessageType {
    type: "success" | "error";
    text: string;
}

export function SchoolManagement() {
    const [message, setMessage] = useState<MessageType | null>(null);
    const [loading, setLoading] = useState(false);

    // Estados para agregar escuela
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [newSchool, setNewSchool] = useState({
        principal: "",
        name: "",
        metadataUrl: "",
    });

    // Estados para consultar escuela
    const [queryPrincipal, setQueryPrincipal] = useState("");
    const [schoolInfo, setSchoolInfo] = useState<any>(null);

    // Estados para actualizar metadata
    const [showMetadataDialog, setShowMetadataDialog] = useState(false);
    const [metadataUpdate, setMetadataUpdate] = useState({
        principal: "",
        url: "",
    });

    const showMessage = (type: "success" | "error", text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleAddSchool = async () => {
        if (!newSchool.principal || !newSchool.name) {
            showMessage("error", "Complete los campos requeridos");
            return;
        }

        setLoading(true);
        try {
            await addSchoolManagerClient(
                newSchool.principal,
                newSchool.name,
                newSchool.metadataUrl || ""
            );
            showMessage("success", "Escuela agregada exitosamente");
            setShowAddDialog(false);
            setNewSchool({ principal: "", name: "", metadataUrl: "" });
        } catch (error) {
            showMessage("error", `Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivateSchool = async (principal: string) => {
        if (!principal) return;
        setLoading(true);
        try {
            await deactivateSchoolManagerClient(principal);
            showMessage("success", "Escuela desactivada");
        } catch (error) {
            showMessage("error", `Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReactivateSchool = async (principal: string) => {
        if (!principal) return;
        setLoading(true);
        try {
            await reactivateSchoolManagerClient(principal);
            showMessage("success", "Escuela reactivada");
        } catch (error) {
            showMessage("error", `Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySchool = async (principal: string) => {
        if (!principal) return;
        setLoading(true);
        try {
            await verifySchoolManagerClient(principal);
            showMessage("success", "Escuela verificada");
        } catch (error) {
            showMessage("error", `Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUnverifySchool = async (principal: string) => {
        if (!principal) return;
        setLoading(true);
        try {
            await unverifySchoolManagerClient(principal);
            showMessage("success", "Verificación removida");
        } catch (error) {
            showMessage("error", `Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMetadata = async () => {
        if (!metadataUpdate.principal || !metadataUpdate.url) {
            showMessage("error", "Complete todos los campos");
            return;
        }

        setLoading(true);
        try {
            await updateSchoolMetadataUrlManagerClient(
                metadataUpdate.principal,
                metadataUpdate.url
            );
            showMessage("success", "Metadata actualizada");
            setShowMetadataDialog(false);
            setMetadataUpdate({ principal: "", url: "" });
        } catch (error) {
            showMessage("error", `Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleQuerySchool = async () => {
        if (!queryPrincipal) return;
        setLoading(true);
        try {
            const info = await getSchoolInfoManagerClient(queryPrincipal);
            setSchoolInfo(info);
            if (!info) {
                showMessage("error", "Escuela no encontrada");
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
                    <CardTitle className="flex items-center gap-2">
                        <School className="h-5 w-5" />
                        Gestión de Escuelas
                    </CardTitle>
                    <CardDescription>Administra las academias del sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Consultar Escuela */}
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold">Consultar Escuela</h3>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Principal de la escuela"
                                value={queryPrincipal}
                                onChange={(e) => setQueryPrincipal(e.target.value)}
                            />
                            <Button onClick={handleQuerySchool} disabled={loading}>
                                Consultar
                            </Button>
                        </div>
                        {schoolInfo && (
                            <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                                <p><strong>Nombre:</strong> {schoolInfo.name}</p>
                                <p><strong>Activa:</strong> {schoolInfo.active ? "Sí" : "No"}</p>
                                <p><strong>Verificada:</strong> {schoolInfo.verified ? "Sí" : "No"}</p>
                                <p><strong>Metadata URL:</strong> {schoolInfo["metadata-url"] || "N/A"}</p>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {schoolInfo.active ? (
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDeactivateSchool(queryPrincipal)}
                                            disabled={loading}
                                        >
                                            Desactivar
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="default"
                                            onClick={() => handleReactivateSchool(queryPrincipal)}
                                            disabled={loading}
                                        >
                                            Reactivar
                                        </Button>
                                    )}

                                    {schoolInfo.verified ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleUnverifySchool(queryPrincipal)}
                                            disabled={loading}
                                        >
                                            <ShieldOff className="h-4 w-4 mr-2" />
                                            Quitar Verificación
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleVerifySchool(queryPrincipal)}
                                            disabled={loading}
                                        >
                                            <ShieldCheck className="h-4 w-4 mr-2" />
                                            Verificar
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Acciones Rápidas */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                        <Button onClick={() => setShowAddDialog(true)}>
                            <School className="h-4 w-4 mr-2" />
                            Agregar Escuela
                        </Button>
                        <Button variant="outline" onClick={() => setShowMetadataDialog(true)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Actualizar Metadata
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog: Agregar Escuela */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agregar Nueva Escuela</DialogTitle>
                        <DialogDescription>
                            Complete la información de la nueva academia
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Principal de la Escuela *</Label>
                            <Input
                                placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                                value={newSchool.principal}
                                onChange={(e) =>
                                    setNewSchool({ ...newSchool, principal: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Nombre *</Label>
                            <Input
                                placeholder="Universidad XYZ"
                                value={newSchool.name}
                                onChange={(e) =>
                                    setNewSchool({ ...newSchool, name: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Metadata URL</Label>
                            <Textarea
                                placeholder="https://..."
                                value={newSchool.metadataUrl}
                                onChange={(e) =>
                                    setNewSchool({ ...newSchool, metadataUrl: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleAddSchool} disabled={loading}>
                            {loading ? "Procesando..." : "Agregar Escuela"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Actualizar Metadata */}
            <Dialog open={showMetadataDialog} onOpenChange={setShowMetadataDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Actualizar Metadata URL</DialogTitle>
                        <DialogDescription>
                            Actualiza la URL de metadata de una escuela
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Principal de la Escuela</Label>
                            <Input
                                placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                                value={metadataUpdate.principal}
                                onChange={(e) =>
                                    setMetadataUpdate({ ...metadataUpdate, principal: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Nueva Metadata URL</Label>
                            <Textarea
                                placeholder="https://..."
                                value={metadataUpdate.url}
                                onChange={(e) =>
                                    setMetadataUpdate({ ...metadataUpdate, url: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowMetadataDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleUpdateMetadata} disabled={loading}>
                            {loading ? "Procesando..." : "Actualizar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}