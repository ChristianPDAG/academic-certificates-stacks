"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Calendar } from "lucide-react";

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
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grade */}
            <div className="space-y-2">
                <Label htmlFor="grade" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Calificación (Opcional)
                </Label>
                <Input
                    id="grade"
                    placeholder="A+, 95, Aprobado..."
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="bg-white dark:bg-neutral-800 border-2"
                    maxLength={20}
                />
            </div>

            {/* Graduation Date */}
            <div className="space-y-2">
                <Label htmlFor="gradDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha de Graduación <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="gradDate"
                    type="date"
                    value={graduationDate}
                    onChange={(e) => setGraduationDate(e.target.value)}
                    className="bg-white dark:bg-neutral-800 border-2"
                    required
                />
            </div>

            {/* Expiration Date */}
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="expirationDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha de Vencimiento (Opcional)
                </Label>
                <Input
                    id="expirationDate"
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="bg-white dark:bg-neutral-800 border-2"
                />
                <p className="text-xs text-muted-foreground">
                    Si se especifica, el certificado expirará en esta fecha. Se convertirá automáticamente a block height en la blockchain.
                </p>
            </div>
        </div>
    );
}
