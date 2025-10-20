"use client";

import { WalletConnection } from "@/components/wallet-connection";
import AcademyDashboard from "@/components/academy-dashboard";
import { signAcademicCertificate, } from "@/lib/stacks-academy";
import { getAcademyCredentials, getStudentWallet } from "@/app/actions/academy";
import { useState } from "react";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Input } from "./ui/input";

export function AcademyContent(id: string) {
    const [studentEmail, setStudentEmail] = useState("");
    const [studentId, setStudentId] = useState("");
    const [course, setCourse] = useState("");
    const [grade, setGrade] = useState("");
    const [studentWallet, setStudentWallet] = useState("");
    const [isLoadingWallet, setIsLoadingWallet] = useState(false);

    const handleSearchWallet = async () => {
        if (!studentEmail.trim()) {
            alert("Por favor ingresa un ID de estudiante");
            return;
        }

        setIsLoadingWallet(true);
        try {
            const studentData = await getStudentWallet(studentEmail);
            if (studentData) {
                setStudentWallet(studentData.stacks_address);
                setStudentId(studentData.id);
            } else {
                alert("No se encontró wallet para este estudiante");
                setStudentWallet("");
            }
        } catch (error) {
            console.error("Error buscando wallet:", error);
            alert("Error al buscar la wallet del estudiante");
        } finally {
            setIsLoadingWallet(false);
        }
    };

    const handleTestContract = async () => {
        console.log("🧪 [AcademyContent] Iniciando prueba del contrato...");
        try {
            const { stacksAddress, privateKey } = await getAcademyCredentials(id);
            await signAcademicCertificate(studentId, course, grade, studentWallet, privateKey!);
        } catch (error) {
            console.error("🚨 [AcademyContent] Error en la prueba:", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Botón de prueba fuera del WalletConnection */}
            <form action="">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                        <Label className="block text-sm font-medium text-gray-700">
                            Email del Estudiante
                        </Label>
                        <Input
                            type="text"
                            value={studentEmail}
                            onChange={(e) => setStudentEmail(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <Label className="block text-sm font-medium text-gray-700">
                            ID del Estudiante (DNI)
                        </Label>
                        <Input
                            type="text"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <Label className="block text-sm font-medium text-gray-700">
                            Wallet
                        </Label>
                        <div className="flex gap-2 mt-1">
                            <Input
                                type="text"
                                value={studentWallet}
                                onChange={(e) => setStudentWallet(e.target.value)}
                                className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="Se completará automáticamente"
                            />
                            <button
                                type="button"
                                onClick={handleSearchWallet}
                                disabled={isLoadingWallet || !studentEmail.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {isLoadingWallet ? "Buscando..." : "Buscar Wallet"}
                            </button>
                        </div>
                    </div>
                    <div>
                        <Label className="block text-sm font-medium text-gray-700">
                            Curso
                        </Label>
                        <Input
                            type="text"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <Label className="block text-sm font-medium text-gray-700">
                            Calificación
                        </Label>
                        <Input
                            type="text"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>

                </div>
            </form>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    🧪 Prueba de Contrato
                </h3>
                <p className="text-yellow-700 mb-3 text-sm">
                    Prueba la funcionalidad del contrato sin necesidad de conectar wallet
                </p>
                <button
                    onClick={handleTestContract}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    Certificar Estudiante!
                </button>
            </div>

            {/* Componente normal con WalletConnection 
            <WalletConnection>
                <AcademyDashboard />
            </WalletConnection>
            */}
        </div>
    );
}