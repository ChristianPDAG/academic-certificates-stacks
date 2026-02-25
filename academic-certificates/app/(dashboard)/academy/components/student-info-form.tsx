"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, User, IdCard, Wallet, Search, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StudentInfoFormProps {
    studentEmail: string;
    setStudentEmail: (value: string) => void;
    studentName: string;
    setStudentName: (value: string) => void;
    studentIdentifier: string;
    setStudentIdentifier: (value: string) => void;
    studentWallet: string;
    setStudentWallet: (value: string) => void;
    isLoadingWallet: boolean;
    onSearchWallet: () => void;
}

export function StudentInfoForm({
    studentEmail,
    setStudentEmail,
    studentName,
    setStudentName,
    studentIdentifier,
    setStudentIdentifier,
    studentWallet,
    setStudentWallet,
    isLoadingWallet,
    onSearchWallet,
}: StudentInfoFormProps) {
    const { t } = useTranslation();
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Email */}
            <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t("academy.createCertificate.studentEmail")}
                </Label>
                <div className="flex gap-2">
                    <Input
                        id="email"
                        type="email"
                        placeholder={t("academy.createCertificate.studentEmailPlaceholder")}
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        className="bg-white dark:bg-neutral-800 border-2"
                    />
                    <Button
                        type="button"
                        onClick={onSearchWallet}
                        disabled={isLoadingWallet}
                        variant="outline"
                        title={t("academy.createCertificate.searchWallet")}
                    >
                        {isLoadingWallet ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Student Name */}
            <div className="space-y-2">
                <Label htmlFor="studentName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("academy.createCertificate.studentNameRequired")}
                </Label>
                <Input
                    id="studentName"
                    type="text"
                    placeholder={t("academy.createCertificate.studentNamePlaceholder")}
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                    className="bg-white dark:bg-neutral-800 border-2"
                />
            </div>

            {/* Student Identifier */}
            <div className="space-y-2">
                <Label htmlFor="studentIdentifier" className="flex items-center gap-2">
                    <IdCard className="h-4 w-4" />
                    {t("academy.createCertificate.studentIdentifierRequired")}
                </Label>
                <Input
                    id="studentIdentifier"
                    type="text"
                    placeholder={t("academy.createCertificate.studentIdentifierPlaceholder")}
                    value={studentIdentifier}
                    onChange={(e) => setStudentIdentifier(e.target.value)}
                    required
                    className="bg-white dark:bg-neutral-800 border-2"
                />
            </div>

            {/* Student Wallet */}
            <div className="space-y-2">
                <Label htmlFor="wallet" className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    {t("academy.createCertificate.studentWallet")}
                </Label>
                <Input
                    id="wallet"
                    placeholder={t("academy.createCertificate.studentWalletPlaceholder")}
                    value={studentWallet}
                    onChange={(e) => setStudentWallet(e.target.value)}
                    className="bg-white dark:bg-neutral-800 border-2 font-mono text-sm"
                />
            </div>
        </div>
    );
}
