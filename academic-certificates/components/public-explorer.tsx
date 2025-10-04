"use client";

import { useState, useEffect } from "react";
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

            if (schoolInfoResult.value) {
                setSchoolInfo(schoolInfoResult.value);
            }

            if (schoolCertsResult.value && schoolCertsResult.value['certificate-ids']) {
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
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{certificate.course}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                            <GraduationCap className="h-4 w-4" />
                            Estudiante: {certificate['student-id']}
                        </CardDescription>
                    </div>
                    <Badge variant="outline">
                        #{certificate.id}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Calificación:</span>
                    <span className="font-semibold text-green-600 text-lg">
                        {certificate.grade}
                    </span>
                </div>

                <div className="space-y-2">
                    <div>
                        <span className="text-sm text-gray-600">Academia:</span>
                        <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                            {certificate['school-id']}
                        </p>
                    </div>

                    <div>
                        <span className="text-sm text-gray-600">Estudiante:</span>
                        <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                            {certificate['student-wallet']}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-100">
            <div className="container mx-auto p-6 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Eye className="h-10 w-10 text-indigo-600" />
                        <h1 className="text-4xl font-bold text-gray-900">
                            Explorador Público de Certificados
                        </h1>
                    </div>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Consulta y verifica certificados académicos almacenados en la blockchain de Stacks
                    </p>
                </div>

                {/* System Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Certificados</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {loading ? (
                                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                ) : (
                                    totalCertificates
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Certificados emitidos en total
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Super Administrador</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-mono break-all">
                                {loading ? (
                                    <div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>
                                ) : (
                                    superAdmin || "No configurado"
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Administrador del sistema
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Search Certificate by ID */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Hash className="h-5 w-5" />
                                Buscar por ID
                            </CardTitle>
                            <CardDescription>
                                Busca un certificado específico por su número de ID
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={searchCertificateById} className="space-y-4">
                                <div>
                                    <Label htmlFor="certId">ID del Certificado</Label>
                                    <Input
                                        id="certId"
                                        type="number"
                                        placeholder="Ej: 1"
                                        value={certificateId}
                                        onChange={(e) => setCertificateId(e.target.value)}
                                        min="1"
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={searchingCert}>
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
                                    <h4 className="font-semibold mb-3">Resultado:</h4>
                                    <CertificateCard certificate={certificateResult} />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Search Student Certificates */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Certificados de Estudiante
                            </CardTitle>
                            <CardDescription>
                                Ver todos los certificados de un estudiante
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={searchStudentCertificates} className="space-y-4">
                                <div>
                                    <Label htmlFor="studentAddr">Dirección del Estudiante</Label>
                                    <Input
                                        id="studentAddr"
                                        placeholder="ST1PQHQKV0..."
                                        value={studentWallet}
                                        onChange={(e) => setStudentWallet(e.target.value)}
                                        className="font-mono text-sm"
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={searchingStudent}>
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
                                    <h4 className="font-semibold mb-3">
                                        Certificados encontrados: {studentCertificates.length}
                                    </h4>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {studentCertificates.map((cert) => (
                                            <div key={cert.id} className="border rounded-lg p-3 bg-gray-50">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h5 className="font-medium text-sm">{cert.course}</h5>
                                                        <p className="text-xs text-gray-600">#{cert.id}</p>
                                                    </div>
                                                    <Badge variant="secondary">{cert.grade}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Search School Data */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <School className="h-5 w-5" />
                                Datos de Academia
                            </CardTitle>
                            <CardDescription>
                                Ver información y certificados de una academia
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={searchSchoolData} className="space-y-4">
                                <div>
                                    <Label htmlFor="schoolAddr">Dirección de la Academia</Label>
                                    <Input
                                        id="schoolAddr"
                                        placeholder="ST1PQHQKV0..."
                                        value={schoolWallet}
                                        onChange={(e) => setSchoolWallet(e.target.value)}
                                        className="font-mono text-sm"
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={searchingSchool}>
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
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <h4 className="font-semibold text-blue-900 mb-2">
                                                {schoolInfo['school-name']}
                                            </h4>
                                            <Badge
                                                variant={schoolInfo.active ? "default" : "secondary"}
                                                className={schoolInfo.active ? "bg-green-100 text-green-800" : ""}
                                            >
                                                {schoolInfo.active ? "Activa" : "Inactiva"}
                                            </Badge>
                                        </div>
                                    )}

                                    {schoolCertificates.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-3">
                                                Certificados emitidos: {schoolCertificates.length}
                                            </h4>
                                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                                {schoolCertificates.map((cert) => (
                                                    <div key={cert.id} className="border rounded-lg p-3 bg-gray-50">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h5 className="font-medium text-sm">{cert.course}</h5>
                                                                <p className="text-xs text-gray-600">
                                                                    Estudiante: {cert['student-id']}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <Badge variant="secondary">#{cert.id}</Badge>
                                                                <p className="text-xs text-green-600 font-medium">
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
                </div>

                {/* Info Section */}
                <Card className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <BookOpen className="h-6 w-6 text-blue-600 mt-1" />
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-2">Acerca del Sistema</h3>
                                <div className="text-sm text-blue-800 space-y-2">
                                    <p>• Este es un sistema de certificación académica descentralizado basado en Stacks blockchain</p>
                                    <p>• Los certificados son inmutables y verificables públicamente</p>
                                    <p>• Las academias autorizadas pueden emitir certificados que se almacenan en las wallets de los estudiantes</p>
                                    <p>• Toda la información es pública y transparente en la blockchain</p>
                                </div>
                                <div className="mt-4 p-3 bg-white/50 rounded-lg">
                                    <p className="text-xs text-gray-600">
                                        <strong>Contrato:</strong> {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "No configurado"}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        <strong>Red:</strong> {process.env.NEXT_PUBLIC_NETWORK || "testnet"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}