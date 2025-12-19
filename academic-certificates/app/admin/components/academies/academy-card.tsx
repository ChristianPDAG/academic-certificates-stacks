"use client";

import { useState } from "react";
import {
    updateAcademyStatusInDB,
    updateAcademyCreditsInDB,
    updateAcademyValidationStatus,
} from "@/app/actions/admin/academies";
import {
    deactivateSchoolManagerClient,
    reactivateSchoolManagerClient,
    addSchoolManagerClient,
} from "@/lib/stacks/admin/schools-manager";
import { adminFundSchoolManagerClient, transferSTXClient } from "@/lib/stacks/admin/fund-schools-manager";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
    School,
    Power,
    PowerOff,
    Coins,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    AlertCircle,
    Mail,
    Wallet,
    Calendar,
    Plus,
    ArrowUpRight,
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

interface AcademyCardProps {
    academy: Academy;
    onUpdate: () => void;
}

export function AcademyCard({ academy, onUpdate }: AcademyCardProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [creditsToAdd, setCreditsToAdd] = useState("");
    const [stxToTransfer, setStxToTransfer] = useState("");
    const [showFundingInput, setShowFundingInput] = useState(false);
    const [fundingType, setFundingType] = useState<"credits" | "stx">("credits");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const isActive = !academy.disabled_at;

    const handleToggleStatus = async () => {
        try {
            setIsProcessing(true);
            setError("");
            setSuccess("");

            // Primero ejecutar en blockchain
            if (isActive) {
                // Desactivar
                await deactivateSchoolManagerClient(academy.stacks_address);
            } else {
                // Reactivar
                await reactivateSchoolManagerClient(academy.stacks_address);
            }

            // Si la blockchain tiene éxito, actualizar BD
            await updateAcademyStatusInDB(academy.id_academy, isActive);

            setSuccess(`Academia ${isActive ? "desactivada" : "activada"} exitosamente en blockchain y BD`);
            setTimeout(() => {
                onUpdate();
                setSuccess("");
            }, 2000);
        } catch (err: any) {
            console.error("Error en toggle status:", err);
            setError(err.message || "Error al cambiar el estado. La transacción blockchain puede estar pendiente.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAddCredits = async () => {
        try {
            const amount = parseInt(creditsToAdd);
            if (isNaN(amount) || amount <= 0) {
                setError("Ingrese una cantidad válida de créditos");
                return;
            }

            setIsProcessing(true);
            setError("");
            setSuccess("");

            // Primero ejecutar en blockchain (fondear la escuela)
            await adminFundSchoolManagerClient(academy.stacks_address, amount);

            // Si la blockchain tiene éxito, actualizar BD
            await updateAcademyCreditsInDB(academy.id_academy, amount);

            setSuccess(`Se agregaron ${amount} créditos exitosamente en blockchain y BD`);
            setCreditsToAdd("");
            setShowFundingInput(false);
            setTimeout(() => {
                onUpdate();
                setSuccess("");
            }, 2000);
        } catch (err: any) {
            console.error("Error al agregar créditos:", err);
            setError(err.message || "Error al agregar créditos. La transacción blockchain puede estar pendiente.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleTransferSTX = async () => {
        try {
            const amount = parseFloat(stxToTransfer);
            if (isNaN(amount) || amount <= 0) {
                setError("Ingrese una cantidad válida de STX");
                return;
            }

            setIsProcessing(true);
            setError("");
            setSuccess("");

            // Importar dinámicamente para evitar problemas de SSR
            const { openSTXTransfer } = await import('@stacks/connect');
            const { uintCV, standardPrincipalCV } = await import('@stacks/transactions');
            const { STACKS_TESTNET } = await import('@stacks/network');

            // Convertir STX a microSTX (1 STX = 1,000,000 microSTX)
            const amountInMicroSTX = Math.floor(amount * 1_000_000);

            await transferSTXClient(
                academy.stacks_address,
                amount
            );
        } catch (err: any) {
            console.error("Error al transferir STX:", err);
            setError(err.message || "Error al transferir STX.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFunding = () => {
        if (fundingType === "credits") {
            handleAddCredits();
        } else {
            handleTransferSTX();
        }
    };

    const handleValidationStatus = async (status: "approved" | "rejected") => {
        try {
            setIsProcessing(true);
            setError("");
            setSuccess("");

            // Si se aprueba, primero registrar en blockchain
            if (status === "approved") {
                await addSchoolManagerClient(
                    academy.stacks_address,
                    academy.legal_name,
                    "" // metadataUrl - puedes agregar este campo a la BD si es necesario
                );
            }

            // Si la blockchain tiene éxito (o es rechazo), actualizar BD
            await updateAcademyValidationStatus(academy.id_academy, status);

            setSuccess(`Academia ${status === "approved" ? "aprobada y registrada en blockchain" : "rechazada"} exitosamente`);
            setTimeout(() => {
                onUpdate();
                setSuccess("");
            }, 2000);
        } catch (err: any) {
            console.error("Error al actualizar validación:", err);
            setError(err.message || "Error al actualizar validación. La transacción blockchain puede estar pendiente.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Card
            className={`rounded-2xl border backdrop-blur-xl shadow-lg transition-all duration-300 ${isActive
                ? "bg-white/80 border-neutral-200 dark:bg-neutral-900/70 dark:border-neutral-800"
                : "bg-neutral-100/50 border-neutral-300 dark:bg-neutral-800/30 dark:border-neutral-700 opacity-75"
                }`}
        >
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <School className="h-5 w-5 text-sky-500 dark:text-sky-400 flex-shrink-0" />
                            <CardTitle className="text-lg truncate">{academy.legal_name}</CardTitle>
                        </div>
                        <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate">{academy.contact_academy_email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                <Wallet className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="font-mono text-xs truncate">{academy.stacks_address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>{new Date(academy.created_at).toLocaleDateString("es-ES")}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                        {isActive ? (
                            <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                                <Power className="h-3 w-3 mr-1" />
                                Activa
                            </Badge>
                        ) : (
                            <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
                                <PowerOff className="h-3 w-3 mr-1" />
                                Inactiva
                            </Badge>
                        )}

                        {academy.validation_status === "approved" ? (
                            <Badge className="bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Aprobada
                            </Badge>
                        ) : academy.validation_status === "rejected" ? (
                            <Badge className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20">
                                <XCircle className="h-3 w-3 mr-1" />
                                Rechazada
                            </Badge>
                        ) : (
                            <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
                                <Clock className="h-3 w-3 mr-1" />
                                Pendiente
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Créditos */}
                <div className="p-4 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Coins className="h-5 w-5 text-amber-500" />
                            <span className="font-semibold">Créditos Disponibles</span>
                        </div>
                        <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{academy.credits}</span>
                    </div>

                    {showFundingInput ? (
                        <div className="space-y-3">
                            <Tabs value={fundingType} onValueChange={(v) => setFundingType(v as "credits" | "stx")} className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="credits" className="text-xs">
                                        <Coins className="h-3 w-3 mr-1" />
                                        Créditos
                                    </TabsTrigger>
                                    <TabsTrigger value="stx" className="text-xs">
                                        <ArrowUpRight className="h-3 w-3 mr-1" />
                                        STX (Gas)
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="credits" className="space-y-2 mt-3">
                                    <Label htmlFor={`credits-${academy.id_academy}`} className="text-xs">
                                        Cantidad de créditos a agregar
                                    </Label>
                                    <Input
                                        id={`credits-${academy.id_academy}`}
                                        type="number"
                                        min="1"
                                        placeholder="100"
                                        value={creditsToAdd}
                                        onChange={(e) => setCreditsToAdd(e.target.value)}
                                        className="bg-white dark:bg-neutral-800 border-2"
                                        disabled={isProcessing}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {creditsToAdd && parseInt(creditsToAdd) > 0
                                            ? `La academia podrá emitir ${creditsToAdd} certificado(s) adicional(es)`
                                            : "1 crédito = 1 certificado"
                                        }
                                    </p>
                                </TabsContent>

                                <TabsContent value="stx" className="space-y-2 mt-3">
                                    <Label htmlFor={`stx-${academy.id_academy}`} className="text-xs">
                                        Cantidad de STX a transferir
                                    </Label>
                                    <Input
                                        id={`stx-${academy.id_academy}`}
                                        type="number"
                                        min="0.001"
                                        step="0.1"
                                        placeholder="1.0"
                                        value={stxToTransfer}
                                        onChange={(e) => setStxToTransfer(e.target.value)}
                                        className="bg-white dark:bg-neutral-800 border-2"
                                        disabled={isProcessing}
                                    />
                                    <div className="bg-blue-50 dark:bg-blue-950/50 p-2 rounded text-xs space-y-1">
                                        <p className="font-medium">💡 Para qué sirven los STX:</p>
                                        <ul className="ml-4 space-y-0.5 text-muted-foreground">
                                            <li>• Pagar fees de gas en cada transacción</li>
                                            <li>• ~0.0005 STX por certificado emitido</li>
                                            {stxToTransfer && parseFloat(stxToTransfer) > 0 && (
                                                <li className="font-medium text-foreground">
                                                    • Con {stxToTransfer} STX: ~{Math.floor(parseFloat(stxToTransfer) * 2000)} transacciones
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleFunding}
                                    disabled={
                                        isProcessing ||
                                        (fundingType === "credits" && !creditsToAdd) ||
                                        (fundingType === "stx" && !stxToTransfer)
                                    }
                                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                                >
                                    {isProcessing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            {fundingType === "credits" ? (
                                                <><Coins className="mr-2 h-4 w-4" /> Agregar Créditos</>
                                            ) : (
                                                <><ArrowUpRight className="mr-2 h-4 w-4" /> Transferir STX</>
                                            )}
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowFundingInput(false);
                                        setCreditsToAdd("");
                                        setStxToTransfer("");
                                    }}
                                    disabled={isProcessing}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            onClick={() => setShowFundingInput(true)}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                            disabled={isProcessing || !isActive}
                        >
                            <Coins className="mr-2 h-4 w-4" />
                            Fondear Academia
                        </Button>
                    )}
                </div>

                {/* Acciones */}
                <div className="grid grid-cols-1 gap-2">
                    {/* Activar/Desactivar */}
                    <Button
                        onClick={handleToggleStatus}
                        disabled={isProcessing}
                        variant="outline"
                        className={`w-full ${isActive
                            ? "border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
                            : "border-green-300 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/20"
                            }`}
                    >
                        {isProcessing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : isActive ? (
                            <PowerOff className="mr-2 h-4 w-4" />
                        ) : (
                            <Power className="mr-2 h-4 w-4" />
                        )}
                        {isActive ? "Desactivar Academia" : "Activar Academia"}
                    </Button>

                    {/* Validación */}
                    {academy.validation_status === "pending" && (
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                onClick={() => handleValidationStatus("approved")}
                                disabled={isProcessing}
                                className="bg-green-500 hover:bg-green-600 text-white"
                            >
                                {isProcessing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                )}
                                Aprobar
                            </Button>
                            <Button
                                onClick={() => handleValidationStatus("rejected")}
                                disabled={isProcessing}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                {isProcessing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <XCircle className="mr-2 h-4 w-4" />
                                )}
                                Rechazar
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mensajes */}
                {error && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/50 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}