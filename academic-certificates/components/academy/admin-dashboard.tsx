"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    School,
    Award,
    Plus,
    Settings,
    UserCheck,
    AlertCircle,
    CheckCircle,
    Mail,
    Link as LinkIcon,
    Calendar
} from "lucide-react";
import { useStacks } from "@/lib/stacks-provider";
import {
    registerSchoolClient,
    deactivateSchoolClient,
    changeSuperAdminClient,
    getSchoolInfoClient,
    getSystemStatsClient,
    transferSTXClient,
    getAddressBalanceClient,
    type SchoolInfo,
    type AdminStats,
} from "@/lib/stacks-client";
import { getAcademyUsers } from "@/app/actions/admin";


interface SchoolData extends SchoolInfo {
    principal: string;
}

interface AcademyUser {
    email: string;
    nombre: string;
    stacks_address: string;
    role: string;
    created_at: string;
}

export function AdminDashboard() {
    const { userAddress } = useStacks();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [newSchoolPrincipal, setNewSchoolPrincipal] = useState("");
    const [newSchoolName, setNewSchoolName] = useState("");
    const [newAdminAddress, setNewAdminAddress] = useState("");
    const [searchSchoolPrincipal, setSearchSchoolPrincipal] = useState("");
    const [searchResult, setSearchResult] = useState<SchoolData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [academyUsers, setAcademyUsers] = useState<AcademyUser[]>([]);
    const [selectedAcademy, setSelectedAcademy] = useState<AcademyUser | null>(null);
    const [fundingAmount, setFundingAmount] = useState<number>(10);
    const [shouldFundAcademy, setShouldFundAcademy] = useState<boolean>(true);
    const [academyBalances, setAcademyBalances] = useState<Map<string, number>>(new Map());
    const [loadingBalances, setLoadingBalances] = useState(false);
    const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
    const [selectedRechargeAcademy, setSelectedRechargeAcademy] = useState<string | null>(null);
    const [rechargeAmount, setRechargeAmount] = useState<number>(10);

    // Cargar estadísticas del sistema
    const loadSystemStats = async () => {
        try {
            const systemStats = await getSystemStatsClient();
            setStats(systemStats);
        } catch (error) {
            console.error("Error loading system stats:", error);
        }
    };

    // Cargar lista de usuarios con rol academy
    const loadAcademyUsers = async () => {
        try {
            const users = await getAcademyUsers();
            setAcademyUsers(users);
        } catch (error) {
            console.error("Error loading academy users:", error);
        }
    };

    // Manejar selección de academia
    const handleAcademySelect = (academyEmail: string) => {
        const academy = academyUsers.find(u => u.email === academyEmail);
        if (academy) {
            setSelectedAcademy(academy);
            setNewSchoolPrincipal(academy.stacks_address);
            setNewSchoolName(academy.nombre);
        }
    };

    // Cargar balances de academias registradas
    const loadAcademyBalances = async () => {
        if (!searchResult) return;

        setLoadingBalances(true);
        try {
            const balance = await getAddressBalanceClient(searchResult.principal);
            const newBalances = new Map(academyBalances);
            newBalances.set(searchResult.principal, balance);
            setAcademyBalances(newBalances);
        } catch (error) {
            console.error("Error loading academy balance:", error);
        } finally {
            setLoadingBalances(false);
        }
    };

    // Manejar recarga de STX a academia
    const handleRechargeAcademy = async () => {
        if (!selectedRechargeAcademy || rechargeAmount <= 0) return;

        try {
            setIsSubmitting(true);
            await transferSTXClient(selectedRechargeAcademy, rechargeAmount);

            alert(
                `✅ Recarga exitosa!\n\n` +
                `💰 ${rechargeAmount} STX transferidos\n` +
                `📊 ~${Math.floor(rechargeAmount * 500)} certificados adicionales disponibles`
            );

            // Recargar balance después de un delay
            setTimeout(() => {
                loadAcademyBalances();
            }, 2000);

            // Cerrar dialog
            setRechargeDialogOpen(false);
            setSelectedRechargeAcademy(null);
            setRechargeAmount(10);
        } catch (error) {
            console.error("Error recharging academy:", error);
            alert(`❌ Error al recargar: ${error}`);
        } finally {
            setIsSubmitting(false);
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

                // Cargar balance de la academia
                setTimeout(() => {
                    loadAcademyBalances();
                }, 500);
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
            console.log("Iniciando registro de academia:", {
                newSchoolPrincipal,
                newSchoolName,
                userAddress,
                fundingAmount,
                shouldFundAcademy
            });

            // 1. Registrar academia en contrato
            const resultRegister = await registerSchoolClient(newSchoolPrincipal, newSchoolName);
            console.log("Academia registrada:", resultRegister);

            // 2. Transferir STX si está habilitado
            if (shouldFundAcademy && fundingAmount > 0) {
                console.log(`Transfiriendo ${fundingAmount} STX a ${newSchoolPrincipal}`);

                // Pequeño delay para que la primera transacción se procese
                await new Promise(resolve => setTimeout(resolve, 1000));

                const resultTransfer = await transferSTXClient(
                    newSchoolPrincipal,
                    fundingAmount
                );
                console.log("STX transferidos:", resultTransfer);

                alert(
                    `✅ Academia registrada exitosamente!\n\n` +
                    `💰 Se transfirieron ${fundingAmount} STX a la academia.\n\n` +
                    `La academia podrá emitir aproximadamente ${Math.floor(fundingAmount * 500)} certificados.\n\n` +
                    `Espera confirmación de ambas transacciones en tu wallet.`
                );
            } else {
                alert(
                    `✅ Academia registrada exitosamente!\n\n` +
                    `Espera confirmación en tu wallet.`
                );
            }

            // 3. Limpiar formulario
            setNewSchoolPrincipal("");
            setNewSchoolName("");
            setSelectedAcademy(null);
            setFundingAmount(10);
            setShouldFundAcademy(true);

            // 4. Actualizar estadísticas
            setTimeout(() => {
                loadSystemStats();
            }, 2000);
        } catch (error) {
            console.error("Error registering school:", error);
            alert(`❌ Error al registrar academia: ${error}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Desactivar academia
    const handleDeactivateSchool = async (schoolPrincipal: string) => {
        if (!schoolPrincipal) return;

        try {
            setIsSubmitting(true);
            console.log("Desactivando academia:", schoolPrincipal);
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
        Promise.all([loadSystemStats(), loadAcademyUsers()])
            .finally(() => setLoading(false));
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
                        <div className="space-y-2">
                            <Label htmlFor="academySelect">Seleccionar Academia</Label>
                            <Select onValueChange={handleAcademySelect} value={selectedAcademy?.email || ""}>
                                <SelectTrigger id="academySelect">
                                    <SelectValue placeholder="Selecciona una academia..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {academyUsers.length === 0 ? (
                                        <SelectItem value="no-academies" disabled>
                                            No hay academias disponibles
                                        </SelectItem>
                                    ) : (
                                        academyUsers.map((academy) => (
                                            <SelectItem key={academy.email} value={academy.email}>
                                                {academy.nombre} - {academy.email}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedAcademy && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="schoolName">Nombre de la Academia</Label>
                                    <Input
                                        id="schoolName"
                                        value={newSchoolName}
                                        readOnly
                                        className="bg-muted"
                                    />
                                </div>

                                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                    <h4 className="font-medium text-sm mb-3">📋 Información de la Academia</h4>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="font-mono">{selectedAcademy.email}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm">
                                        <LinkIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <span className="text-muted-foreground">Stacks Address:</span>
                                        <span className="font-mono text-xs break-all">{selectedAcademy.stacks_address}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Registrado el:</span>
                                        <span>{new Date(selectedAcademy.created_at).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</span>
                                    </div>
                                </div>

                                {/* Sección de Fondeo */}
                                <div className="border rounded-lg p-4 space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="fundAcademy"
                                            checked={shouldFundAcademy}
                                            onCheckedChange={(checked) => setShouldFundAcademy(checked as boolean)}
                                        />
                                        <Label
                                            htmlFor="fundAcademy"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            💰 Fondear academia con STX
                                        </Label>
                                    </div>

                                    {shouldFundAcademy && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="fundingAmount">
                                                    Cantidad de STX a transferir
                                                </Label>
                                                <Input
                                                    id="fundingAmount"
                                                    type="number"
                                                    min="1"
                                                    step="0.1"
                                                    value={fundingAmount}
                                                    onChange={(e) => setFundingAmount(parseFloat(e.target.value) || 0)}
                                                    placeholder="10"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Con {fundingAmount} STX la academia podrá emitir aproximadamente{" "}
                                                    <strong>{Math.floor(fundingAmount * 500)}</strong> certificados
                                                </p>
                                            </div>

                                            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg space-y-1 text-sm">
                                                <p className="font-medium">💡 Costo estimado total:</p>
                                                <ul className="space-y-1 ml-4 text-muted-foreground">
                                                    <li>• Registro de academia: ~0.001 STX</li>
                                                    <li>• Fondeo inicial: {fundingAmount} STX</li>
                                                    <li className="font-medium text-foreground">
                                                        Total: ~{(fundingAmount + 0.001).toFixed(3)} STX
                                                    </li>
                                                </ul>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}

                        <Button type="submit" disabled={isSubmitting || !selectedAcademy}>
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
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium">{searchResult['school-name']}</h3>
                                        <Badge variant={searchResult.active ? "default" : "destructive"}>
                                            {searchResult.active ? "Activa" : "Inactiva"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground font-mono">
                                        {searchResult.principal}
                                    </p>

                                    {/* Panel de Balance */}
                                    <div className="border rounded-lg p-4 bg-background">
                                        <h4 className="font-medium text-sm mb-3">💰 Balance y Fondos</h4>
                                        {loadingBalances ? (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                                <span className="text-sm">Cargando balance...</span>
                                            </div>
                                        ) : (
                                            <>
                                                {(() => {
                                                    const balance = academyBalances.get(searchResult.principal) || 0;
                                                    console.log("Balance de la academia:", balance);
                                                    {/* Considerando que cada certificado cuesta 0.0005 STX, calcula */ }
                                                    const certCost = 0.0005;
                                                    const estimatedCerts = Math.floor(balance / certCost);
                                                    const balanceColor = balance > 5
                                                        ? 'text-green-600'
                                                        : balance > 1
                                                            ? 'text-yellow-600'
                                                            : 'text-red-600';

                                                    return (
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-muted-foreground">Balance STX:</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`font-bold text-lg ${balanceColor}`}>
                                                                        {balance.toFixed(2)} STX
                                                                    </span>
                                                                    {balance < 1 && (
                                                                        <Badge variant="destructive" className="text-xs">
                                                                            ⚠️ Bajo
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-muted-foreground">Certificados estimados:</span>
                                                                <span className="text-sm font-medium">
                                                                    ~{estimatedCerts} certificados
                                                                </span>
                                                            </div>
                                                            {balance < 5 && (
                                                                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded p-2 text-xs text-yellow-800 dark:text-yellow-200">
                                                                    {balance < 1
                                                                        ? "⚠️ Balance crítico: La academia necesita recarga urgente"
                                                                        : "⚠️ Balance bajo: Considera recargar pronto"
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </>
                                        )}
                                    </div>

                                    {/* Botones de Acción */}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedRechargeAcademy(searchResult.principal);
                                                setRechargeDialogOpen(true);
                                            }}
                                            disabled={isSubmitting}
                                        >
                                            💰 Recargar STX
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => loadAcademyBalances()}
                                            disabled={loadingBalances}
                                        >
                                            🔄 Actualizar Balance
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeactivateSchool(searchResult.principal)}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Desactivando..." : "Desactivar Academia"}
                                        </Button>
                                    </div>
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

            {/* Dialog de Recarga de STX */}
            <Dialog open={rechargeDialogOpen} onOpenChange={setRechargeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>💰 Recargar STX a Academia</DialogTitle>
                        <DialogDescription>
                            Transfiere STX adicionales a la academia para que pueda continuar emitiendo certificados.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {selectedRechargeAcademy && (
                            <div className="bg-muted p-3 rounded-lg space-y-2">
                                <div>
                                    <p className="text-sm font-medium">Academia seleccionada:</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {selectedRechargeAcademy}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm">
                                        Balance actual:{" "}
                                        <span className="font-semibold">
                                            {(academyBalances.get(selectedRechargeAcademy) || 0).toFixed(2)} STX
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="rechargeAmountInput">Cantidad de STX a transferir</Label>
                            <Input
                                id="rechargeAmountInput"
                                type="number"
                                min="1"
                                step="0.1"
                                value={rechargeAmount}
                                onChange={(e) => setRechargeAmount(parseFloat(e.target.value) || 0)}
                                placeholder="10"
                            />
                            <p className="text-xs text-muted-foreground">
                                Con {rechargeAmount} STX adicionales, la academia podrá emitir aproximadamente{" "}
                                <strong>{Math.floor(rechargeAmount * 500)}</strong> certificados más
                            </p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-sm space-y-1">
                            <p className="font-medium">💡 Balance después de la recarga:</p>
                            {selectedRechargeAcademy && (
                                <div className="text-muted-foreground">
                                    <p>
                                        {((academyBalances.get(selectedRechargeAcademy) || 0) + rechargeAmount).toFixed(2)} STX
                                    </p>
                                    <p className="text-xs">
                                        (~{Math.floor(((academyBalances.get(selectedRechargeAcademy) || 0) + rechargeAmount) * 500)} certificados totales)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setRechargeDialogOpen(false);
                                setRechargeAmount(10);
                            }}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleRechargeAcademy}
                            disabled={isSubmitting || rechargeAmount <= 0}
                        >
                            {isSubmitting ? "Procesando..." : `Transferir ${rechargeAmount} STX`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}