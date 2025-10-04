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
    Search,
    ExternalLink,
    Wallet,
    AlertCircle,
    CheckCircle,
    GraduationCap,
    Eye
} from "lucide-react";
import {
    getStudentCertificatesClient,
    getCertificateClient,
    type CertificatesList,
    type CertificateDetails,
} from "@/lib/stacks-client";
import { createClient } from "@/lib/supabase/client";

interface StudentCertificate extends CertificateDetails {
    id: number;
}

interface StudentDashboardProps {
    user: any;
}

export default function StudentDashboard({ user }: StudentDashboardProps) {
    const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchAddress, setSearchAddress] = useState("");
    const [userStacksAddress, setUserStacksAddress] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchedCertificates, setSearchedCertificates] = useState<StudentCertificate[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Load user's stacks address from profile
    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const supabase = createClient();

            // Intentar obtener el stacks_address del perfil del usuario
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('stacks_address')
                .eq('id', user.id)
                .single();

            if (profile?.stacks_address) {
                setUserStacksAddress(profile.stacks_address);
                loadCertificatesForAddress(profile.stacks_address);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            setLoading(false);
        }
    };

    const loadCertificatesForAddress = async (address: string) => {
        try {
            setLoading(true);
            setError(null);

            // Get student certificates
            const certificatesData = await getStudentCertificatesClient(address);

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
                setCertificates(certificates.filter((cert: any) => cert.course)); // Filter out null results
            } else {
                setCertificates([]);
            }
        } catch (error) {
            console.error('Error loading certificates:', error);
            setError(error instanceof Error ? error.message : 'Error al cargar certificados');
            setCertificates([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchCertificates = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchAddress.trim()) {
            alert('Por favor ingresa una dirección de Stacks');
            return;
        }

        try {
            setIsSearching(true);
            setError(null);

            // Get student certificates for searched address
            const certificatesData = await getStudentCertificatesClient(searchAddress);

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
                setSearchedCertificates(certificates.filter((cert: any) => cert.course));
            } else {
                setSearchedCertificates([]);
            }
        } catch (error) {
            console.error('Error searching certificates:', error);
            setError(error instanceof Error ? error.message : 'Error al buscar certificados');
            setSearchedCertificates([]);
        } finally {
            setIsSearching(false);
        }
    };

    const saveStacksAddress = async () => {
        if (!searchAddress.trim()) {
            alert('Por favor ingresa una dirección válida');
            return;
        }

        try {
            const supabase = createClient();

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    stacks_address: searchAddress,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            setUserStacksAddress(searchAddress);
            setCertificates(searchedCertificates);
            alert('Dirección de Stacks guardada exitosamente!');
        } catch (error) {
            console.error('Error saving stacks address:', error);
            alert('Error al guardar la dirección de Stacks');
        }
    };

    const CertificateCard = ({ certificate }: { certificate: StudentCertificate }) => (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{certificate.course}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                            <GraduationCap className="h-4 w-4" />
                            ID: {certificate['student-id']}
                        </CardDescription>
                    </div>
                    <Badge variant="secondary">
                        #{certificate.id}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Calificación:</span>
                        <span className="font-semibold text-green-600 text-lg">
                            {certificate.grade}
                        </span>
                    </div>

                    <div className="space-y-1">
                        <span className="text-sm text-gray-600">Emitido por:</span>
                        <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                            {certificate['school-id']}
                        </p>
                    </div>

                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            // Aquí se podría abrir un modal con más detalles o link al explorador de blockchain
                            window.open(`https://explorer.stacks.co/txid/${certificate.id}?chain=testnet`, '_blank');
                        }}
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver en Blockchain
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="container mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <GraduationCap className="h-8 w-8 text-green-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Panel de Estudiante
                            </h1>
                            <p className="text-gray-600">Consulta y verifica tus certificados académicos</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Users className="h-3 w-3 mr-1" />
                            {user.email}
                        </Badge>
                        {userStacksAddress && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Wallet className="h-3 w-3 mr-1" />
                                Wallet conectada
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Search Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Buscar Certificados
                        </CardTitle>
                        <CardDescription>
                            {!userStacksAddress
                                ? "Ingresa tu dirección de Stacks para ver tus certificados"
                                : "Busca certificados por dirección de Stacks"
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearchCertificates} className="space-y-4">
                            <div>
                                <Label htmlFor="stacksAddress">Dirección de Stacks</Label>
                                <Input
                                    id="stacksAddress"
                                    placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                                    value={searchAddress}
                                    onChange={(e) => setSearchAddress(e.target.value)}
                                    className="font-mono text-sm"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    disabled={isSearching}
                                    className="flex-1"
                                >
                                    {isSearching ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Buscando...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="h-4 w-4 mr-2" />
                                            Buscar Certificados
                                        </>
                                    )}
                                </Button>

                                {!userStacksAddress && searchedCertificates.length > 0 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={saveStacksAddress}
                                    >
                                        Guardar como mi dirección
                                    </Button>
                                )}
                            </div>
                        </form>

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* My Certificates Section */}
                {userStacksAddress && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Award className="h-6 w-6 text-green-600" />
                            Mis Certificados
                            {certificates.length > 0 && (
                                <Badge variant="secondary">{certificates.length}</Badge>
                            )}
                        </h2>

                        {loading ? (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Cargando tus certificados...</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : certificates.length === 0 ? (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center py-8 text-gray-500">
                                        <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p className="mb-2">No tienes certificados aún</p>
                                        <p className="text-sm">Los certificados emitidos a tu dirección aparecerán aquí</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {certificates.map((certificate) => (
                                    <CertificateCard
                                        key={certificate.id}
                                        certificate={certificate}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Search Results Section */}
                {searchedCertificates.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Eye className="h-6 w-6 text-blue-600" />
                            Resultados de Búsqueda
                            <Badge variant="secondary">{searchedCertificates.length}</Badge>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchedCertificates.map((certificate) => (
                                <CertificateCard
                                    key={certificate.id}
                                    certificate={certificate}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Help Section */}
                {!userStacksAddress && searchedCertificates.length === 0 && !loading && (
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <BookOpen className="h-6 w-6 text-blue-600 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-blue-900 mb-2">¿Cómo encontrar mi dirección de Stacks?</h3>
                                    <div className="text-sm text-blue-800 space-y-2">
                                        <p>• Si tienes Stacks Wallet, tu dirección está en la pantalla principal</p>
                                        <p>• Si no tienes wallet, pregunta a tu academia por tu dirección</p>
                                        <p>• Los certificados se almacenan automáticamente en tu dirección cuando son emitidos</p>
                                        <p>• Puedes usar cualquier dirección válida de Stacks para buscar certificados públicos</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}