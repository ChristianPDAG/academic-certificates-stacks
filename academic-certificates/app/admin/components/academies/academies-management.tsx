"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { slideInFromBottom } from "@/utils/motion";
import { getAllAcademies } from "@/app/actions/admin/academies";
import { AcademyCard } from "./academy-card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { School, Search, Filter, RefreshCw, TrendingUp, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Academy {
    id_academy: string;
    legal_name: string;
    contact_academy_email: string;
    stacks_address: string;
    credits: number;
    validation_status: string;
    created_at: string;
    disabled_at: string | null;
}

interface AcademiesManagementProps {
    initialAcademies: Academy[];
}

export function AcademiesManagement({ initialAcademies }: AcademiesManagementProps) {
    const [academies, setAcademies] = useState<Academy[]>(initialAcademies);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "pending">("all");
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        try {
            setIsRefreshing(true);
            const data = await getAllAcademies();
            setAcademies(data);
        } catch (error) {
            console.error("Error refreshing:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const filteredAcademies = academies.filter((academy) => {
        const matchesSearch =
            academy.legal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            academy.contact_academy_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            academy.stacks_address.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            filterStatus === "all" ||
            (filterStatus === "active" && !academy.disabled_at) ||
            (filterStatus === "inactive" && academy.disabled_at) ||
            (filterStatus === "pending" && academy.validation_status === "pending");

        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: academies.length,
        active: academies.filter((a) => !a.disabled_at).length,
        pending: academies.filter((a) => a.validation_status === "pending").length,
        totalCredits: academies.reduce((sum, a) => sum + (a.credits || 0), 0),
    };

    return (
        <main className="relative min-h-screen w-full bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
            {/* Fondo */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[url('/img/bg-waves-3.svg')] bg-cover bg-center opacity-10 dark:opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white dark:from-neutral-950/60 dark:to-neutral-950" />
            </div>

            <div className="container mx-auto max-w-7xl px-4 lg:px-0 py-16 md:py-20">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial="offScreen"
                    whileInView="onScreen"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={slideInFromBottom({ delay: 0.05 })}
                >
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="p-5 rounded-full border-2 bg-gradient-to-br from-sky-500/20 to-sky-500/10 border-sky-500/30">
                            <School className="h-10 w-10 text-sky-500 dark:text-sky-400" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3">
                        Gestión de <span className="text-sky-500 dark:text-sky-400">Academias</span>
                    </h1>
                    <p className="text-base md:text-lg lg:text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
                        Administra el estado, validación y créditos de las instituciones académicas.
                    </p>
                </motion.div>

                {/* Estadísticas */}
                <motion.div
                    className="mb-8"
                    initial="offScreen"
                    whileInView="onScreen"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={slideInFromBottom({ delay: 0.1 })}
                >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-6 rounded-2xl border backdrop-blur-xl bg-white/80 border-neutral-200 dark:bg-neutral-900/70 dark:border-neutral-800">
                            <div className="flex items-center gap-3 mb-2">
                                <Users className="h-8 w-8 text-sky-500 dark:text-sky-400" />
                                <div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Academias</p>
                                    <p className="text-3xl font-bold text-sky-600 dark:text-sky-400">{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl border backdrop-blur-xl bg-white/80 border-neutral-200 dark:bg-neutral-900/70 dark:border-neutral-800">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="h-8 w-8 text-green-500 dark:text-green-400" />
                                <div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Activas</p>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl border backdrop-blur-xl bg-white/80 border-neutral-200 dark:bg-neutral-900/70 dark:border-neutral-800">
                            <div className="flex items-center gap-3 mb-2">
                                <Award className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
                                <div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Pendientes</p>
                                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl border backdrop-blur-xl bg-white/80 border-neutral-200 dark:bg-neutral-900/70 dark:border-neutral-800">
                            <div className="flex items-center gap-3 mb-2">
                                <School className="h-8 w-8 text-amber-500 dark:text-amber-400" />
                                <div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Créditos Totales</p>
                                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.totalCredits}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Filtros y búsqueda */}
                <motion.div
                    className="mb-8"
                    initial="offScreen"
                    whileInView="onScreen"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={slideInFromBottom({ delay: 0.15 })}
                >
                    <div className="p-6 rounded-2xl border backdrop-blur-xl bg-white/80 border-neutral-200 dark:bg-neutral-900/70 dark:border-neutral-800">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-6 space-y-2">
                                <Label htmlFor="search" className="flex items-center gap-2 font-semibold">
                                    <Search className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                                    Buscar Academia
                                </Label>
                                <Input
                                    id="search"
                                    placeholder="Nombre, email o dirección..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-white dark:bg-neutral-800 border-2"
                                />
                            </div>

                            <div className="md:col-span-4 space-y-2">
                                <Label className="flex items-center gap-2 font-semibold">
                                    <Filter className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                                    Filtrar por Estado
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant={filterStatus === "all" ? "default" : "outline"}
                                        onClick={() => setFilterStatus("all")}
                                        className="text-sm"
                                    >
                                        Todas
                                    </Button>
                                    <Button
                                        variant={filterStatus === "active" ? "default" : "outline"}
                                        onClick={() => setFilterStatus("active")}
                                        className="text-sm"
                                    >
                                        Activas
                                    </Button>
                                    <Button
                                        variant={filterStatus === "inactive" ? "default" : "outline"}
                                        onClick={() => setFilterStatus("inactive")}
                                        className="text-sm"
                                    >
                                        Inactivas
                                    </Button>
                                    <Button
                                        variant={filterStatus === "pending" ? "default" : "outline"}
                                        onClick={() => setFilterStatus("pending")}
                                        className="text-sm"
                                    >
                                        Pendientes
                                    </Button>
                                </div>
                            </div>

                            <div className="md:col-span-2 flex items-end">
                                <Button onClick={handleRefresh} disabled={isRefreshing} className="w-full bg-sky-500 hover:bg-sky-600">
                                    <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                                    Actualizar
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Lista de Academias */}
                <motion.div
                    className="space-y-6"
                    initial="offScreen"
                    whileInView="onScreen"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={slideInFromBottom({ delay: 0.2 })}
                >
                    {filteredAcademies.length === 0 ? (
                        <div className="text-center py-12">
                            <School className="h-16 w-16 mx-auto text-neutral-400 dark:text-neutral-600 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No se encontraron academias</h3>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                {searchTerm || filterStatus !== "all"
                                    ? "Intenta cambiar los filtros de búsqueda"
                                    : "No hay academias registradas en el sistema"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredAcademies.map((academy) => (
                                <AcademyCard key={academy.id_academy} academy={academy} onUpdate={handleRefresh} />
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </main>
    );
}
