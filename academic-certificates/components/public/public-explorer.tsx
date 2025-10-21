"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { slideInFromBottom } from "@/utils/motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Award,
  School,
  Users,
  GraduationCap,
  Shield,
  BookOpen,
  Hash,
} from "lucide-react";
import {
  getCertificateClient,
  getStudentCertificatesClient,
  getSchoolCertificatesClient,
  getSchoolInfoClient,
  getTotalCertificatesClient,
  getSuperAdminClient,
  type CertificateDetails,
  type SchoolInfo,
} from "@/lib/stacks-client";
import { getStudentWallet } from "@/app/actions/academy";
import { Metadata } from "next";

/** Tipos */
interface Certificate extends CertificateDetails {
  id: number;
}
type certificateResultType = {
  id: number;
  "school-id": { type: string; value: string };
  "student-id": { type: string; value: string };
  course: { type: string; value: string };
  grade: { type: string; value: string };
  "student-wallet": { type: string; value: string };
};

export const metadata: Metadata = {
  title: "Explorador Público de Certificados | Certifikurs",
  description:
    "Consulta y verifica certificados académicos públicos en la blockchain de Stacks. Explora información de academias, estudiantes y certificados emitidos.",
  openGraph: {
    title: "Explorador Público de Certificados | Certifikurs",
    description:
      "Explora y verifica certificados académicos públicos en la blockchain de Stacks. Consulta información de academias, estudiantes y certificados.",
    url: "https://certifikurs.vercel.app/explorer",
    siteName: "Certifikurs",
    images: [
      {
        url: "https://certifikurs.vercel.app/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Certifikurs - Explorador Público de certificados",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explorador Público de Certificados | Certifikurs",
    description:
      "Consulta y verifica certificados académicos públicos en la blockchain de Stacks. Plataforma segura y transparente.",
    creator: "@Certifikurs",
    images: [
      {
        url: "https://certifikurs.vercel.app/tc-banner.jpg",
        width: 1200,
        height: 675,
        alt: "Certifikurs - Explorador Público de certificados",
      },
    ],
  },
};

export default function PublicExplorer() {
  /** ─── Estadísticas generales ───────────────────────────────────────── */
  const [totalCertificates, setTotalCertificates] = useState<number>(0);
  const [superAdmin, setSuperAdmin] = useState<string>("");
  const [loading, setLoading] = useState(true);

  /** ─── Búsquedas ───────────────────────────────────────────────────── */
  const [certificateId, setCertificateId] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentWallet, setStudentWallet] = useState("");
  const [schoolWallet, setSchoolWallet] = useState("");

  /** ─── Resultados ──────────────────────────────────────────────────── */
  const [certificateResult, setCertificateResult] =
    useState<certificateResultType | null>(null);
  const [studentCertificates, setStudentCertificates] = useState<
    certificateResultType[]
  >([]);
  const [schoolCertificates, setSchoolCertificates] = useState<Certificate[]>(
    []
  );
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);

  /** ─── Cargas ──────────────────────────────────────────────────────── */
  const [searchingCert, setSearchingCert] = useState(false);
  const [searchingStudent, setSearchingStudent] = useState(false);
  const [searchingSchool, setSearchingSchool] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);

  /** Cargar stats */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [totalCerts, adminData] = await Promise.all([
          getTotalCertificatesClient(),
          getSuperAdminClient(),
        ]);
        setTotalCertificates(totalCerts.value || 0);
        setSuperAdmin(adminData.value || "");
      } catch (err) {
        console.error("Error loading system stats:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** Debounce email → wallet */
  useEffect(() => {
    const t = setTimeout(() => {
      if (
        studentEmail &&
        studentEmail.includes("@") &&
        studentEmail.includes(".")
      ) {
        void fetchStudentWallet(studentEmail);
      } else if (studentEmail === "") {
        setStudentWallet("");
      }
    }, 500);
    return () => clearTimeout(t);
  }, [studentEmail]);

  const fetchStudentWallet = async (email: string) => {
    setLoadingWallet(true);
    try {
      const result = await getStudentWallet(email);
      setStudentWallet(result?.stacks_address || "");
    } catch (e) {
      console.error("Error fetching student wallet:", e);
      setStudentWallet("");
    } finally {
      setLoadingWallet(false);
    }
  };

  /** ─── Buscadores ──────────────────────────────────────────────────── */
  const searchCertificateById = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) return;

    try {
      setSearchingCert(true);
      setCertificateResult(null);
      const result = await getCertificateClient(parseInt(certificateId, 10));
      if (result.value) {
        const data = result.value.value as certificateResultType;
        const { id: dataId, ...rest } = data;
        setCertificateResult({
          id: typeof dataId === "number" ? dataId : parseInt(certificateId, 10),
          ...rest,
        });
      } else {
        alert("Certificado no encontrado");
      }
    } catch (error) {
      console.error("Error searching certificate:", error);
      alert("Error al buscar certificado");
    } finally {
      setSearchingCert(false);
    }
  };

  const searchStudentCertificates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentWallet.trim()) return;

    try {
      setSearchingStudent(true);
      setStudentCertificates([]);
      const result = await getStudentCertificatesClient(studentWallet);
      if (result.value && result.value.value["certificate-ids"]) {
        const rawIds = result.value.value["certificate-ids"].value;
        const certIds = rawIds.map((i: any) => parseInt(i.value, 10));
        const certificates = await Promise.all(
          certIds.map(async (id: number) => {
            const certDetails = await getCertificateClient(id);
            const certData = certDetails.value.value as Record<string, any>;
            return { id, ...certData };
          })
        );
        setStudentCertificates(certificates.filter((c: any) => c.course));
      }
    } catch (error) {
      console.error("Error searching student certificates:", error);
      alert("Error al buscar certificados del estudiante");
    } finally {
      setSearchingStudent(false);
    }
  };

  const searchSchoolData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolWallet.trim()) return;

    try {
      setSearchingSchool(true);
      setSchoolCertificates([]);
      setSchoolInfo(null);

      const [schoolInfoResult, schoolCertsResult] = await Promise.all([
        getSchoolInfoClient(schoolWallet),
        getSchoolCertificatesClient(schoolWallet),
      ]);

      if (schoolInfoResult?.value) setSchoolInfo(schoolInfoResult.value);

      if (
        schoolCertsResult?.value &&
        schoolCertsResult.value["certificate-ids"]
      ) {
        const certIds = schoolCertsResult.value["certificate-ids"];
        const certificates = await Promise.all(
          certIds.map(async (id: number) => {
            const certDetails = await getCertificateClient(id);
            return { id, ...certDetails.value };
          })
        );
        setSchoolCertificates(certificates.filter((c: any) => c.course));
      }
    } catch (error) {
      console.error("Error searching school data:", error);
      alert("Error al buscar datos de la academia");
    } finally {
      setSearchingSchool(false);
    }
  };

  /** ─── UI helpers ─────────────────────────────────────────────────── */
  const getVal = (v: any) =>
    v && typeof v === "object" && "value" in v ? v.value : v ?? "";

  const CertificateCard = ({
    certificate,
  }: {
    certificate: Certificate | certificateResultType;
  }) => (
    <Card
      className="rounded-2xl border backdrop-blur-xl transition-all duration-300
                     bg-white/80 border-neutral-200 hover:border-sky-500/50 hover:shadow-xl
                     dark:bg-neutral-900/70 dark:border-neutral-800 dark:hover:border-sky-500/60"
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">
              {getVal((certificate as any)?.course)}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-sky-500 dark:text-sky-400" />
              Estudiante: {getVal((certificate as any)?.["student-id"])}
            </CardDescription>
          </div>
          <Badge className="bg-sky-500 text-white hover:bg-sky-600">
            #{(certificate as any).id}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="flex justify-between items-center p-3 rounded-xl border
                        bg-gradient-to-br from-green-50 to-green-100 border-green-200
                        dark:from-green-950/50 dark:to-green-900/30 dark:border-green-900/50"
        >
          <span className="text-sm font-semibold text-green-800 dark:text-green-200">
            Calificación:
          </span>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {getVal((certificate as any)?.grade)}
          </span>
        </div>

        <div className="grid gap-3">
          <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
            <span className="text-sm font-semibold block mb-2">Academia</span>
            <p
              className="text-xs font-mono rounded-lg p-2 break-all border
                          bg-white border-neutral-200 text-neutral-900
                          dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100"
            >
              {getVal((certificate as any)?.["school-id"])}
            </p>
          </div>

          <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
            <span className="text-sm font-semibold block mb-2">
              Wallet del estudiante
            </span>
            <p
              className="text-xs font-mono rounded-lg p-2 break-all border
                          bg-white border-neutral-200 text-neutral-900
                          dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100"
            >
              {getVal((certificate as any)?.["student-wallet"])}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  /** ─── Render ──────────────────────────────────────────────────────── */
  return (
    <main className="relative min-h-screen w-full bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Fondo consistente con Validator */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('/img/bg-waves-3.svg')] bg-cover bg-center opacity-10 dark:opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white dark:from-neutral-950/60 dark:to-neutral-950" />
      </div>

      <div className="container mx-auto max-w-7xl py-16 md:py-20 px-4 lg:px-0 mt-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial="offScreen"
          whileInView="onScreen"
          viewport={{ once: true, amount: 0.4 }}
          variants={slideInFromBottom({ delay: 0.1 })}
        >

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3">
            Explorador{" "}
            <span className="text-sky-500 dark:text-sky-400">Público</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
            Consulta y verifica certificados académicos almacenados en la
            blockchain de Stacks.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          initial="offScreen"
          whileInView="onScreen"
          viewport={{ once: true, amount: 0.35 }}
          variants={slideInFromBottom({ delay: 0.2 })}
        >
          <Card
            className="rounded-2xl border backdrop-blur-xl
                           bg-white/80 border-neutral-200 hover:border-sky-500/50
                           dark:bg-neutral-900/70 dark:border-neutral-800 dark:hover:border-sky-500/60"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">
                Total de Certificados
              </CardTitle>
              <div className="p-2 rounded-lg bg-sky-500/10">
                <Award className="h-5 w-5 text-sky-500 dark:text-sky-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? (
                  <div className="h-9 w-20 rounded animate-pulse bg-neutral-200 dark:bg-neutral-700" />
                ) : (
                  totalCertificates
                )}
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Certificados emitidos en total
              </p>
            </CardContent>
          </Card>

          <Card
            className="rounded-2xl border backdrop-blur-xl
                           bg-white/80 border-neutral-200 hover:border-sky-500/50
                           dark:bg-neutral-900/70 dark:border-neutral-800 dark:hover:border-sky-500/60"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">
                Super Administrador
              </CardTitle>
              <div className="p-2 rounded-lg bg-sky-500/10">
                <Shield className="h-5 w-5 text-sky-500 dark:text-sky-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono break-all">
                {loading ? (
                  <div className="h-5 w-full rounded animate-pulse bg-neutral-200 dark:bg-neutral-700" />
                ) : (
                  superAdmin || "No configurado"
                )}
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Administrador del sistema
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Búsquedas */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
          initial="offScreen"
          whileInView="onScreen"
          viewport={{ once: true, amount: 0.35 }}
          variants={slideInFromBottom({ delay: 0.3 })}
        >
          {/* Certificado por ID */}
          <Card
            className="rounded-2xl border backdrop-blur-xl
                           bg-white/80 border-neutral-200 hover:shadow-xl
                           dark:bg-neutral-900/70 dark:border-neutral-800"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-sky-500/10">
                  <Hash className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                </div>
                Buscar por ID
              </CardTitle>
              <CardDescription>
                Busca un certificado específico por su número de ID.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={searchCertificateById} className="space-y-4">
                <div>
                  <Label htmlFor="certId" className="font-semibold">
                    ID del Certificado
                  </Label>
                  <Input
                    id="certId"
                    type="number"
                    min="1"
                    placeholder="Ej: 1"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                    className="mt-2 border-2 bg-white text-neutral-900
                               border-neutral-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20
                               dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={searchingCert}
                  className="w-full font-bold text-white
                             bg-sky-500 hover:bg-sky-600 shadow-lg hover:shadow-xl
                             transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {searchingCert ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Buscar
                    </>
                  )}
                </Button>
              </form>

              {certificateResult && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Resultado</h4>
                  <CertificateCard certificate={certificateResult} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certificados de estudiante */}
          <Card
            className="rounded-2xl border backdrop-blur-xl
                           bg-white/80 border-neutral-200 hover:shadow-xl
                           dark:bg-neutral-900/70 dark:border-neutral-800"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-sky-500/10">
                  <Users className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                </div>
                Certificados de Estudiante
              </CardTitle>
              <CardDescription>
                Ver todos los certificados de un estudiante.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={searchStudentCertificates} className="space-y-4">
                <div>
                  <Label htmlFor="studentEmail" className="font-semibold">
                    Email del Estudiante (opcional)
                  </Label>
                  <Input
                    id="studentEmail"
                    type="email"
                    placeholder="ejemplo@dominio.com"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="mt-2 border-2 bg-white text-neutral-900
                               border-neutral-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20
                               dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                  />

                  <Label
                    htmlFor="studentAddr"
                    className="mt-4 block font-semibold"
                  >
                    Dirección del Estudiante
                  </Label>
                  <div className="relative">
                    <Input
                      id="studentAddr"
                      placeholder="ST1PQHQKV0..."
                      value={studentWallet}
                      onChange={(e) => setStudentWallet(e.target.value)}
                      disabled={loadingWallet}
                      className="mt-2 font-mono text-sm border-2 bg-white text-neutral-900
                                 border-neutral-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20
                                 disabled:opacity-50
                                 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                    />
                    {loadingWallet && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-1">
                        <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-sky-500" />
                      </div>
                    )}
                  </div>
                  {studentEmail && !loadingWallet && !studentWallet && (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      ⚠️ No se encontró un estudiante con este email
                    </p>
                  )}
                  {studentWallet && !loadingWallet && (
                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                      {studentEmail ? "✓ Dirección encontrada" : ""}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={searchingStudent || loadingWallet || !studentWallet}
                  className="w-full font-bold text-white
                             bg-sky-500 hover:bg-sky-600 shadow-lg hover:shadow-xl
                             transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {searchingStudent ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Buscar
                    </>
                  )}
                </Button>
              </form>

              {studentCertificates.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">
                    Certificados encontrados: {studentCertificates.length}
                  </h4>
                  <div className="max-h-96 space-y-3 overflow-y-auto">
                    {studentCertificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="rounded-xl border-2 p-4 transition-all
                                   bg-neutral-50 hover:border-sky-500/50
                                   dark:bg-neutral-800/50 dark:border-neutral-700"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h5 className="text-sm font-semibold">
                              {cert?.course?.value}
                            </h5>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                              #{cert.id}
                            </p>
                          </div>
                          <Badge className="bg-sky-500 text-white">
                            {cert?.grade?.value}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Datos de Academia */}
          <Card
            className="rounded-2xl border backdrop-blur-xl
                           bg-white/80 border-neutral-200 hover:shadow-xl
                           dark:bg-neutral-900/70 dark:border-neutral-800"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-sky-500/10">
                  <School className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                </div>
                Datos de Academia
              </CardTitle>
              <CardDescription>
                Ver información y certificados de una academia.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={searchSchoolData} className="space-y-4">
                <div>
                  <Label htmlFor="schoolAddr" className="font-semibold">
                    Dirección de la Academia
                  </Label>
                  <Input
                    id="schoolAddr"
                    placeholder="ST1PQHQKV0..."
                    value={schoolWallet}
                    onChange={(e) => setSchoolWallet(e.target.value)}
                    className="mt-2 font-mono text-sm border-2 bg-white text-neutral-900
                               border-neutral-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20
                               dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={searchingSchool}
                  className="w-full font-bold text-white
                             bg-sky-500 hover:bg-sky-600 shadow-lg hover:shadow-xl
                             transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {searchingSchool ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <School className="mr-2 h-4 w-4" />
                      Buscar
                    </>
                  )}
                </Button>
              </form>

              {(schoolInfo || schoolCertificates.length > 0) && (
                <div className="mt-6 space-y-4">
                  {schoolInfo && (
                    <div
                      className="rounded-xl border-2 p-4
                                    bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200
                                    dark:from-blue-950/50 dark:to-blue-900/30 dark:border-blue-900/50"
                    >
                      <h4 className="mb-2 text-lg font-bold text-blue-900 dark:text-blue-100">
                        {schoolInfo["school-name"]}
                      </h4>
                      <Badge className="bg-green-500 text-white hover:bg-green-600">
                        ✓ Activa
                      </Badge>
                    </div>
                  )}

                  {schoolCertificates.length > 0 && (
                    <div>
                      <h4 className="mb-3 font-semibold">
                        Certificados emitidos: {schoolCertificates.length}
                      </h4>
                      <div className="max-h-64 space-y-2 overflow-y-auto">
                        {schoolCertificates.map((cert) => (
                          <div
                            key={cert.id}
                            className="rounded-xl border-2 p-4 transition-all
                                       bg-neutral-50 hover:border-sky-500/50
                                       dark:bg-neutral-800/50 dark:border-neutral-700"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="text-sm font-semibold">
                                  {(cert as any).course}
                                </h5>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                  Estudiante: {(cert as any)["student-id"]}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="mb-1">
                                  #{cert.id}
                                </Badge>
                                <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                                  {(() => {
                                    const g = (cert as any).grade;
                                    return g &&
                                      typeof g === "object" &&
                                      "value" in g
                                      ? g.value
                                      : g;
                                  })()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Info */}
        <motion.div
          initial="offScreen"
          whileInView="onScreen"
          viewport={{ once: true, amount: 0.35 }}
          variants={slideInFromBottom({ delay: 0.4 })}
        >
          <Card
            className="border-2 shadow-xl
                           bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200
                           dark:from-blue-950/50 dark:to-blue-900/30 dark:border-blue-900/50"
          >
            <CardContent className="pb-8 pt-8">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-sky-500/10 p-3">
                  <BookOpen className="h-8 w-8 text-sky-500 dark:text-sky-400" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-blue-900 dark:text-blue-100">
                    Acerca del Sistema
                  </h3>
                  <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                    <p className="flex gap-2">
                      <span className="mt-0.5 font-bold text-sky-500">✓</span>
                      Sistema de certificación académica descentralizado basado
                      en Stacks blockchain.
                    </p>
                    <p className="flex gap-2">
                      <span className="mt-0.5 font-bold text-sky-500">✓</span>
                      Certificados inmutables y verificables públicamente.
                    </p>
                    <p className="flex gap-2">
                      <span className="mt-0.5 font-bold text-sky-500">✓</span>
                      Academias autorizadas emiten certificados hacia wallets de
                      estudiantes.
                    </p>
                    <p className="flex gap-2">
                      <span className="mt-0.5 font-bold text-sky-500">✓</span>
                      Información pública y transparente en la blockchain de
                      Stacks.
                    </p>
                  </div>

                  <div
                    className="mt-6 rounded-xl border bg-white/70 p-4 backdrop-blur-sm
                                  border-blue-200 text-neutral-700
                                  dark:bg-neutral-900/70 dark:border-blue-800 dark:text-neutral-300"
                  >
                    <p className="mb-2 text-sm">
                      <strong className="text-neutral-900 dark:text-white">
                        Contrato:
                      </strong>{" "}
                      <span className="font-mono text-xs break-all">
                        {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
                          "No configurado"}
                      </span>
                    </p>
                    <p className="text-sm">
                      <strong className="text-neutral-900 dark:text-white">
                        Red:
                      </strong>{" "}
                      <span className="font-mono text-xs uppercase">
                        {process.env.NEXT_PUBLIC_NETWORK || "testnet"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
