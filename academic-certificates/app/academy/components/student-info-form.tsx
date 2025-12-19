"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, User, IdCard, Wallet, Search, Loader2 } from "lucide-react";

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
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Email */}
            <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email del Estudiante
                </Label>
                <div className="flex gap-2">
                    <Input
                        id="email"
                        type="email"
                        placeholder="estudiante@ejemplo.com"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        className="bg-white dark:bg-neutral-800 border-2"
                    />
                    <Button
                        type="button"
                        onClick={onSearchWallet}
                        disabled={isLoadingWallet}
                        variant="outline"
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
                    Nombre Completo del Estudiante <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="studentName"
                    type="text"
                    placeholder="Juan Pérez García"
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
                    Identificación del Estudiante <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="studentIdentifier"
                    type="text"
                    placeholder="DNI, RUT, Pasaporte..."
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
                    Wallet del Estudiante
                </Label>
                <Input
                    id="wallet"
                    placeholder="SP..."
                    value={studentWallet}
                    onChange={(e) => setStudentWallet(e.target.value)}
                    className="bg-white dark:bg-neutral-800 border-2 font-mono text-sm"
                />
            </div>
        </div>
    );
}
