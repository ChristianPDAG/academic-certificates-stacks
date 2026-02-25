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
    const { t } = useTranslation();
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
            showMessage("error", t("admin.dataSettings.validAddress"));
            return;
        }

        if (newSuperAdmin === currentSuperAdmin) {
            showMessage("error", t("admin.dataSettings.differentAddress"));
            return;
        }

        setLoading(true);
        try {
            await changeSuperAdminDataClient(newSuperAdmin);
            showMessage(
                "success",
                t("admin.dataSettings.transactionSent")
            );
            setShowChangeAdminDialog(false);
            setNewSuperAdmin("");
            setTimeout(() => loadSuperAdmin(), 3000);
        } catch (error) {
            showMessage("error", `${t("admin.dataSettings.error")}: ${error}`);
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
                                {t("admin.dataSettings.title")}
                            </CardTitle>
                            <CardDescription>
                                {t("admin.dataSettings.description")}
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={loadSuperAdmin}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {t("admin.dataSettings.refresh")}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Super Admin Actual */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-purple-600" />
                            {t("admin.dataSettings.currentSuperAdmin")}
                        </Label>
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <p className="font-mono text-sm break-all text-purple-900">
                                {currentSuperAdmin || t("admin.dataSettings.loading")}
                            </p>
                        </div>
                    </div>

                    {/* Información Importante */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                        <p className="text-sm font-semibold text-amber-900">
                            {t("admin.dataSettings.aboutTitle")}
                        </p>
                        <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                            <li>{t("admin.dataSettings.info1")}</li>
                            <li>{t("admin.dataSettings.info2")}</li>
                            <li>{t("admin.dataSettings.info3")}</li>
                            <li>{t("admin.dataSettings.info4")}</li>
                        </ul>
                    </div>

                    {/* Acción */}
                    <div className="pt-4 border-t">
                        <Button
                            variant="destructive"
                            onClick={() => setShowChangeAdminDialog(true)}
                        >
                            <Shield className="h-4 w-4 mr-2" />
                            {t("admin.dataSettings.changeSuperAdmin")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog: Cambiar Super Admin */}
            <Dialog open={showChangeAdminDialog} onOpenChange={setShowChangeAdminDialog}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{t("admin.dataSettings.changeDialogTitle")}</DialogTitle>
                        <DialogDescription>
                            {t("admin.dataSettings.changeDialogDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("admin.dataSettings.currentAdmin")}</Label>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="font-mono text-xs break-all">
                                    {currentSuperAdmin}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{t("admin.dataSettings.newAdmin")}</Label>
                            <Input
                                placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                                value={newSuperAdmin}
                                onChange={(e) => setNewSuperAdmin(e.target.value)}
                            />
                        </div>

                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
                            <p className="text-sm font-bold text-red-900">
                                {t("admin.dataSettings.criticalWarningTitle")}
                            </p>
                            <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                                <li>{t("admin.dataSettings.warning1")}</li>
                                <li>{t("admin.dataSettings.warning2")}</li>
                                <li>{t("admin.dataSettings.warning3")}</li>
                                <li>{t("admin.dataSettings.warning4")}</li>
                            </ul>
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                {t("admin.dataSettings.tip")}
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
                            {t("admin.dataSettings.cancel")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleChangeSuperAdmin}
                            disabled={loading || !newSuperAdmin.trim()}
                        >
                            {loading ? t("admin.dataSettings.processing") : t("admin.dataSettings.confirmChange")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
