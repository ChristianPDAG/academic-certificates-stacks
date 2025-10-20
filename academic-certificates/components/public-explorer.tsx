"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { slideInFromBottom, slideInFromLeft, slideInFromRight } from "@/utils/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Award,
    School,
    Users,
    Eye,
    ExternalLink,
    GraduationCap,
    Shield,
    BookOpen,
    Hash
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

interface Certificate extends CertificateDetails {
    id: number;
}

export default function PublicExplorer() {
    // Estados para estadísticas generales
    const [totalCertificates, setTotalCertificates] = useState<number>(0);
    const [superAdmin, setSuperAdmin] = useState<string>("");
    const [loading, setLoading] = useState(true);

    // Estados para búsquedas
    const [certificateId, setCertificateId] = useState("");
    const [studentWallet, setStudentWallet] = useState("");
    const [schoolWallet, setSchoolWallet] = useState("");

    // Estados para resultados
    const [certificateResult, setCertificateResult] = useState<Certificate | null>(null);
    const [studentCertificates, setStudentCertificates] = useState<Certificate[]>([]);
    const [schoolCertificates, setSchoolCertificates] = useState<Certificate[]>([]);
    const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);

    // Estados de carga
    const [searchingCert, setSearchingCert] = useState(false);
    const [searchingStudent, setSearchingStudent] = useState(false);
    const [searchingSchool, setSearchingSchool] = useState(false);

    // Cargar estadísticas generales al inicio
    useEffect(() => {
        loadSystemStats();
    }, []);

    const loadSystemStats = async () => {
        try {
            setLoading(true);

            const [totalCerts, adminData] = await Promise.all([
                getTotalCertificatesClient(),
                getSuperAdminClient()
            ]);

            setTotalCertificates(totalCerts.value || 0);
            setSuperAdmin(adminData.value || "");
        } catch (error) {
            console.error('Error loading system stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const searchCertificateById = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!certificateId.trim()) {
            alert('Por favor ingresa un ID de certificado');
            return;
        }

        try {
            setSearchingCert(true);
            setCertificateResult(null);

            const result = await getCertificateClient(parseInt(certificateId));

            if (result.value) {
                setCertificateResult({
                    id: parseInt(certificateId),
                    ...result.value
                });
            } else {
                alert('Certificado no encontrado');
            }
        } catch (error) {
            console.error('Error searching certificate:', error);
            alert('Error al buscar certificado');
        } finally {
            setSearchingCert(false);
        }
    };

    const searchStudentCertificates = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!studentWallet.trim()) {
            alert('Por favor ingresa una dirección de estudiante');
            return;
        }

        try {
            setSearchingStudent(true);
            setStudentCertificates([]);

            const result = await getStudentCertificatesClient(studentWallet);

            if (result.value && result.value['certificate-ids']) {
                const certIds = result.value['certificate-ids'];

                // Obtener detalles de cada certificado
                const certificatePromises = certIds.map(async (id: number) => {
                    const certDetails = await getCertificateClient(id);
                    return {
                        id,
                        ...certDetails.value
                    };
                });

                const certificates = await Promise.all(certificatePromises);
                setStudentCertificates(certificates.filter((cert: any) => cert.course));
            }
        } catch (error) {
            console.error('Error searching student certificates:', error);
            alert('Error al buscar certificados del estudiante');
        } finally {
            setSearchingStudent(false);
        }
    };

    const searchSchoolData = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!schoolWallet.trim()) {
            alert('Por favor ingresa una dirección de escuela');
            return;
        }

        try {
            setSearchingSchool(true);
            setSchoolCertificates([]);
            setSchoolInfo(null);

            // Buscar información de la escuela y sus certificados
            const [schoolInfoResult, schoolCertsResult] = await Promise.all([
                getSchoolInfoClient(schoolWallet),
                getSchoolCertificatesClient(schoolWallet)
            ]);

            if (schoolInfoResult?.value) {
                setSchoolInfo(schoolInfoResult.value);
            }

            if (schoolCertsResult?.value && schoolCertsResult.value['certificate-ids']) {
                const certIds = schoolCertsResult.value['certificate-ids'];

                // Obtener detalles de cada certificado
                const certificatePromises = certIds.map(async (id: number) => {
                    const certDetails = await getCertificateClient(id);
                    return {
                        id,
                        ...certDetails.value
                    };
                });

                const certificates = await Promise.all(certificatePromises);
                setSchoolCertificates(certificates.filter((cert: any) => cert.course));
            }
        } catch (error) {
            console.error('Error searching school data:', error);
            alert('Error al buscar datos de la escuela');
        } finally {
            setSearchingSchool(false);
        }
    };

    const CertificateCard = ({ certificate }: { certificate: Certificate }) => (
        <Card className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-[#00A1FF]/50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <CardTitle className="text-lg text-neutral-900 dark:text-white mb-2">
                            {certificate.course}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1 text-neutral-600 dark:text-neutral-400">
                            <GraduationCap className="h-4 w-4" />
                            Estudiante: {certificate['student-id']}
                        </CardDescription>
                    </div>
                    <Badge className="bg-[#00A1FF] text-white hover:bg-[#0081CC]">
                        #{certificate.id}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 rounded-xl border border-green-200 dark:border-green-900/50">
                    <span className="text-sm font-semibold text-green-800 dark:text-green-200">Calificación:</span>
                    <span className="font-bold text-green-600 dark:text-green-400 text-2xl">
                        {certificate.grade}
                    </span>
                </div>

                <div className="space-y-3">
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
                        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 block mb-2">
                            Academia:
                        </span>
                        <p className="text-xs font-mono bg-white dark:bg-neutral-900 p-2 rounded-lg break-all text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700">
                            {certificate['school-id']}
                        </p>
                    </div>

                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
                        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 block mb-2">
                            Estudiante:
                        </span>
                        <p className="text-xs font-mono bg-white dark:bg-neutral-900 p-2 rounded-lg break-all text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700">
                            {certificate['student-wallet']}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <main className="relative flex bg-white dark:bg-black-100 justify-center items-center flex-col overflow-hidden mx-auto min-h-screen">
            <div className="bg-[url('/bg-nodes-2.svg')] w-full h-full bg-cover bg-center absolute top-0 left-0 opacity-30 dark:opacity-20 -z-10" />

            <div className="container mx-auto max-w-7xl z-10 py-20 px-4 lg:px-8">
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
                            <Eye className="h-10 w-10 text-[#00A1FF]" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-bold mb-4 text-neutral-900 dark:text-white">
                        Explorador <span className="text-[#00A1FF]">Público</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-neutral-700 dark:text-neutral-300 max-w-3xl mx-auto">
                        Consulta y verifica certificados académicos almacenados en la blockchain de Stacks
                    </p>
                </motion.div>

                {/* System Stats */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
                    initial={"offScreen"}
                    whileInView={"onScreen"}
                    viewport={{ once: true }}
                    variants={slideInFromBottom({ delay: 0.4 })}
                >
                    <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-2 border-neutral-200 dark:border-neutral-800 hover:border-[#00A1FF]/50 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
                                Total de Certificados
                            </CardTitle>
                            <div className="p-2 bg-[#00A1FF]/10 rounded-lg">
                                <Award className="h-5 w-5 text-[#00A1FF]" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                                {loading ? (
                                    <div className="animate-pulse bg-neutral-200 dark:bg-neutral-700 h-9 w-20 rounded"></div>
                                ) : (
                                    totalCertificates
                                )}
                            </div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                Certificados emitidos en total
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-2 border-neutral-200 dark:border-neutral-800 hover:border-[#00A1FF]/50 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
                                Super Administrador
                            </CardTitle>
                            <div className="p-2 bg-[#00A1FF]/10 rounded-lg">
                                <Shield className="h-5 w-5 text-[#00A1FF]" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-mono break-all text-neutral-900 dark:text-white">
                                {loading ? (
                                    <div className="animate-pulse bg-neutral-200 dark:bg-neutral-700 h-5 w-full rounded"></div>
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

                {/* Search Sections */}
                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
                    initial={"offScreen"}
                    whileInView={"onScreen"}
                    viewport={{ once: true }}
                    variants={slideInFromBottom({ delay: 0.6 })}
                >
                    {/* Search Certificate by ID */}
                    <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-2 border-neutral-200 dark:border-neutral-800 hover:shadow-xl transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-white">
                                <div className="p-2 bg-[#00A1FF]/10 rounded-lg">
                                    <Hash className="h-5 w-5 text-[#00A1FF]" />
                                </div>
                                Buscar por ID
                            </CardTitle>
                            <CardDescription className="text-neutral-600 dark:text-neutral-400">
                                Busca un certificado específico por su número de ID
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={searchCertificateById} className="space-y-4">
                                <div>
                                    <Label htmlFor="certId" className="text-neutral-800 dark:text-neutral-200 font-semibold">
                                        ID del Certificado
                                    </Label>
                                    <Input
                                        id="certId"
                                        type="number"
                                        placeholder="Ej: 1"
                                        value={certificateId}
                                        onChange={(e) => setCertificateId(e.target.value)}
                                        min="1"
                                        className="mt-2 bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 focus:border-[#00A1FF] focus:ring-4 focus:ring-[#00A1FF]/20 text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    className="w-full bg-gradient-to-r from-[#00A1FF] to-[#0081CC] hover:from-[#0081CC] hover:to-[#0066A3] text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300" 
                                    disabled={searchingCert}
                                >
                                    {searchingCert ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Buscando...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="h-4 w-4 mr-2" />
                                            Buscar
                                        </>
                                    )}
                                </Button>
                            </form>

                            {certificateResult && (
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-3 text-neutral-900 dark:text-white">Resultado:</h4>
                                    <CertificateCard certificate={certificateResult} />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Search Student Certificates */}
                    <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-2 border-neutral-200 dark:border-neutral-800 hover:shadow-xl transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-white">
                                <div className="p-2 bg-[#00A1FF]/10 rounded-lg">
                                    <Users className="h-5 w-5 text-[#00A1FF]" />
                                </div>
                                Certificados de Estudiante
                            </CardTitle>
                            <CardDescription className="text-neutral-600 dark:text-neutral-400">
                                Ver todos los certificados de un estudiante
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={searchStudentCertificates} className="space-y-4">
                                <div>
                                    <Label htmlFor="studentAddr" className="text-neutral-800 dark:text-neutral-200 font-semibold">
                                        Dirección del Estudiante
                                    </Label>
                                    <Input
                                        id="studentAddr"
                                        placeholder="ST1PQHQKV0..."
                                        value={studentWallet}
                                        onChange={(e) => setStudentWallet(e.target.value)}
                                        className="mt-2 font-mono text-sm bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 focus:border-[#00A1FF] focus:ring-4 focus:ring-[#00A1FF]/20 text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    className="w-full bg-gradient-to-r from-[#00A1FF] to-[#0081CC] hover:from-[#0081CC] hover:to-[#0066A3] text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300" 
                                    disabled={searchingStudent}
                                >
                                    {searchingStudent ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Buscando...
                                        </>
                                    ) : (
                                        <>
                                            <GraduationCap className="h-4 w-4 mr-2" />
                                            Buscar
                                        </>
                                    )}
                                </Button>
                            </form>

                            {studentCertificates.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-3 text-neutral-900 dark:text-white">
                                        Certificados encontrados: {studentCertificates.length}
                                    </h4>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {studentCertificates.map((cert) => (
                                            <div key={cert.id} className="border-2 border-neutral-200 dark:border-neutral-700 rounded-xl p-4 bg-neutral-50 dark:bg-neutral-800/50 hover:border-[#00A1FF]/50 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h5 className="font-semibold text-sm text-neutral-900 dark:text-white">{cert.course}</h5>
                                                        <p className="text-xs text-neutral-600 dark:text-neutral-400">#{cert.id}</p>
                                                    </div>
                                                    <Badge className="bg-[#00A1FF] text-white">{cert.grade}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Search School Data */}
                    <Card className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-2 border-neutral-200 dark:border-neutral-800 hover:shadow-xl transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-white">
                                <div className="p-2 bg-[#00A1FF]/10 rounded-lg">
                                    <School className="h-5 w-5 text-[#00A1FF]" />
                                </div>
                                Datos de Academia
                            </CardTitle>
                            <CardDescription className="text-neutral-600 dark:text-neutral-400">
                                Ver información y certificados de una academia
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={searchSchoolData} className="space-y-4">
                                <div>
                                    <Label htmlFor="schoolAddr" className="text-neutral-800 dark:text-neutral-200 font-semibold">
                                        Dirección de la Academia
                                    </Label>
                                    <Input
                                        id="schoolAddr"
                                        placeholder="ST1PQHQKV0..."
                                        value={schoolWallet}
                                        onChange={(e) => setSchoolWallet(e.target.value)}
                                        className="mt-2 font-mono text-sm bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 focus:border-[#00A1FF] focus:ring-4 focus:ring-[#00A1FF]/20 text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    className="w-full bg-gradient-to-r from-[#00A1FF] to-[#0081CC] hover:from-[#0081CC] hover:to-[#0066A3] text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300" 
                                    disabled={searchingSchool}
                                >
                                    {searchingSchool ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Buscando...
                                        </>
                                    ) : (
                                        <>
                                            <School className="h-4 w-4 mr-2" />
                                            Buscar
                                        </>
                                    )}
                                </Button>
                            </form>

                            {(schoolInfo || schoolCertificates.length > 0) && (
                                <div className="mt-6 space-y-4">
                                    {schoolInfo && (
                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 rounded-xl border-2 border-blue-200 dark:border-blue-900/50">
                                            <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2 text-lg">
                                                {schoolInfo['school-name']}
                                            </h4>
                                            <Badge
                                                variant={schoolInfo.active ? "default" : "secondary"}
                                                className={schoolInfo.active ? "bg-green-500 text-white hover:bg-green-600" : ""}
                                            >
                                                {schoolInfo.active ? "✓ Activa" : "✗ Inactiva"}
                                            </Badge>
                                        </div>
                                    )}

                                    {schoolCertificates.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-3 text-neutral-900 dark:text-white">
                                                Certificados emitidos: {schoolCertificates.length}
                                            </h4>
                                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                                {schoolCertificates.map((cert) => (
                                                    <div key={cert.id} className="border-2 border-neutral-200 dark:border-neutral-700 rounded-xl p-4 bg-neutral-50 dark:bg-neutral-800/50 hover:border-[#00A1FF]/50 transition-all">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h5 className="font-semibold text-sm text-neutral-900 dark:text-white">{cert.course}</h5>
                                                                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                                                    Estudiante: {cert['student-id']}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <Badge variant="outline" className="mb-1">#{cert.id}</Badge>
                                                                <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                                                                    {cert.grade}
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

                {/* Info Section */}
                <motion.div
                    initial={"offScreen"}
                    whileInView={"onScreen"}
                    viewport={{ once: true }}
                    variants={slideInFromBottom({ delay: 0.8 })}
                >
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-2 border-blue-200 dark:border-blue-900/50 shadow-xl">
                        <CardContent className="pt-8 pb-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[#00A1FF]/10 rounded-xl">
                                    <BookOpen className="h-8 w-8 text-[#00A1FF]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-4 text-2xl">
                                        Acerca del Sistema
                                    </h3>
                                    <div className="text-sm text-blue-800 dark:text-blue-200 space-y-3">
                                        <p className="flex items-start gap-2">
                                            <span className="text-[#00A1FF] mt-1 font-bold">✓</span>
                                            <span>Sistema de certificación académica descentralizado basado en Stacks blockchain</span>
                                        </p>
                                        <p className="flex items-start gap-2">
                                            <span className="text-[#00A1FF] mt-1 font-bold">✓</span>
                                            <span>Los certificados son inmutables y verificables públicamente en todo momento</span>
                                        </p>
                                        <p className="flex items-start gap-2">
                                            <span className="text-[#00A1FF] mt-1 font-bold">✓</span>
                                            <span>Las academias autorizadas pueden emitir certificados que se almacenan en las wallets de los estudiantes</span>
                                        </p>
                                        <p className="flex items-start gap-2">
                                            <span className="text-[#00A1FF] mt-1 font-bold">✓</span>
                                            <span>Toda la información es pública y transparente en la blockchain de Stacks</span>
                                        </p>
                                    </div>
                                    <div className="mt-6 p-4 bg-white/70 dark:bg-neutral-900/70 rounded-xl backdrop-blur-sm border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-2">
                                            <strong className="text-neutral-900 dark:text-white">Contrato:</strong>{" "}
                                            <span className="font-mono text-xs break-all">
                                                {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "No configurado"}
                                            </span>
                                        </p>
                                        <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                            <strong className="text-neutral-900 dark:text-white">Red:</strong>{" "}
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