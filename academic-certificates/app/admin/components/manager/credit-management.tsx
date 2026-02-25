"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
    getSchoolCreditsManagerClient,
    adminFundSchoolManagerClient,
    setStxPerCreditManagerClient,
    getStxPerCreditManagerClient
} from "@/lib/stacks/admin/fund-schools-manager"

interface MessageType {
    type: "success" | "error";
    text: string;
}

export function CreditManagement() {
    const { t } = useTranslation();
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
            showMessage("error", t("admin.credits.allFields"));
            return;
        }

        const credits = parseInt(fundData.credits);
        if (isNaN(credits) || credits <= 0) {
            showMessage("error", t("admin.credits.invalidAmount"));
            return;
        }

        setLoading(true);
        try {
            await adminFundSchoolManagerClient(fundData.schoolPrincipal, credits);
            showMessage(
                "success",
                t("admin.credits.schoolFunded", { credits, amount: (credits * stxPerCredit) / 1_000_000 })
            );
            setShowFundDialog(false);
            setFundData({ schoolPrincipal: "", credits: "" });
        } catch (error) {
            showMessage("error", `${t("admin.credits.error")}: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSetPrice = async () => {
        const price = parseInt(newPrice);
        if (isNaN(price) || price < 0) {
            showMessage("error", t("admin.credits.invalidPrice"));
            return;
        }

        setLoading(true);
        try {
            await setStxPerCreditManagerClient(price);
            showMessage("success", t("admin.credits.priceUpdated", { price: price / 1_000_000 }));
            setShowPriceDialog(false);
            setNewPrice("");
            loadStxPerCredit();
        } catch (error) {
            showMessage("error", `${t("admin.credits.error")}: ${error}`);
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
            showMessage("error", `${t("admin.credits.error")}: ${error}`);
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
                                {t("admin.credits.title")}
                            </CardTitle>
                            <CardDescription>{t("admin.credits.description")}</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={loadStxPerCredit}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {t("admin.credits.refresh")}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Precio Actual */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 font-medium">{t("admin.credits.pricePerCredit")}</p>
                                <p className="text-2xl font-bold text-blue-900">
                                    {(stxPerCredit / 1_000_000).toFixed(6)} STX
                                </p>
                                <p className="text-xs text-blue-600">({stxPerCredit} {t("admin.credits.microStx")})</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-blue-400" />
                        </div>
                    </div>

                    {/* Consultar Créditos */}
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold">{t("admin.credits.queryCredits")}</h3>
                        <div className="flex gap-2">
                            <Input
                                placeholder={t("admin.credits.schoolPrincipalPlaceholder")}
                                value={queryPrincipal}
                                onChange={(e) => setQueryPrincipal(e.target.value)}
                            />
                            <Button onClick={handleQueryCredits} disabled={loading}>
                                {t("admin.credits.query")}
                            </Button>
                        </div>
                        {schoolCredits !== null && (
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">{t("admin.credits.availableCredits")}</p>
                                <p className="text-3xl font-bold">{schoolCredits}</p>
                            </div>
                        )}
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                        <Button onClick={() => setShowFundDialog(true)}>
                            <Coins className="h-4 w-4 mr-2" />
                            {t("admin.credits.fundSchool")}
                        </Button>
                        <Button variant="outline" onClick={() => setShowPriceDialog(true)}>
                            <DollarSign className="h-4 w-4 mr-2" />
                            {t("admin.credits.changePrice")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog: Fondear Escuela */}
            <Dialog open={showFundDialog} onOpenChange={setShowFundDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("admin.credits.fundSchool")}</DialogTitle>
                        <DialogDescription>
                            {t("admin.credits.fundDialogDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("admin.credits.schoolPrincipal")}</Label>
                            <Input
                                placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                                value={fundData.schoolPrincipal}
                                onChange={(e) =>
                                    setFundData({ ...fundData, schoolPrincipal: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("admin.credits.creditsAmount")}</Label>
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
                                    {t("admin.credits.cost")}: ~
                                    {((parseInt(fundData.credits) * stxPerCredit) / 1_000_000).toFixed(6)}{" "}
                                    STX
                                </p>
                            )}
                        </div>
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                {t("admin.credits.stxTransferWarning")}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowFundDialog(false)}>
                            {t("admin.credits.cancel")}
                        </Button>
                        <Button onClick={handleFundSchool} disabled={loading}>
                            {loading ? t("admin.credits.processing") : t("admin.credits.fund")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Cambiar Precio */}
            <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("admin.credits.changePricePerCredit")}</DialogTitle>
                        <DialogDescription>
                            {t("admin.credits.priceDialogDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("admin.credits.priceInMicroStx")}</Label>
                            <Input
                                type="number"
                                placeholder="2000"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                            />
                            {newPrice && (
                                <p className="text-sm text-muted-foreground">
                                    = {(parseInt(newPrice) / 1_000_000).toFixed(6)} {t("admin.credits.stxPerCredit")}
                                </p>
                            )}
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                {t("admin.credits.currentPriceInfo", { price: (stxPerCredit / 1_000_000).toFixed(6) })}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPriceDialog(false)}>
                            {t("admin.credits.cancel")}
                        </Button>
                        <Button onClick={handleSetPrice} disabled={loading}>
                            {loading ? t("admin.credits.processing") : t("admin.credits.updatePrice")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}