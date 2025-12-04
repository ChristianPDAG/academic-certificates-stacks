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
import { Coins, CheckCircle, AlertCircle, DollarSign, RefreshCw } from "lucide-react";
import {
    adminFundSchoolManagerClient,
    setStxPerCreditManagerClient,
    getSchoolCreditsManagerClient,
    getStxPerCreditManagerClient,
} from "@/lib/stacks-client";

interface MessageType {
    type: "success" | "error";
    text: string;
}

export function CreditManagement() {
    const [message, setMessage] = useState<MessageType | null>(null);
    const [loading, setLoading] = useState(false);
    const [stxPerCredit, setStxPerCredit] = useState<number>(0);

    // Estados para fondear escuela
    const [showFundDialog, setShowFundDialog] = useState(false);
    const [fundData, setFundData] = useState({
        schoolPrincipal: "",
        credits: "",
    });

    // Estados para cambiar precio
    const [showPriceDialog, setShowPriceDialog] = useState(false);
    const [newPrice, setNewPrice] = useState("");

    // Estados para consultar créditos
    const [queryPrincipal, setQueryPrincipal] = useState("");
    const [schoolCredits, setSchoolCredits] = useState<number | null>(null);

    useEffect(() => {
        loadStxPerCredit();
    }, []);

    const loadStxPerCredit = async () => {
        try {
            const price = await getStxPerCreditManagerClient();
            setStxPerCredit(price);
        } catch (error) {
            console.error("Error loading STX per credit:", error);
        }
    };

    const showMessage = (type: "success" | "error", text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleFundSchool = async () => {
        if (!fundData.schoolPrincipal || !fundData.credits) {
            showMessage("error", "Complete todos los campos");
            return;
        }

        const credits = parseInt(fundData.credits);
        if (isNaN(credits) || credits <= 0) {
            showMessage("error", "Cantidad de créditos inválida");
            return;
        }

        setLoading(true);
        try {
            await adminFundSchoolManagerClient(fundData.schoolPrincipal, credits);
            showMessage(
                "success",
                `Escuela fondeada con ${credits} créditos (${(credits * stxPerCredit) / 1_000_000} STX)`
            );
            setShowFundDialog(false);
            setFundData({ schoolPrincipal: "", credits: "" });
        } catch (error) {
            showMessage("error", `Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSetPrice = async () => {
        const price = parseInt(newPrice);
        if (isNaN(price) || price < 0) {
            showMessage("error", "Precio inválido");
            return;
        }

        setLoading(true);
        try {
            await setStxPerCreditManagerClient(price);
            showMessage("success", `Precio actualizado a ${price / 1_000_000} STX por crédito`);
            setShowPriceDialog(false);
            setNewPrice("");
            loadStxPerCredit();
        } catch (error) {
            showMessage("error", `Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleQueryCredits = async () => {
        if (!queryPrincipal) return;
        setLoading(true);
        try {
            const credits = await getSchoolCreditsManagerClient(queryPrincipal);
            setSchoolCredits(credits);
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
                                <Coins className="h-5 w-5" />
                                Sistema de Créditos
                            </CardTitle>
                            <CardDescription>Administra los créditos de las escuelas</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={loadStxPerCredit}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Actualizar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Precio Actual */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 font-medium">Precio por Crédito</p>
                                <p className="text-2xl font-bold text-blue-900">
                                    {(stxPerCredit / 1_000_000).toFixed(6)} STX
                                </p>
                                <p className="text-xs text-blue-600">({stxPerCredit} microSTX)</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-blue-400" />
                        </div>
                    </div>

                    {/* Consultar Créditos */}
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold">Consultar Créditos de Escuela</h3>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Principal de la escuela"
                                value={queryPrincipal}
                                onChange={(e) => setQueryPrincipal(e.target.value)}
                            />
                            <Button onClick={handleQueryCredits} disabled={loading}>
                                Consultar
                            </Button>
                        </div>
                        {schoolCredits !== null && (
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Créditos Disponibles</p>
                                <p className="text-3xl font-bold">{schoolCredits}</p>
                            </div>
                        )}
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                        <Button onClick={() => setShowFundDialog(true)}>
                            <Coins className="h-4 w-4 mr-2" />
                            Fondear Escuela
                        </Button>
                        <Button variant="outline" onClick={() => setShowPriceDialog(true)}>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Cambiar Precio
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog: Fondear Escuela */}
            <Dialog open={showFundDialog} onOpenChange={setShowFundDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Fondear Escuela</DialogTitle>
                        <DialogDescription>
                            Asigna créditos a una escuela. Se transferirán STX desde tu wallet.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Principal de la Escuela</Label>
                            <Input
                                placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                                value={fundData.schoolPrincipal}
                                onChange={(e) =>
                                    setFundData({ ...fundData, schoolPrincipal: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Cantidad de Créditos</Label>
                            <Input
                                type="number"
                                placeholder="100"
                                value={fundData.credits}
                                onChange={(e) =>
                                    setFundData({ ...fundData, credits: e.target.value })
                                }
                            />
                            {fundData.credits && (
                                <p className="text-sm text-muted-foreground">
                                    Costo: ~
                                    {((parseInt(fundData.credits) * stxPerCredit) / 1_000_000).toFixed(6)}{" "}
                                    STX
                                </p>
                            )}
                        </div>
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                ⚠️ Se transferirán STX desde tu wallet al contrato.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowFundDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleFundSchool} disabled={loading}>
                            {loading ? "Procesando..." : "Fondear"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Cambiar Precio */}
            <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cambiar Precio por Crédito</DialogTitle>
                        <DialogDescription>
                            Establece el nuevo precio en microSTX (1 STX = 1,000,000 microSTX)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Precio en microSTX</Label>
                            <Input
                                type="number"
                                placeholder="2000"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                            />
                            {newPrice && (
                                <p className="text-sm text-muted-foreground">
                                    = {(parseInt(newPrice) / 1_000_000).toFixed(6)} STX por crédito
                                </p>
                            )}
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                💡 Precio actual: {(stxPerCredit / 1_000_000).toFixed(6)} STX
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPriceDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSetPrice} disabled={loading}>
                            {loading ? "Procesando..." : "Actualizar Precio"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}