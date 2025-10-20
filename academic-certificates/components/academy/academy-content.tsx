"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { slideInFromBottom } from "@/utils/motion";
import { signAcademicCertificate } from "@/lib/stacks-academy";
import { getAcademyCredentials, getStudentWallet } from "@/app/actions/academy";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
  Loader2,
} from "lucide-react";

type TransactionStatus = "idle" | "loading" | "success" | "error" | "insufficient-funds";

interface AcademyContentProps {
  id: string;
}

export function AcademyContent({ id }: AcademyContentProps) {
  // ─── Form state ──────────────────────────────────────────────────────
  const [studentEmail, setStudentEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [course, setCourse] = useState("");
  const [grade, setGrade] = useState("");
  const [studentWallet, setStudentWallet] = useState("");

  // ─── UX state ────────────────────────────────────────────────────────
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [txid, setTxid] = useState("");
  const [urlTransaction, setUrlTransaction] = useState("");
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit =
    studentEmail.trim() &&
    studentId.trim() &&
    course.trim() &&
    grade.trim() &&
    studentWallet.trim() &&
    transactionStatus !== "loading";

  // ─── Actions ─────────────────────────────────────────────────────────
  const handleSearchWallet = async () => {
    if (!studentEmail.trim()) return;
    setIsLoadingWallet(true);
    try {
      const studentData = await getStudentWallet(studentEmail);
      if (studentData?.stacks_address) {
        setStudentWallet(studentData.stacks_address);
        setStudentId(String(studentData.id ?? ""));
      } else {
        setStudentWallet("");
        alert("No se encontró wallet para este estudiante");
      }
    } catch (err) {
      console.error("Buscar wallet:", err);
      alert("Error al buscar la wallet del estudiante");
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const handleCertifyStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setTransactionStatus("loading");
    setTxid("");
    setUrlTransaction("");
    setErrorMessage("");

    try {
      const { privateKey } = await getAcademyCredentials(id);
      const result = await signAcademicCertificate(studentId, course, grade, studentWallet, privateKey!);

      if (result?.success) {
        setTxid(result.txid);
        setUrlTransaction(result.urlTransaction);
        setTransactionStatus("success");
      } else {
        setTransactionStatus("error");
        setErrorMessage("Error al procesar la transacción");
      }
    } catch (error: any) {
      console.error("Certificación:", error);
      if (
        error?.message?.includes("NotEnoughFunds") ||
        error?.reason === "NotEnoughFunds" ||
        error?.error === "transaction rejected"
      ) {
        setTransactionStatus("insufficient-funds");
        setErrorMessage("La academia no tiene suficientes fondos para generar el certificado");
      } else {
        setTransactionStatus("error");
        setErrorMessage(error?.message || "Error desconocido al procesar la transacción");
      }
    }
  };

  // ─── UI ──────────────────────────────────────────────────────────────
  return (
    <main className="relative min-h-screen w-full bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Fondo consistente (waves + degradado) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('/img/bg-waves-3.svg')] bg-cover bg-center opacity-10 dark:opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white dark:from-neutral-950/60 dark:to-neutral-950" />
      </div>

      <div className="container mx-auto max-w-6xl px-4 lg:px-0 py-16 md:py-20">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial="offScreen"
          whileInView="onScreen"
          viewport={{ once: true, amount: 0.4 }}
          variants={slideInFromBottom({ delay: 0.1 })}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-5 rounded-full border-2 bg-gradient-to-br from-sky-500/20 to-sky-500/10 border-sky-500/30">
              <Award className="h-10 w-10 text-sky-500 dark:text-sky-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3">
            Certificación <span className="text-sky-500 dark:text-sky-400">Académica</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
            Emite certificados verificables en la blockchain de Stacks.
          </p>
        </motion.div>

        {/* Formulario */}
        <motion.div
          initial="offScreen"
          whileInView="onScreen"
          viewport={{ once: true, amount: 0.4 }}
          variants={slideInFromBottom({ delay: 0.2 })}
        >
          <Card className="rounded-2xl border backdrop-blur-xl shadow-2xl
                           bg-white/80 border-neutral-200
                           dark:bg-neutral-900/70 dark:border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <div className="p-2 rounded-lg bg-sky-500/10">
                  <GraduationCap className="h-6 w-6 text-sky-500 dark:text-sky-400" />
                </div>
                Datos del Certificado
              </CardTitle>
              <CardDescription className="text-base">
                Completa la información del estudiante para generar el certificado en la blockchain.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleCertifyStudent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-semibold flex items-center gap-2">
                      <Search className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                      Email del Estudiante
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="estudiante@ejemplo.com"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="bg-white text-neutral-900 border-2 border-neutral-300
                                 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20
                                 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                    />
                  </div>

                  {/* DNI/ID */}
                  <div className="space-y-2">
                    <Label htmlFor="studentId" className="font-semibold flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                      ID del Estudiante (DNI)
                    </Label>
                    <Input
                      id="studentId"
                      placeholder="12345678"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="bg-white text-neutral-900 border-2 border-neutral-300
                                 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20
                                 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                    />
                  </div>

                  {/* Wallet */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="wallet" className="font-semibold flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                      Dirección de Wallet
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="wallet"
                        placeholder="ST1PQHQKV0..."
                        value={studentWallet}
                        onChange={(e) => setStudentWallet(e.target.value)}
                        className="flex-1 font-mono text-sm
                                   bg-white text-neutral-900 border-2 border-neutral-300
                                   focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20
                                   dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                      />
                      <Button
                        type="button"
                        onClick={handleSearchWallet}
                        disabled={isLoadingWallet || !studentEmail.trim()}
                        className="font-bold text-white
                                   bg-sky-500 hover:bg-sky-600 shadow-lg hover:shadow-xl
                                   transition-all duration-300 disabled:opacity-50"
                      >
                        {isLoadingWallet ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Buscando...
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-4 w-4" />
                            Buscar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Curso */}
                  <div className="space-y-2">
                    <Label htmlFor="course" className="font-semibold flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                      Nombre del Curso
                    </Label>
                    <Input
                      id="course"
                      placeholder="Intro to Clarity"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="bg-white text-neutral-900 border-2 border-neutral-300
                                 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20
                                 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                    />
                  </div>

                  {/* Calificación */}
                  <div className="space-y-2">
                    <Label htmlFor="grade" className="font-semibold flex items-center gap-2">
                      <Star className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                      Calificación
                    </Label>
                    <Input
                      id="grade"
                      placeholder="A"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="bg-white text-neutral-900 border-2 border-neutral-300
                                 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20
                                 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full font-bold text-white py-6
                               bg-sky-500 hover:bg-sky-600 shadow-lg hover:shadow-xl
                               transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                    aria-live="polite"
                  >
                    {transactionStatus === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generando Certificado...
                      </>
                    ) : (
                      <>
                        <Award className="mr-2 h-5 w-5" />
                        Certificar Estudiante
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resultado: Éxito */}
        {transactionStatus === "success" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <Card className="rounded-2xl border shadow-xl
                             bg-gradient-to-br from-green-50 to-green-100 border-green-300
                             dark:from-green-950/50 dark:to-green-900/30 dark:border-green-800/60">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-green-500/20">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-2xl font-bold text-green-900 dark:text-green-100">
                      ¡Certificado generado exitosamente!
                    </h3>
                    <p className="mb-4 text-green-800 dark:text-green-200">
                      El certificado ha sido registrado en la blockchain de Stacks.
                    </p>

                    <div className="space-y-3">
                      <div className="rounded-xl border p-4 backdrop-blur-sm
                                      bg-white/70 border-green-200
                                      dark:bg-neutral-900/70 dark:border-green-800/60">
                        <Label className="mb-2 block text-sm font-semibold text-green-900 dark:text-green-100">
                          Transaction ID
                        </Label>
                        <p className="rounded-lg bg-neutral-100 p-3 font-mono text-xs break-all
                                      text-neutral-800
                                      dark:bg-neutral-800 dark:text-neutral-200">
                          {txid}
                        </p>
                      </div>

                      <Button
                        onClick={() => window.open(urlTransaction, "_blank")}
                        className="w-full font-bold text-white
                                   bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <Card className="rounded-2xl border shadow-xl
                             bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300
                             dark:from-orange-950/50 dark:to-orange-900/30 dark:border-orange-800/60">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-orange-500/20">
                    <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-2xl font-bold text-orange-900 dark:text-orange-100">
                      Fondos insuficientes
                    </h3>
                    <p className="mb-4 text-orange-800 dark:text-orange-200">
                      La academia no tiene suficientes fondos para generar el certificado.
                    </p>
                    <div className="rounded-xl border p-4 backdrop-blur-sm
                                    bg-white/70 border-orange-200
                                    dark:bg-neutral-900/70 dark:border-orange-800/60">
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        <strong>Solución:</strong> agrega STX a la wallet de la academia y vuelve a intentarlo.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Error general */}
        {transactionStatus === "error" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <Card className="rounded-2xl border shadow-xl
                             bg-gradient-to-br from-red-50 to-red-100 border-red-300
                             dark:from-red-950/50 dark:to-red-900/30 dark:border-red-800/60">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-red-500/20">
                    <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-2xl font-bold text-red-900 dark:text-red-100">
                      Error en la transacción
                    </h3>
                    <p className="mb-4 text-red-800 dark:text-red-200">
                      No se pudo completar la certificación. Intenta nuevamente.
                    </p>
                    {errorMessage && (
                      <div className="rounded-xl border p-4 backdrop-blur-sm
                                      bg-white/70 border-red-200
                                      dark:bg-neutral-900/70 dark:border-red-800/60">
                        <p className="font-mono text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
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
