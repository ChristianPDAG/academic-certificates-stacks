"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
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
} from "@/lib/stacks/admin/schools-manager";

interface MessageType {
    type: "success" | "error";
    text: string;
}

export function SchoolManagement() {
    const { t } = useTranslation();
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
            showMessage("error", t("admin.schools.requiredFields"));
            return;
        }

        setLoading(true);
        try {
            await addSchoolManagerClient(
                newSchool.principal,
                newSchool.name,
                newSchool.metadataUrl || ""
            );
            showMessage("success", t("admin.schools.schoolAdded"));
            setShowAddDialog(false);
            setNewSchool({ principal: "", name: "", metadataUrl: "" });
        } catch (error) {
            showMessage("error", `${t("admin.schools.error")}: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivateSchool = async (principal: string) => {
        if (!principal) return;
        setLoading(true);
        try {
            await deactivateSchoolManagerClient(principal);
            showMessage("success", t("admin.schools.schoolDeactivated"));
        } catch (error) {
            showMessage("error", `${t("admin.schools.error")}: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReactivateSchool = async (principal: string) => {
        if (!principal) return;
        setLoading(true);
        try {
            await reactivateSchoolManagerClient(principal);
            showMessage("success", t("admin.schools.schoolReactivated"));
        } catch (error) {
            showMessage("error", `${t("admin.schools.error")}: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySchool = async (principal: string) => {
        if (!principal) return;
        setLoading(true);
        try {
            await verifySchoolManagerClient(principal);
            showMessage("success", t("admin.schools.schoolVerified"));
        } catch (error) {
            showMessage("error", `${t("admin.schools.error")}: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUnverifySchool = async (principal: string) => {
        if (!principal) return;
        setLoading(true);
        try {
            await unverifySchoolManagerClient(principal);
            showMessage("success", t("admin.schools.verificationRemoved"));
        } catch (error) {
            showMessage("error", `${t("admin.schools.error")}: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMetadata = async () => {
        if (!metadataUpdate.principal || !metadataUpdate.url) {
            showMessage("error", t("admin.schools.allFields"));
            return;
        }

        setLoading(true);
        try {
            await updateSchoolMetadataUrlManagerClient(
                metadataUpdate.principal,
                metadataUpdate.url
            );
            showMessage("success", t("admin.schools.metadataUpdated"));
            setShowMetadataDialog(false);
            setMetadataUpdate({ principal: "", url: "" });
        } catch (error) {
            showMessage("error", `${t("admin.schools.error")}: ${error}`);
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
                showMessage("error", t("admin.schools.schoolNotFound"));
            }
        } catch (error) {
            showMessage("error", `${t("admin.schools.error")}: ${error}`);
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
                        {t("admin.schools.title")}
                    </CardTitle>
                    <CardDescription>{t("admin.schools.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Consultar Escuela */}
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold">{t("admin.schools.querySchool")}</h3>
                        <div className="flex gap-2">
                            <Input
                                placeholder={t("admin.schools.schoolPrincipalPlaceholder")}
                                value={queryPrincipal}
                                onChange={(e) => setQueryPrincipal(e.target.value)}
                            />
                            <Button onClick={handleQuerySchool} disabled={loading}>
                                {t("admin.schools.query")}
                            </Button>
                        </div>
                        {schoolInfo && (
                            <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                                <p><strong>{t("admin.schools.name")}:</strong> {schoolInfo.name}</p>
                                <p><strong>{t("admin.schools.active")}:</strong> {schoolInfo.active ? t("admin.schools.yes") : t("admin.schools.no")}</p>
                                <p><strong>{t("admin.schools.verified")}:</strong> {schoolInfo.verified ? t("admin.schools.yes") : t("admin.schools.no")}</p>
                                <p><strong>{t("admin.schools.metadataUrl")}:</strong> {schoolInfo["metadata-url"] || t("admin.schools.notApplicable")}</p>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {schoolInfo.active ? (
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDeactivateSchool(queryPrincipal)}
                                            disabled={loading}
                                        >
                                            {t("admin.schools.deactivate")}
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="default"
                                            onClick={() => handleReactivateSchool(queryPrincipal)}
                                            disabled={loading}
                                        >
                                            {t("admin.schools.reactivate")}
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
                                            {t("admin.schools.removeVerification")}
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleVerifySchool(queryPrincipal)}
                                            disabled={loading}
                                        >
                                            <ShieldCheck className="h-4 w-4 mr-2" />
                                            {t("admin.schools.verify")}
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
                            {t("admin.schools.addSchool")}
                        </Button>
                        <Button variant="outline" onClick={() => setShowMetadataDialog(true)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t("admin.schools.updateMetadata")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog: Agregar Escuela */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("admin.schools.addNewSchool")}</DialogTitle>
                        <DialogDescription>
                            {t("admin.schools.addSchoolDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("admin.schools.schoolPrincipalRequired")}</Label>
                            <Input
                                placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                                value={newSchool.principal}
                                onChange={(e) =>
                                    setNewSchool({ ...newSchool, principal: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("admin.schools.nameRequired")}</Label>
                            <Input
                                placeholder={t("admin.schools.namePlaceholder")}
                                value={newSchool.name}
                                onChange={(e) =>
                                    setNewSchool({ ...newSchool, name: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("admin.schools.metadataUrl")}</Label>
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
                            {t("admin.schools.cancel")}
                        </Button>
                        <Button onClick={handleAddSchool} disabled={loading}>
                            {loading ? t("admin.schools.processing") : t("admin.schools.addSchoolButton")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Actualizar Metadata */}
            <Dialog open={showMetadataDialog} onOpenChange={setShowMetadataDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("admin.schools.updateMetadataUrl")}</DialogTitle>
                        <DialogDescription>
                            {t("admin.schools.updateMetadataDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("admin.schools.schoolPrincipal")}</Label>
                            <Input
                                placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                                value={metadataUpdate.principal}
                                onChange={(e) =>
                                    setMetadataUpdate({ ...metadataUpdate, principal: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("admin.schools.newMetadataUrl")}</Label>
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
                            {t("admin.schools.cancel")}
                        </Button>
                        <Button onClick={handleUpdateMetadata} disabled={loading}>
                            {loading ? t("admin.schools.processing") : t("admin.schools.update")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}