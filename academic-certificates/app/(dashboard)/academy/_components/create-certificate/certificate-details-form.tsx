"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CertificateDetailsFormProps {
    grade: string;
    setGrade: (value: string) => void;
    graduationDate: string;
    setGraduationDate: (value: string) => void;
    expirationDate: string;
    setExpirationDate: (value: string) => void;
}

export function CertificateDetailsForm({
    grade,
    setGrade,
    graduationDate,
    setGraduationDate,
    expirationDate,
    setExpirationDate,
}: CertificateDetailsFormProps) {
    const { t } = useTranslation();
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Grade */}
            <div className="space-y-1.5">
                <Label htmlFor="grade" className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-sky-500" />
                    {t("academy.createCertificate.grade")}
                </Label>
                <Input
                    id="grade"
                    placeholder={t("academy.createCertificate.gradePlaceholder")}
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    maxLength={20}
                />
            </div>

            {/* Graduation Date */}
            <div className="space-y-1.5">
                <Label htmlFor="gradDate" className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-sky-500" />
                    {t("academy.createCertificate.graduationDateRequired")}
                </Label>
                <Input
                    id="gradDate"
                    type="date"
                    value={graduationDate}
                    onChange={(e) => setGraduationDate(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    required
                />
            </div>

            {/* Expiration Date */}
            <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="expirationDate" className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-sky-500" />
                    {t("academy.createCertificate.expirationDate")}
                </Label>
                <Input
                    id="expirationDate"
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t("academy.createCertificate.expirationDateNote")}
                </p>
            </div>
        </div>
    );
}
