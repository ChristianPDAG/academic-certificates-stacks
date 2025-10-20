"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Award,
    Users,
    BookOpen,
    Plus,
    FileCheck,
    School,
    AlertCircle,
    CheckCircle,
    GraduationCap
} from "lucide-react";
import { useStacks } from "@/lib/stacks-provider";
import {
    issueCertificateClient,
    getSchoolInfoClient,
    getSchoolCertificatesClient,
    getCertificateClient,
    type SchoolInfo,
    type CertificatesList,
    type CertificateDetails,
} from "@/lib/stacks-client";

interface IssuedCertificate extends CertificateDetails {
    id: number;
}

export default function AcademyDashboard() {
    const { userAddress, isSignedIn } = useStacks();
    const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
    const [issuedCertificates, setIssuedCertificates] = useState<IssuedCertificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingStep, setLoadingStep] = useState("Iniciando...");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [studentId, setStudentId] = useState("");
    const [course, setCourse] = useState("");
    const [grade, setGrade] = useState("");
    const [studentWallet, setStudentWallet] = useState("");

    // Load academy info and certificates
    useEffect(() => {
        if (userAddress) {
            loadAcademyData();
        }

        // Timeout de seguridad - después de 8 segundos, permitir acceso en modo demo
        const timeout = setTimeout(() => {
            if (loading) {
                console.log('Timeout reached - allowing demo access');
                setSchoolInfo({ 'school-name': 'Academia Demo (Timeout)', active: true });
                setIssuedCertificates([]);
                setLoading(false);
            }
        }, 8000);

        return () => clearTimeout(timeout);
    }, [userAddress, loading]);

    const loadAcademyData = async () => {
        if (!userAddress) return;

        try {
            setLoading(true);
            setLoadingStep("Conectando con la blockchain...");
            setError(null);

            // Get school info
            setLoadingStep("Verificando información de la academia...");
            const schoolData = await getSchoolInfoClient(userAddress);

            if (schoolData && schoolData.value) {
                setSchoolInfo(schoolData.value);

                // Get school certificates
                setLoadingStep("Cargando certificados emitidos...");
                const certificatesData = await getSchoolCertificatesClient(userAddress);

                if (certificatesData && certificatesData.value && certificatesData.value['certificate-ids']) {
                    const certIds = certificatesData.value['certificate-ids'];

                    // Get details for each certificate
                    const certificatePromises = certIds.map(async (id: number) => {
                        const certDetails = await getCertificateClient(id);
                        return {
                            id,
                            ...certDetails.value
                        };
                    });

                    const certificates = await Promise.all(certificatePromises);
                    setIssuedCertificates(certificates.filter(cert => cert.course));
                } else {
                    setIssuedCertificates([]);
                }
            } else {
                // Academia no registrada - permitir acceso en modo demo
                setSchoolInfo({ 'school-name': 'Academia Demo', active: true });
                setIssuedCertificates([]);
            }
        } catch (error) {
            console.error('Error loading academy data:', error);
            setError(error instanceof Error ? error.message : 'Error desconocido');
            // En caso de error, permitir acceso en modo demo
            setSchoolInfo({ 'school-name': 'Academia Demo (Offline)', active: true });
            setIssuedCertificates([]);
        } finally {
            setLoading(false);
        }
    };

    const handleIssueCertificate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!studentId || !course || !grade || !studentWallet) {
            alert('Por favor completa todos los campos');
            return;
        }

        try {
            setIsSubmitting(true);

            await issueCertificateClient(
                studentId,
                course,
                grade,
                studentWallet
            );

            // Reset form
            setStudentId("");
            setCourse("");
            setGrade("");
            setStudentWallet("");

            alert('Certificado emitido exitosamente! La transacción está siendo procesada en la blockchain.');

            // Refresh data after a delay to allow for blockchain processing
            setTimeout(() => {
                loadAcademyData();
            }, 3000);

        } catch (error) {
            console.error('Error issuing certificate:', error);
            alert('Error al emitir el certificado. Verifica que tu academia esté autorizada.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardContent className="pt-6">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 mb-2">{loadingStep}</p>
                        <p className="text-sm text-gray-500 font-mono mb-4">{userAddress}</p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <p className="text-xs text-gray-600">
                                Contrato: {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "No configurado"}
                            </p>
                            <p className="text-xs text-gray-600">
                                Red: {process.env.NEXT_PUBLIC_NETWORK || "testnet"}
                            </p>
                        </div>

                        <Button
                            size="sm"
                            variant="outline"
                            className="mt-4"
                            onClick={() => {
                                setSchoolInfo({ 'school-name': 'Academia de Desarrollo', active: true });
                                setIssuedCertificates([]);
                                setLoading(false);
                            }}
                        >
                            Continuar en Modo Demo
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Si no hay información de escuela, usar valores por defecto
    const displaySchoolInfo = schoolInfo || { 'school-name': 'Mi Academia', active: true };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <School className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {displaySchoolInfo['school-name']}
                            </h1>
                            <p className="text-gray-600">Panel de Certificación Academia</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Academia Activa
                        </Badge>
                        <Badge variant="outline" className="text-xs font-mono">
                            {userAddress}
                        </Badge>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Certificados Emitidos</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{issuedCertificates.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Estudiantes Certificados</CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Set(issuedCertificates.map(cert => cert['student-wallet'])).size}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cursos Diferentes</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Set(issuedCertificates.map(cert => cert.course)).size}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Issue Certificate Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Emitir Nuevo Certificado
                            </CardTitle>
                            <CardDescription>
                                Certifica a un estudiante que ha completado un curso en tu academia
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleIssueCertificate} className="space-y-4">
                                <div>
                                    <Label htmlFor="studentId">ID del Estudiante</Label>
                                    <Input
                                        id="studentId"
                                        placeholder="Ej: STUDENT_001"
                                        value={studentId}
                                        onChange={(e) => setStudentId(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="course">Curso</Label>
                                    <Input
                                        id="course"
                                        placeholder="Ej: Desarrollo Blockchain con Clarity"
                                        value={course}
                                        onChange={(e) => setCourse(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="grade">Calificación</Label>
                                    <Input
                                        id="grade"
                                        placeholder="Ej: A+, 95, Excelente"
                                        value={grade}
                                        onChange={(e) => setGrade(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="studentWallet">Wallet del Estudiante</Label>
                                    <Input
                                        id="studentWallet"
                                        placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                                        value={studentWallet}
                                        onChange={(e) => setStudentWallet(e.target.value)}
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Emitiendo...
                                        </>
                                    ) : (
                                        <>
                                            <FileCheck className="h-4 w-4 mr-2" />
                                            Emitir Certificado
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Issued Certificates List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Certificados Emitidos
                            </CardTitle>
                            <CardDescription>
                                Lista de todos los certificados emitidos por tu academia
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {issuedCertificates.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No hay certificados emitidos aún</p>
                                    <p className="text-sm">Emite tu primer certificado usando el formulario</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {issuedCertificates.map((certificate) => (
                                        <div
                                            key={certificate.id}
                                            className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-sm">{certificate.course}</h4>
                                                    <p className="text-xs text-gray-600">ID: {certificate['student-id']}</p>
                                                </div>
                                                <Badge variant="secondary" className="text-xs">
                                                    #{certificate.id}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-green-600">
                                                    Calificación: {certificate.grade}
                                                </span>
                                                <span className="text-xs text-gray-500 font-mono">
                                                    {certificate['student-wallet'].slice(0, 8)}...
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}