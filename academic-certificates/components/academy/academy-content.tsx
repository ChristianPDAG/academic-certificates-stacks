"use client";

import { signAcademicCertificate } from "@/lib/stacks-academy";
import { getAcademyCredentials, getStudentWallet } from "@/app/actions/academy";
import { useState } from "react";
import { motion } from "framer-motion";
import { slideInFromBottom } from "@/utils/motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Award,
    Search,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Wallet,
    GraduationCap,
    BookOpen,
    Star,
    AlertTriangle,
    Loader2
} from "lucide-react";

type TransactionStatus = "idle" | "loading" | "success" | "error" | "insufficient-funds";
interface AcademyContentProps {
    id: string;
}
export function AcademyContent({ id }: AcademyContentProps) {
    const [studentEmail, setStudentEmail] = useState("");
    const [studentId, setStudentId] = useState("");
    const [course, setCourse] = useState("");
    const [grade, setGrade] = useState("");
    const [studentWallet, setStudentWallet] = useState("");
    const [isLoadingWallet, setIsLoadingWallet] = useState(false);
    const [txid, setTxid] = useState("");
    const [urlTransaction, setUrlTransaction] = useState("");
    const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSearchWallet = async () => {
        if (!studentEmail.trim()) {
            alert("Por favor ingresa un email de estudiante");
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

    const handleCertifyStudent = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones
        if (!studentEmail.trim() || !studentId.toString().trim() || !course.trim() || !grade.trim() || !studentWallet.trim()) {
            alert("Por favor completa todos los campos");
            return;
        }

        console.log("🧪 [AcademyContent] Iniciando certificación del estudiante...");
        setTransactionStatus("loading");
        setTxid("");
        setUrlTransaction("");
        setErrorMessage("");

        try {
            const { stacksAddress, privateKey } = await getAcademyCredentials(id);
            const result = await signAcademicCertificate(studentId, course, grade, studentWallet, privateKey!);

            if (result && result.success === true) {
                console.log("🏆 [AcademyContent] ¡ÉXITO! Certificado firmado");
                console.log("🔗 [AcademyContent] ID de transacción:", result.txid);
                console.log("🌐 [AcademyContent] Ver en explorador:", result.urlTransaction);
                setTxid(result.txid);
                setUrlTransaction(result.urlTransaction);
                setTransactionStatus("success");
            } else {
                // Manejar el caso donde la transacción fue rechazada
                setTransactionStatus("error");
                setErrorMessage("Error al procesar la transacción");
            }
        } catch (error: any) {
            console.error("🚨 [AcademyContent] Error en la certificación:", error);

            // Verificar si el error es por fondos insuficientes
            if (error?.message?.includes("NotEnoughFunds") ||
                error?.reason === "NotEnoughFunds" ||
                error?.error === "transaction rejected") {
                setTransactionStatus("insufficient-funds");
                setErrorMessage("La academia no tiene suficientes fondos para generar el certificado");
            } else {
                setTransactionStatus("error");
                setErrorMessage(error?.message || "Error desconocido al procesar la transacción");
            }
        }
    };

    return (
        <main className="relative flex bg-white dark:bg-black-100 justify-center items-center flex-col overflow-hidden mx-auto min-h-screen py-20">
            <div className="bg-[url('/bg-nodes-2.svg')] w-full h-full bg-cover bg-center absolute top-0 left-0 opacity-30 dark:opacity-20 -z-10" />

            <div className="container mx-auto max-w-6xl z-10 px-4 lg:px-8">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={"offScreen"}
                    whileInView={"onScreen"}
                    viewport={{ once: true }}
                    variants={slideInFromBottom({ delay: 0.2 })}
                >
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="p-4 bg-gradient-to-br from-[#00A1FF]/20 to-[#00A1FF]/10 rounded-full border-2 border-[#00A1FF]/30">
                            <Award className="h-10 w-10 text-[#00A1FF]" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-bold mb-4 text-neutral-900 dark:text-white">
                        Certificación <span className="text-[#00A1FF]">Académica</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-neutral-700 dark:text-neutral-300 max-w-3xl mx-auto">
                        Emite certificados académicos verificables en la blockchain de Stacks
                    </p>
                </motion.div>

                {/* Formulario de Certificación */}
                <motion.div
                    initial={"offScreen"}
                    whileInView={"onScreen"}
                    viewport={{ once: true }}
                    variants={slideInFromBottom({ delay: 0.4 })}
                >
                    <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-2 border-neutral-200 dark:border-neutral-800 shadow-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl text-neutral-900 dark:text-white">
                                <div className="p-2 bg-[#00A1FF]/10 rounded-lg">
                                    <GraduationCap className="h-6 w-6 text-[#00A1FF]" />
                                </div>
                                Datos del Certificado
                            </CardTitle>
                            <CardDescription className="text-neutral-600 dark:text-neutral-400 text-base">
                                Completa la información del estudiante para generar su certificado en la blockchain
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCertifyStudent} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Email del Estudiante */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-neutral-800 dark:text-neutral-200 font-semibold flex items-center gap-2">
                                            <Search className="h-4 w-4 text-[#00A1FF]" />
                                            Email del Estudiante
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="estudiante@ejemplo.com"
                                            value={studentEmail}
                                            onChange={(e) => setStudentEmail(e.target.value)}
                                            className="bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 focus:border-[#00A1FF] focus:ring-4 focus:ring-[#00A1FF]/20 text-neutral-900 dark:text-neutral-100"
                                        />
                                    </div>

                                    {/* ID del Estudiante */}
                                    <div className="space-y-2">
                                        <Label htmlFor="studentId" className="text-neutral-800 dark:text-neutral-200 font-semibold flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-[#00A1FF]" />
                                            ID del Estudiante (DNI)
                                        </Label>
                                        <Input
                                            id="studentId"
                                            type="text"
                                            placeholder="12345678"
                                            value={studentId}
                                            onChange={(e) => setStudentId(e.target.value)}
                                            className="bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 focus:border-[#00A1FF] focus:ring-4 focus:ring-[#00A1FF]/20 text-neutral-900 dark:text-neutral-100"
                                        />
                                    </div>

                                    {/* Wallet */}
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="wallet" className="text-neutral-800 dark:text-neutral-200 font-semibold flex items-center gap-2">
                                            <Wallet className="h-4 w-4 text-[#00A1FF]" />
                                            Dirección de Wallet
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="wallet"
                                                type="text"
                                                placeholder="ST1PQHQKV0..."
                                                value={studentWallet}
                                                onChange={(e) => setStudentWallet(e.target.value)}
                                                className="flex-1 font-mono text-sm bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 focus:border-[#00A1FF] focus:ring-4 focus:ring-[#00A1FF]/20 text-neutral-900 dark:text-neutral-100"
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleSearchWallet}
                                                disabled={isLoadingWallet || !studentEmail.trim()}
                                                className="bg-gradient-to-r from-[#00A1FF] to-[#0081CC] hover:from-[#0081CC] hover:to-[#0066A3] text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                                            >
                                                {isLoadingWallet ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Buscando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Search className="h-4 w-4 mr-2" />
                                                        Buscar
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Curso */}
                                    <div className="space-y-2">
                                        <Label htmlFor="course" className="text-neutral-800 dark:text-neutral-200 font-semibold flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-[#00A1FF]" />
                                            Nombre del Curso
                                        </Label>
                                        <Input
                                            id="course"
                                            type="text"
                                            placeholder="Intro to Clarity"
                                            value={course}
                                            onChange={(e) => setCourse(e.target.value)}
                                            className="bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 focus:border-[#00A1FF] focus:ring-4 focus:ring-[#00A1FF]/20 text-neutral-900 dark:text-neutral-100"
                                        />
                                    </div>

                                    {/* Calificación */}
                                    <div className="space-y-2">
                                        <Label htmlFor="grade" className="text-neutral-800 dark:text-neutral-200 font-semibold flex items-center gap-2">
                                            <Star className="h-4 w-4 text-[#00A1FF]" />
                                            Calificación
                                        </Label>
                                        <Input
                                            id="grade"
                                            type="text"
                                            placeholder="A"
                                            value={grade}
                                            onChange={(e) => setGrade(e.target.value)}
                                            className="bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 focus:border-[#00A1FF] focus:ring-4 focus:ring-[#00A1FF]/20 text-neutral-900 dark:text-neutral-100"
                                        />
                                    </div>
                                </div>

                                {/* Botón de Submit */}
                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={transactionStatus === "loading"}
                                        className="w-full bg-gradient-to-r from-[#00A1FF] to-[#0081CC] hover:from-[#0081CC] hover:to-[#0066A3] text-white font-bold text-lg py-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
                                    >
                                        {transactionStatus === "loading" ? (
                                            <>
                                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                Generando Certificado...
                                            </>
                                        ) : (
                                            <>
                                                <Award className="h-5 w-5 mr-2" />
                                                Certificar Estudiante
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Resultado de la Transacción */}
                {transactionStatus === "success" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8"
                    >
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-2 border-green-300 dark:border-green-700 shadow-xl">
                            <CardContent className="pt-8 pb-8">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-500/20 rounded-xl">
                                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-green-900 dark:text-green-100 mb-2 text-2xl">
                                            ¡Certificado Generado Exitosamente!
                                        </h3>
                                        <p className="text-green-800 dark:text-green-200 mb-4">
                                            El certificado ha sido registrado en la blockchain de Stacks.
                                        </p>

                                        <div className="space-y-3">
                                            <div className="p-4 bg-white/70 dark:bg-neutral-900/70 rounded-xl backdrop-blur-sm border border-green-200 dark:border-green-800">
                                                <Label className="text-sm font-semibold text-green-900 dark:text-green-100 block mb-2">
                                                    Transaction ID:
                                                </Label>
                                                <p className="text-xs font-mono break-all text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg">
                                                    {txid}
                                                </p>
                                            </div>

                                            <Button
                                                onClick={() => window.open(urlTransaction, '_blank')}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Ver en el Explorador de Stacks
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Error: Fondos Insuficientes */}
                {transactionStatus === "insufficient-funds" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8"
                    >
                        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 border-2 border-orange-300 dark:border-orange-700 shadow-xl">
                            <CardContent className="pt-8 pb-8">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-orange-500/20 rounded-xl">
                                        <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-orange-900 dark:text-orange-100 mb-2 text-2xl">
                                            Fondos Insuficientes
                                        </h3>
                                        <p className="text-orange-800 dark:text-orange-200 mb-4">
                                            La academia no tiene suficientes fondos para generar el certificado.
                                        </p>
                                        <div className="p-4 bg-white/70 dark:bg-neutral-900/70 rounded-xl backdrop-blur-sm border border-orange-200 dark:border-orange-800">
                                            <p className="text-sm text-orange-800 dark:text-orange-200">
                                                <strong>Solución:</strong> La academia debe agregar fondos (STX) a su wallet para poder continuar emitiendo certificados.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Error General */}
                {transactionStatus === "error" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8"
                    >
                        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 border-2 border-red-300 dark:border-red-700 shadow-xl">
                            <CardContent className="pt-8 pb-8">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-red-500/20 rounded-xl">
                                        <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-red-900 dark:text-red-100 mb-2 text-2xl">
                                            Error en la Transacción
                                        </h3>
                                        <p className="text-red-800 dark:text-red-200 mb-4">
                                            No se pudo completar la certificación. Por favor, intenta nuevamente.
                                        </p>
                                        {errorMessage && (
                                            <div className="p-4 bg-white/70 dark:bg-neutral-900/70 rounded-xl backdrop-blur-sm border border-red-200 dark:border-red-800">
                                                <p className="text-sm font-mono text-red-800 dark:text-red-200">
                                                    {errorMessage}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </main>
    );
}