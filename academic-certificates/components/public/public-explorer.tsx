"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  getSuperAdmin,
  getTotalCertificates,
  getCertificate,
  getSchoolInfo,
  getSchoolCredits,
  isCertificateValid,
  type CertificateData,
  type SchoolInfoData,
} from "@/lib/stacks/public/explorer";
import {
  getStudentWalletByEmail,
  getCertificatesByStudentWallet,
  getCertificatesBySchool,
  getAcademyByStacksAddress,
} from "@/app/actions/public/explorer";

interface DatabaseCertificate {
  id_certificate: string;
  chain_cert_id: number;
  student_name: string;
  student_email: string | null;
  student_wallet: string;
  grade: string | null;
  status: string;
  created_at: string;
  tx_id: string | null;
  courses?: { id_course: number; title: string; hours: number } | null;
  academies?: { id_academy: number; legal_name: string; stacks_address: string } | null;
}

interface CombinedCertificate {
  chainId: number;
  blockchainData: CertificateData | null;
  databaseData: DatabaseCertificate | null;
  isValid: boolean;
}

export default function PublicExplorer() {
  const [totalCertificates, setTotalCertificates] = useState<number>(0);
  const [superAdmin, setSuperAdmin] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [studentEmail, setStudentEmail] = useState("");
  const [studentWallet, setStudentWallet] = useState("");
  const [schoolWallet, setSchoolWallet] = useState("");

  const [studentCertificates, setStudentCertificates] = useState<CombinedCertificate[]>([]);
  const [schoolCertificates, setSchoolCertificates] = useState<CombinedCertificate[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<{
    blockchain: SchoolInfoData | null;
    database: any | null;
    credits: number;
  } | null>(null);

  const [searchingStudent, setSearchingStudent] = useState(false);
  const [searchingSchool, setSearchingSchool] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [totalCerts, adminData] = await Promise.all([
          getTotalCertificates(),
          getSuperAdmin(),
        ]);
        setTotalCertificates(totalCerts || 0);
        setSuperAdmin(adminData || "");
      } catch (err) {
        console.error("Error loading system stats:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (studentEmail && studentEmail.includes("@") && studentEmail.includes(".")) {
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
      const result = await getStudentWalletByEmail(email);
      setStudentWallet(result?.stacks_address || "");
    } catch (e) {
      console.error("Error fetching student wallet:", e);
      setStudentWallet("");
    } finally {
      setLoadingWallet(false);
    }
  };


  const searchStudentCertificates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentWallet.trim()) return;
    try {
      setSearchingStudent(true);
      setStudentCertificates([]);

      const dbCertificates = await getCertificatesByStudentWallet(studentWallet);
      if (dbCertificates.length === 0) {
        alert("No se encontraron certificados para este estudiante");
        return;
      }

      const combinedCertificates = await Promise.all(
        dbCertificates.map(async (dbCert: any) => {
          console.log("Processing certificate:", dbCert.chain_cert_id);
          const [blockchainData, isValid] = await Promise.all([
            getCertificate(dbCert.chain_cert_id),
            isCertificateValid(dbCert.chain_cert_id),
          ]);
          console.log("Fetched blockchain data and validity:", { blockchainData, isValid });
          return {
            chainId: dbCert.chain_cert_id,
            blockchainData,
            databaseData: dbCert as DatabaseCertificate,
            isValid,
          };
        })
      );

      setStudentCertificates(combinedCertificates);
    } catch (error) {
      console.error("Error searching student certificates:", error);
      alert("Error al buscar certificados del estudiante");
    } finally {
      setSearchingStudent(false);
    }
  };

  const searchSchoolData = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching school data for wallet:", schoolWallet);
    if (!schoolWallet.trim()) return;
    console.log("Starting search for school data...");
    try {
      setSearchingSchool(true);
      setSchoolCertificates([]);
      setSchoolInfo(null);
      console.log("Fetching school info and credits...");
      const [blockchainInfo, dbInfo, credits] = await Promise.all([
        getSchoolInfo(schoolWallet),
        getAcademyByStacksAddress(schoolWallet),
        getSchoolCredits(schoolWallet),
      ]);
      console.log("Fetched school info:", { blockchainInfo, dbInfo, credits });

      setSchoolInfo({
        blockchain: blockchainInfo,
        database: dbInfo,
        credits,
      });

      const dbCertificates = await getCertificatesBySchool(schoolWallet);

      if (dbCertificates.length > 0) {
        const combinedCertificates = await Promise.all(
          dbCertificates.map(async (dbCert: any) => {
            const [blockchainData, isValid] = await Promise.all([
              getCertificate(dbCert.chain_cert_id),
              isCertificateValid(dbCert.chain_cert_id),
            ]);

            return {
              chainId: dbCert.chain_cert_id,
              blockchainData,
              databaseData: dbCert as DatabaseCertificate,
              isValid,
            };
          })
        );

        setSchoolCertificates(combinedCertificates);
      }
    } catch (error) {
      console.error("Error searching school data:", error);
      alert("Error al buscar datos de la academia");
    } finally {
      setSearchingSchool(false);
    }
  };

  const CertificateAccordionItem = ({ certificate, index }: { certificate: CombinedCertificate; index: number }) => {
    const blockchain = certificate.blockchainData;
    const database = certificate.databaseData;

    if (!blockchain) return null;

    const formatDate = (timestamp: number) => {
      return new Date(timestamp * 1000).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const truncateAddress = (address: string) => {
      if (!address || typeof address !== "string") return "";
      return `${address.slice(0, 8)}...${address.slice(-6)}`;
    };

    return (
      <AccordionItem value={`cert-${index}`} className="border rounded-xl px-4 bg-white/80 dark:bg-neutral-900/70">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex justify-between items-center w-full pr-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-sky-500 dark:text-sky-400" />
              <div className="text-left">
                <p className="font-semibold">{database?.courses?.title || "Certificado Académico"}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">ID: #{certificate.chainId}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={certificate.isValid ? "bg-green-500" : "bg-red-500"}>
                {certificate.isValid ? <><CheckCircle2 className="h-3 w-3 mr-1" /> Válido</> : <><XCircle className="h-3 w-3 mr-1" /> Inválido</>}
              </Badge>
              {blockchain.revoked && <Badge variant="destructive">Revocado</Badge>}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4 space-y-3">
          {blockchain.grade && (
            <div className="flex justify-between items-center p-3 rounded-xl border bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950/50 dark:to-green-900/30 dark:border-green-900/50">
              <span className="text-sm font-semibold text-green-800 dark:text-green-200">Calificación:</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">{blockchain.grade}</span>
            </div>
          )}

          <div className="grid gap-3">
            {database?.student_name && (
              <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                <span className="text-sm font-semibold block mb-2">Estudiante</span>
                <p className="text-sm">{database.student_name}</p>
                {database.student_email && <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{database.student_email}</p>}
              </div>
            )}

            {database?.courses && (
              <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                <span className="text-sm font-semibold block mb-2">Curso</span>
                <p className="text-sm font-semibold">{database.courses.title}</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  Duración: {database.courses.hours}h
                </p>
              </div>
            )}

            <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
              <span className="text-sm font-semibold block mb-2">Fecha de Graduación</span>
              <p className="text-sm">{formatDate(blockchain.graduationDate)}</p>
            </div>

            <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
              <span className="text-sm font-semibold block mb-2">Academia</span>
              <p className="text-sm">{database?.academies?.legal_name || "No disponible"}</p>
              <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 mt-1">{truncateAddress(blockchain.schoolId)}</p>
            </div>

            <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
              <span className="text-sm font-semibold block mb-2">Wallet Estudiante</span>
              <p className="text-xs font-mono break-all">{blockchain.studentWallet}</p>
            </div>

            <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
              <span className="text-sm font-semibold block mb-2">Bloque de Emisión</span>
              <p className="text-sm">#{blockchain.issueHeight}</p>
            </div>

            {database?.tx_id && (
              <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                <span className="text-sm font-semibold block mb-2">Transacción</span>
                <a
                  href={`https://explorer.hiro.so/txid/${database.tx_id}?chain=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-1"
                >
                  Ver en Explorer <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  const CertificateCard = ({ certificate }: { certificate: CombinedCertificate }) => {
    const blockchain = certificate.blockchainData;
    const database = certificate.databaseData;

    if (!blockchain) return null;

    const formatDate = (timestamp: number) => {
      return new Date(timestamp * 1000).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const truncateAddress = (address: string) => {
      if (!address || typeof address !== "string") return "";
      return `${address.slice(0, 8)}...${address.slice(-6)}`;
    };

    return (
      <Card className="rounded-2xl border backdrop-blur-xl transition-all duration-300 bg-white/80 border-neutral-200 hover:border-sky-500/50 hover:shadow-xl dark:bg-neutral-900/70 dark:border-neutral-800 dark:hover:border-sky-500/60">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">
                {database?.courses?.title || "Certificado Académico"}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                ID: #{certificate.chainId}
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <Badge className={certificate.isValid ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}>
                {certificate.isValid ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" /> Válido</>
                ) : (
                  <><XCircle className="h-3 w-3 mr-1" /> Inválido</>
                )}
              </Badge>
              {blockchain.revoked && (<Badge variant="destructive">Revocado</Badge>)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {blockchain.grade && (
            <div className="flex justify-between items-center p-3 rounded-xl border bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950/50 dark:to-green-900/30 dark:border-green-900/50">
              <span className="text-sm font-semibold text-green-800 dark:text-green-200">Calificación:</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">{blockchain.grade}</span>
            </div>
          )}

          <div className="grid gap-3">
            {database?.student_name && (
              <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                <span className="text-sm font-semibold block mb-2">Estudiante</span>
                <p className="text-sm">{database.student_name}</p>
                {database.student_email && <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{database.student_email}</p>}
              </div>
            )}

            {database?.courses && (
              <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                <span className="text-sm font-semibold block mb-2">Curso</span>
                <p className="text-sm font-semibold">{database.courses.title}</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  Duración: {database.courses.hours}h
                </p>
              </div>
            )}

            <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
              <span className="text-sm font-semibold block mb-2">Fecha de Graduación</span>
              <p className="text-sm">{formatDate(blockchain.graduationDate)}</p>
            </div>

            <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
              <span className="text-sm font-semibold block mb-2">Academia</span>
              <p className="text-sm">{database?.academies?.legal_name || "No disponible"}</p>
              <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 mt-1">{truncateAddress(blockchain.schoolId)}</p>
            </div>

            <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
              <span className="text-sm font-semibold block mb-2">Wallet Estudiante</span>
              <p className="text-xs font-mono break-all">{blockchain.studentWallet}</p>
            </div>

            <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
              <span className="text-sm font-semibold block mb-2">Bloque de Emisión</span>
              <p className="text-sm">#{blockchain.issueHeight}</p>
            </div>

            {database?.tx_id && (
              <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                <span className="text-sm font-semibold block mb-2">Transacción</span>
                <a
                  href={`https://explorer.hiro.so/txid/${database.tx_id}?chain=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-1"
                >
                  Ver en Explorer <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <main className="relative min-h-screen w-full bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('/img/bg-waves-3.svg')] bg-cover bg-center opacity-10 dark:opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white dark:from-neutral-950/60 dark:to-neutral-950" />
      </div>

      <div className="container mx-auto max-w-7xl py-16 md:py-20 px-4 lg:px-0 mt-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3">
            Explorador <span className="text-sky-500 dark:text-sky-400">Público</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
            Consulta y verifica certificados académicos almacenados en la blockchain de Stacks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="rounded-2xl border backdrop-blur-xl bg-white/80 border-neutral-200 hover:border-sky-500/50 dark:bg-neutral-900/70 dark:border-neutral-800 dark:hover:border-sky-500/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Certificados</CardTitle>
              <Award className="h-5 w-5 text-sky-500 dark:text-sky-400" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-20 animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded" />
              ) : (
                <div className="text-3xl font-bold">{totalCertificates}</div>
              )}
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Certificados emitidos en el sistema</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border backdrop-blur-xl bg-white/80 border-neutral-200 hover:border-sky-500/50 dark:bg-neutral-900/70 dark:border-neutral-800 dark:hover:border-sky-500/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Super Admin</CardTitle>
              <Shield className="h-5 w-5 text-sky-500 dark:text-sky-400" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-full animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded" />
              ) : (
                <div className="text-xs font-mono break-all">{superAdmin}</div>
              )}
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Dirección del administrador principal</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 mb-12">
          <Card className="rounded-2xl border backdrop-blur-xl bg-white/80 border-neutral-200 hover:shadow-xl dark:bg-neutral-900/70 dark:border-neutral-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-sky-500 dark:text-sky-400" />
                <div>
                  <CardTitle>Certificados de Estudiante</CardTitle>
                  <CardDescription>Busca todos los certificados de un estudiante por email o wallet</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={searchStudentCertificates} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="student-email">Email del Estudiante</Label>
                    <Input
                      id="student-email"
                      type="email"
                      placeholder="estudiante@ejemplo.com"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="bg-white dark:bg-neutral-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-wallet">Wallet del Estudiante</Label>
                    <Input
                      id="student-wallet"
                      placeholder="ST..."
                      value={studentWallet}
                      onChange={(e) => setStudentWallet(e.target.value)}
                      className="bg-white dark:bg-neutral-900"
                      disabled={loadingWallet}
                    />
                    {loadingWallet && <p className="text-xs text-neutral-600 dark:text-neutral-400">Buscando wallet...</p>}
                  </div>
                </div>
                <Button type="submit" disabled={!studentWallet || searchingStudent} className="w-full bg-sky-500 hover:bg-sky-600">
                  {searchingStudent ? <>Buscando...</> : <><Search className="mr-2 h-4 w-4" />Buscar Certificados</>}
                </Button>
              </form>

              {studentCertificates.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">{studentCertificates.length} certificado(s) encontrado(s)</h3>
                  <Accordion type="single" collapsible className="space-y-3">
                    {studentCertificates.map((cert, index) => (
                      <CertificateAccordionItem key={cert.chainId} certificate={cert} index={index} />
                    ))}
                  </Accordion>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border backdrop-blur-xl bg-white/80 border-neutral-200 hover:shadow-xl dark:bg-neutral-900/70 dark:border-neutral-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <School className="h-6 w-6 text-sky-500 dark:text-sky-400" />
                <div>
                  <CardTitle>Datos de Academia</CardTitle>
                  <CardDescription>Consulta información y certificados emitidos por una academia</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={searchSchoolData} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="school-wallet">Wallet de la Academia</Label>
                  <Input
                    id="school-wallet"
                    placeholder="ST..."
                    value={schoolWallet}
                    onChange={(e) => setSchoolWallet(e.target.value)}
                    className="bg-white dark:bg-neutral-900"
                  />
                </div>
                <Button type="submit" disabled={!schoolWallet || searchingSchool} className="w-full bg-sky-500 hover:bg-sky-600">
                  {searchingSchool ? <>Buscando...</> : <><Search className="mr-2 h-4 w-4" />Buscar Academia</>}
                </Button>
              </form>

              {schoolInfo && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Información de la Academia</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                      <span className="text-sm font-semibold block mb-2">Nombre</span>
                      <p className="text-sm">{schoolInfo.database?.legal_name || schoolInfo.blockchain?.name || "No disponible"}</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                      <span className="text-sm font-semibold block mb-2">Estado</span>
                      <div className="flex gap-2">
                        <Badge className={schoolInfo.blockchain?.active ? "bg-green-500" : "bg-red-500"}>
                          {schoolInfo.blockchain?.active ? "Activa" : "Inactiva"}
                        </Badge>
                        {schoolInfo.blockchain?.verified && <Badge className="bg-blue-500">Verificada</Badge>}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                      <span className="text-sm font-semibold block mb-2">Créditos</span>
                      <p className="text-sm">{schoolInfo.credits}</p>
                    </div>
                    {schoolInfo.database?.website && (
                      <div className="p-4 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                        <span className="text-sm font-semibold block mb-2">Sitio Web</span>
                        <a
                          href={schoolInfo.database.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1"
                        >
                          Visitar <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {schoolCertificates.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-semibold mb-4">{schoolCertificates.length} certificado(s) emitido(s)</h4>
                      <div className="grid gap-4">
                        {schoolCertificates.map((cert) => <CertificateCard key={cert.chainId} certificate={cert} />)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>


        </div>

        <div>
          <Card className="border-2 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950/50 dark:to-blue-900/30 dark:border-blue-900/50">
            <CardContent className="pb-8 pt-8">
              <div className="flex items-start gap-4">
                <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold mb-3 text-blue-900 dark:text-blue-100">Información del Sistema</h3>
                  <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <p><strong>Contratos:</strong> Este sistema utiliza dos contratos inteligentes:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><strong>certificate-data:</strong> Almacena los datos de certificados, academias y créditos</li>
                      <li><strong>certificate-manager-v1:</strong> Maneja la lógica de negocio para emisión y validación</li>
                    </ul>
                    <p className="mt-3"><strong>Validación:</strong> Los certificados se validan verificando:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Estado de revocación</li>
                      <li>Fecha de expiración (si aplica)</li>
                      <li>Existencia en blockchain</li>
                      <li>Integridad de metadatos (hash)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
