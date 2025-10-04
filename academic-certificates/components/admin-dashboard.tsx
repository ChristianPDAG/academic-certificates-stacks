"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    School,
    Users,
    Award,
    Plus,
    Settings,
    UserCheck,
    AlertCircle,
    CheckCircle,
    XCircle
} from "lucide-react";
import { useStacks } from "@/lib/stacks-provider";
import {
    registerSchoolClient,
    deactivateSchoolClient,
    changeSuperAdminClient,
    getSchoolInfoClient,
    getSuperAdminClient,
    getTotalCertificatesClient,
    getSystemStatsClient,
    type SchoolInfo,
    type AdminStats,
} from "@/lib/stacks-client"; interface AdminDashboardProps {
    userClaims: any;
}

interface SchoolData extends SchoolInfo {
    principal: string;
}

export function AdminDashboard({ userClaims }: AdminDashboardProps) {
    const { userAddress, isSignedIn } = useStacks();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [schools, setSchools] = useState<SchoolData[]>([]);
    const [loading, setLoading] = useState(true);
    const [newSchoolPrincipal, setNewSchoolPrincipal] = useState("");
    const [newSchoolName, setNewSchoolName] = useState("");
    const [newAdminAddress, setNewAdminAddress] = useState("");
    const [searchSchoolPrincipal, setSearchSchoolPrincipal] = useState("");
    const [searchResult, setSearchResult] = useState<SchoolData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cargar estadísticas del sistema
    const loadSystemStats = async () => {
        try {
            const systemStats = await getSystemStatsClient();
            setStats(systemStats);
        } catch (error) {
            console.error("Error loading system stats:", error);
        }
    };

    // Buscar información de una escuela específica
    const searchSchool = async () => {
        if (!searchSchoolPrincipal) return;

        try {
            setLoading(true);
            const schoolInfo = await getSchoolInfoClient(searchSchoolPrincipal);
            if (schoolInfo && schoolInfo.value) {
                setSearchResult({
                    principal: searchSchoolPrincipal,
                    'school-name': schoolInfo.value['school-name'],
                    active: schoolInfo.value.active
                });
            } else {
                setSearchResult(null);
            }
        } catch (error) {
            console.error("Error searching school:", error);
            setSearchResult(null);
        } finally {
            setLoading(false);
        }
    };

    // Registrar nueva academia
    const handleRegisterSchool = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSchoolPrincipal || !newSchoolName) {
            alert("Por favor completa todos los campos y asegúrate de que la wallet esté conectada");
            return;
        }

        try {
            setIsSubmitting(true);
            console.log("Iniciando registro de academia:", { newSchoolPrincipal, newSchoolName, userAddress });

            // Usar la dirección de la wallet conectada
            const result = await registerSchoolClient(newSchoolPrincipal, newSchoolName);

            console.log("Resultado del registro:", result);
            setNewSchoolPrincipal("");
            setNewSchoolName("");
            alert("Transacción enviada. Espera confirmación en tu wallet.");

            // Actualizar estadísticas después de un breve delay
            setTimeout(() => {
                loadSystemStats();
            }, 2000);
        } catch (error) {
            console.error("Error registering school:", error);
            alert(`Error al registrar academia: ${error}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Desactivar academia
    const handleDeactivateSchool = async (schoolPrincipal: string) => {
        if (!userAddress) return;

        try {
            setIsSubmitting(true);
            await deactivateSchoolClient(schoolPrincipal);
            alert("Academia desactivada exitosamente");

            // Actualizar la búsqueda si es la misma escuela
            if (searchResult && searchResult.principal === schoolPrincipal) {
                await searchSchool();
            }
        } catch (error) {
            console.error("Error deactivating school:", error);
            alert(`Error al desactivar academia: ${error}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Cambiar super administrador
    const handleChangeSuperAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdminAddress) return;

        try {
            setIsSubmitting(true);
            await changeSuperAdminClient(newAdminAddress);
            alert("Super administrador cambiado exitosamente");
            setNewAdminAddress("");
            await loadSystemStats();
        } catch (error) {
            console.error("Error changing super admin:", error);
            alert(`Error al cambiar super administrador: ${error}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        loadSystemStats().finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Cargando datos del sistema...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Información de Configuración */}
            <Card className="bg-amber-50 border-amber-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-800">
                        <AlertCircle className="h-5 w-5" />
                        Configuración del Contrato
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-amber-700">
                    <p><strong>⚠️ IMPORTANTE:</strong> Para que funcione correctamente, debes:</p>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Desplegar el contrato <code>nft.clar</code> en Stacks</li>
                        <li>Configurar las variables de entorno con la dirección real del contrato</li>
                        <li>Asegurarte de ser el super-admin del contrato</li>
                    </ol>
                    <p className="mt-2">
                        <strong>Contrato actual:</strong> <code className="bg-amber-100 px-1 rounded">ST15Z41T89K34CD6Q1N8DX2VZGCP50ATNAHPFXMBV</code>
                    </p>
                </CardContent>
            </Card>

            {/* Estadísticas del Sistema */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Certificados</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalCertificates || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Certificados emitidos en el sistema
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Super Admin</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs font-mono bg-muted p-2 rounded">
                            {stats?.superAdmin || "No disponible"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Administrador actual del sistema
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estado</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Activo</div>
                        <p className="text-xs text-muted-foreground">
                            Sistema funcionando correctamente
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Registrar Nueva Academia */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Registrar Nueva Academia
                    </CardTitle>
                    <CardDescription>
                        Agregar una nueva academia autorizada para emitir certificados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegisterSchool} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="schoolPrincipal">Dirección de la Academia (Principal)</Label>
                                <Input
                                    id="schoolPrincipal"
                                    placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                                    value={newSchoolPrincipal}
                                    onChange={(e) => setNewSchoolPrincipal(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="schoolName">Nombre de la Academia</Label>
                                <Input
                                    id="schoolName"
                                    placeholder="Universidad ABC"
                                    value={newSchoolName}
                                    onChange={(e) => setNewSchoolName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Registrando..." : "Registrar Academia"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Buscar y Gestionar Academias */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <School className="h-5 w-5" />
                        Gestionar Academias
                    </CardTitle>
                    <CardDescription>
                        Buscar y gestionar academias existentes
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Dirección de la academia a buscar"
                            value={searchSchoolPrincipal}
                            onChange={(e) => setSearchSchoolPrincipal(e.target.value)}
                        />
                        <Button onClick={searchSchool} variant="outline">
                            Buscar
                        </Button>
                    </div>

                    {searchResult && (
                        <Card className="bg-muted/50">
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium">{searchResult['school-name']}</h3>
                                        <Badge variant={searchResult.active ? "default" : "destructive"}>
                                            {searchResult.active ? "Activa" : "Inactiva"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground font-mono">
                                        {searchResult.principal}
                                    </p>
                                    {searchResult.active && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeactivateSchool(searchResult.principal)}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Desactivando..." : "Desactivar Academia"}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {searchSchoolPrincipal && !searchResult && !loading && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            <span>No se encontró ninguna academia con esa dirección</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Cambiar Super Administrador */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Configuración del Sistema
                    </CardTitle>
                    <CardDescription>
                        Cambiar el super administrador del sistema (acción irreversible)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleChangeSuperAdmin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newAdmin">Nueva Dirección de Super Administrador</Label>
                            <Input
                                id="newAdmin"
                                placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                                value={newAdminAddress}
                                onChange={(e) => setNewAdminAddress(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2 text-amber-600 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span>⚠️ Esta acción transferirá todos los permisos administrativos</span>
                        </div>
                        <Button type="submit" variant="destructive" disabled={isSubmitting}>
                            {isSubmitting ? "Cambiando..." : "Cambiar Super Administrador"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}