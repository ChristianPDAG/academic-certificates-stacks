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
import { Database, CheckCircle, AlertCircle, Shield, Key, RefreshCw } from "lucide-react";
import {
    authorizeWriterDataClient,
    revokeWriterDataClient,
    isWriterAuthorizedDataClient,
    getSuperAdminDataClient,
} from "@/lib/stacks/admin/data-manager";

interface MessageType {
    type: "success" | "error";
    text: string;
}

export function DataContractManagement() {
    const { t } = useTranslation();
    const [message, setMessage] = useState<MessageType | null>(null);
    const [loading, setLoading] = useState(false);
    const [superAdmin, setSuperAdmin] = useState<string>("");

    // Estados para autorizar escritor
    const [showAuthorizeDialog, setShowAuthorizeDialog] = useState(false);
    const [writerToAuthorize, setWriterToAuthorize] = useState("");

    // Estados para revocar escritor
    const [showRevokeDialog, setShowRevokeDialog] = useState(false);
    const [writerToRevoke, setWriterToRevoke] = useState("");

    // Estados para verificar autorización
    const [queryContract, setQueryContract] = useState("");
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        loadSuperAdmin();
    }, []);

    const loadSuperAdmin = async () => {
        try {
            const admin = await getSuperAdminDataClient();
            setSuperAdmin(admin);
        } catch (error) {
            console.error("Error loading super admin:", error);
        }
    };

    const showMessage = (type: "success" | "error", text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleAuthorizeWriter = async () => {
        if (!writerToAuthorize.trim()) {
            showMessage("error", t("admin.dataContract.validAddress"));
            return;
        }

        setLoading(true);
        try {
            await authorizeWriterDataClient(writerToAuthorize);
            showMessage("success", t("admin.dataContract.contractAuthorized"));
            setShowAuthorizeDialog(false);
            setWriterToAuthorize("");
        } catch (error) {
            showMessage("error", `${t("admin.dataContract.error")}: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeWriter = async () => {
        if (!writerToRevoke.trim()) {
            showMessage("error", t("admin.dataContract.validAddress"));
            return;
        }

        setLoading(true);
        try {
            await revokeWriterDataClient(writerToRevoke);
            showMessage("success", t("admin.dataContract.authorizationRevoked"));
            setShowRevokeDialog(false);
            setWriterToRevoke("");
        } catch (error) {
            showMessage("error", `${t("admin.dataContract.error")}: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckAuthorization = async () => {
        if (!queryContract.trim()) {
            showMessage("error", t("admin.dataContract.enterAddress"));
            return;
        }

        setLoading(true);
        try {
            const authorized = await isWriterAuthorizedDataClient(queryContract);
            setIsAuthorized(authorized);
        } catch (error) {
            showMessage("error", `${t("admin.dataContract.error")}: ${error}`);
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
                                <Database className="h-5 w-5" />
                                {t("admin.dataContract.title")}
                            </CardTitle>
                            <CardDescription>
                                {t("admin.dataContract.description")}
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={loadSuperAdmin}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {t("admin.dataContract.refresh")}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Super Admin Info */}
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-purple-600" />
                            <p className="text-sm text-purple-600 font-medium">
                                {t("admin.dataContract.superAdmin")}
                            </p>
                        </div>
                        <p className="font-mono text-xs break-all text-purple-900">
                            {superAdmin || t("admin.dataContract.loading")}
                        </p>
                    </div>

                    {/* Verificar Autorización */}
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            {t("admin.dataContract.verifyAuthorization")}
                        </h3>
                        <div className="flex gap-2">
                            <Input
                                placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.certificate-manager-v1"
                                value={queryContract}
                                onChange={(e) => setQueryContract(e.target.value)}
                            />
                            <Button onClick={handleCheckAuthorization} disabled={loading}>
                                {t("admin.dataContract.verify")}
                            </Button>
                        </div>
                        {isAuthorized !== null && (
                            <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
                                <span className="text-sm font-medium">{t("admin.dataContract.authorizationStatus")}:</span>
                                <Badge variant={isAuthorized ? "default" : "destructive"}>
                                    {isAuthorized ? t("admin.dataContract.authorized") : t("admin.dataContract.notAuthorized")}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                        <Button onClick={() => setShowAuthorizeDialog(true)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {t("admin.dataContract.authorizeContract")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setShowRevokeDialog(true)}
                        >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {t("admin.dataContract.revokeAuthorization")}
                        </Button>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            {t("admin.dataContract.importantInfo")}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog: Autorizar Contrato */}
            <Dialog open={showAuthorizeDialog} onOpenChange={setShowAuthorizeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("admin.dataContract.authorizeWriterContract")}</DialogTitle>
                        <DialogDescription>
                            {t("admin.dataContract.authorizeDialogDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("admin.dataContract.contractAddress")}</Label>
                            <Input
                                placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.certificate-manager-v1"
                                value={writerToAuthorize}
                                onChange={(e) => setWriterToAuthorize(e.target.value)}
                            />
                        </div>
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                {t("admin.dataContract.superAdminOnlyWarning")}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowAuthorizeDialog(false);
                                setWriterToAuthorize("");
                            }}
                            disabled={loading}
                        >
                            {t("admin.dataContract.cancel")}
                        </Button>
                        <Button
                            onClick={handleAuthorizeWriter}
                            disabled={loading || !writerToAuthorize.trim()}
                        >
                            {loading ? t("admin.dataContract.processing") : t("admin.dataContract.authorize")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Revocar Autorización */}
            <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("admin.dataContract.revokeWriterAuthorization")}</DialogTitle>
                        <DialogDescription>
                            {t("admin.dataContract.revokeDialogDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("admin.dataContract.contractAddress")}</Label>
                            <Input
                                placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.certificate-manager-v1"
                                value={writerToRevoke}
                                onChange={(e) => setWriterToRevoke(e.target.value)}
                            />
                        </div>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800 font-semibold">
                                {t("admin.dataContract.revokeWarning")}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRevokeDialog(false);
                                setWriterToRevoke("");
                            }}
                            disabled={loading}
                        >
                            {t("admin.dataContract.cancel")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRevokeWriter}
                            disabled={loading || !writerToRevoke.trim()}
                        >
                            {loading ? t("admin.dataContract.processing") : t("admin.dataContract.revoke")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
