"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { slideInFromBottom } from "@/utils/motion";
import { getAcademyProfile, updateAcademyProfile } from "@/app/actions/academy/profile";
import { getCitiesByState } from "@/app/actions/utils/nations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";

import countriesData from "@/data/countries.json";
import statesData from "@/data/states.json";

import {
    Building2,
    Save,
    CheckCircle2,
    XCircle,
    Loader2,
    School,
    Mail,
    User,
    Globe,
    FileText,
    AlertCircle,
    MapPin,
} from "lucide-react";

type SaveStatus = "idle" | "loading" | "success" | "error";

interface AcademyProfileProps {
    id: string;
}

interface AcademyData {
    legal_name: string;
    institution_type: string;
    registration_id: string;
    contact_person_name: string;
    contact_person_email: string;
    contact_academy_email: string;
    website: string;
    stacks_address: string;
    credits: number;
    validation_status: string;
    country?: number;
    region_state?: number;
    city?: number;
}

export function AcademyProfile({ id }: AcademyProfileProps) {
    // ─── Form state ──────────────────────────────────────────────────────
    const [formData, setFormData] = useState<AcademyData>({
        legal_name: "",
        institution_type: "",
        registration_id: "",
        contact_person_name: "",
        contact_person_email: "",
        contact_academy_email: "",
        website: "",
        stacks_address: "",
        credits: 0,
        validation_status: "",
        country: undefined,
        region_state: undefined,
        city: undefined,
    });

    // ─── Location state ──────────────────────────────────────────────────
    const [availableStates, setAvailableStates] = useState<Array<{ id: number; name: string }>>([]);
    const [availableCities, setAvailableCities] = useState<Array<{ id: number; name: string }>>([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);

    // ─── UX state ────────────────────────────────────────────────────────
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
    const [errorMessage, setErrorMessage] = useState("");

    // ─── Load academy profile ────────────────────────────────────────────
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setIsLoadingProfile(true);
                const profile = await getAcademyProfile(id);
                if (profile) {
                    setFormData({
                        legal_name: profile.legal_name || "",
                        institution_type: profile.institution_type || "",
                        registration_id: profile.registration_id || "",
                        contact_person_name: profile.contact_person_name || "",
                        contact_person_email: profile.contact_person_email || "",
                        contact_academy_email: profile.contact_academy_email || "",
                        website: profile.website || "",
                        stacks_address: profile.stacks_address || "",
                        credits: profile.credits || 0,
                        validation_status: profile.validation_status || "pending",
                        country: profile.country,
                        region_state: profile.region_state,
                        city: profile.city,
                    });

                    // Load states if country is set
                    if (profile.country) {
                        const filteredStates = statesData.states.filter((state) => state.id_country === profile.country);
                        setAvailableStates(filteredStates);
                    }

                    // Load cities if state is set
                    if (profile.region_state) {
                        const cities = await getCitiesByState(profile.region_state);
                        setAvailableCities(cities);
                    }
                }
            } catch (error) {
                console.error("Error loading profile:", error);
                setErrorMessage("Error al cargar el perfil de la academia");
            } finally {
                setIsLoadingProfile(false);
            }
        };

        loadProfile();
    }, [id]);

    // ─── Handle country change ───────────────────────────────────────────
    useEffect(() => {
        if (formData.country) {
            const filteredStates = statesData.states.filter((state) => state.id_country === formData.country);
            setAvailableStates(filteredStates);

            // Reset state and city if country changes
            if (formData.region_state) {
                const stateStillValid = filteredStates.some((s) => s.id === formData.region_state);
                if (!stateStillValid) {
                    setFormData((prev) => ({ ...prev, region_state: undefined, city: undefined }));
                    setAvailableCities([]);
                }
            }
        } else {
            setAvailableStates([]);
            setAvailableCities([]);
        }
    }, [formData.country]);

    // ─── Handle state change ─────────────────────────────────────────────
    useEffect(() => {
        const loadCities = async () => {
            if (formData.region_state) {
                try {
                    setIsLoadingCities(true);
                    const cities = await getCitiesByState(formData.region_state);
                    setAvailableCities(cities);

                    // Reset city if state changes
                    if (formData.city) {
                        const cityStillValid = cities.some((c) => c.id === formData.city);
                        if (!cityStillValid) {
                            setFormData((prev) => ({ ...prev, city: undefined }));
                        }
                    }
                } catch (error) {
                    console.error("Error loading cities:", error);
                    setAvailableCities([]);
                } finally {
                    setIsLoadingCities(false);
                }
            } else {
                setAvailableCities([]);
            }
        };

        loadCities();
    }, [formData.region_state]);

    // ─── Handle input changes ────────────────────────────────────────────
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ─── Handle form submit ──────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveStatus("loading");
        setErrorMessage("");

        try {
            await updateAcademyProfile(id, {
                legal_name: formData.legal_name,
                institution_type: formData.institution_type,
                registration_id: formData.registration_id,
                contact_person_name: formData.contact_person_name,
                contact_person_email: formData.contact_person_email,
                contact_academy_email: formData.contact_academy_email,
                website: formData.website,
                country: formData.country,
                region_state: formData.region_state,
                city: formData.city,
            });
            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch (error: any) {
            console.error("Error updating profile:", error);
            setSaveStatus("error");
            setErrorMessage(error?.message || "Error al actualizar el perfil");
            setTimeout(() => setSaveStatus("idle"), 5000);
        }
    };

    const canSubmit = formData.legal_name.trim() && formData.contact_academy_email.trim() && saveStatus !== "loading";

    // ─── Loading state ───────────────────────────────────────────────────
    if (isLoadingProfile) {
        return (
            <main className="relative min-h-screen w-full bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-[url('/img/bg-waves-3.svg')] bg-cover bg-center opacity-10 dark:opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white dark:from-neutral-950/60 dark:to-neutral-950" />
                </div>
                <div className="container mx-auto max-w-6xl px-4 lg:px-0 py-16 md:py-20 flex items-center justify-center">
                    <div className="flex items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                        <p className="text-lg">Cargando perfil...</p>
                    </div>
                </div>
            </main>
        );
    }

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
                    variants={slideInFromBottom({ delay: 0.05 })}
                >
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="p-5 rounded-full border-2 bg-gradient-to-br from-sky-500/20 to-sky-500/10 border-sky-500/30">
                            <Building2 className="h-10 w-10 text-sky-500 dark:text-sky-400" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3">
                        Perfil de <span className="text-sky-500 dark:text-sky-400">Academia</span>
                    </h1>
                    <p className="text-base md:text-lg lg:text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
                        Completa y actualiza la información de tu institución académica.
                    </p>
                </motion.div>

                {/* Status Card */}
                {formData.stacks_address && (
                    <motion.div
                        className="mb-8"
                        initial="offScreen"
                        whileInView="onScreen"
                        viewport={{ once: true, amount: 0.4 }}
                        variants={slideInFromBottom({ delay: 0.1 })}
                    >
                        <div className="rounded-2xl border backdrop-blur-xl p-6 bg-white/80 border-neutral-200 dark:bg-neutral-900/70 dark:border-neutral-800">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Estado de Validación</p>
                                    <div className="flex items-center gap-2">
                                        {formData.validation_status === "approved" ? (
                                            <>
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                <p className="font-bold text-green-600 dark:text-green-400">Aprobada</p>
                                            </>
                                        ) : formData.validation_status === "rejected" ? (
                                            <>
                                                <XCircle className="h-5 w-5 text-red-500" />
                                                <p className="font-bold text-red-600 dark:text-red-400">Rechazada</p>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="h-5 w-5 text-orange-500" />
                                                <p className="font-bold text-orange-600 dark:text-orange-400">Pendiente</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Créditos Disponibles</p>
                                    <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{formData.credits}</p>
                                </div>
                                <div className="p-4 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Dirección de Stacks</p>
                                    <p className="text-xs font-mono break-all text-neutral-900 dark:text-neutral-100">
                                        {formData.stacks_address}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Formulario */}
                <motion.div
                    initial="offScreen"
                    whileInView="onScreen"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={slideInFromBottom({ delay: 0.15 })}
                >
                    <Card className="rounded-2xl border backdrop-blur-xl shadow-2xl bg-white/80 border-neutral-200 dark:bg-neutral-900/70 dark:border-neutral-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <div className="p-2 rounded-lg bg-sky-500/10">
                                    <School className="h-6 w-6 text-sky-500 dark:text-sky-400" />
                                </div>
                                Información de la Academia
                            </CardTitle>
                            <CardDescription className="text-base">
                                Los campos marcados con * son obligatorios para el registro completo.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Información Legal */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                                        Información Legal
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="legal_name" className="font-semibold">
                                                Nombre Legal de la Institución *
                                            </Label>
                                            <Input
                                                id="legal_name"
                                                name="legal_name"
                                                placeholder="Universidad Nacional de..."
                                                value={formData.legal_name}
                                                onChange={handleChange}
                                                required
                                                className="bg-white text-neutral-900 border-2 border-neutral-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="institution_type" className="font-semibold">
                                                Tipo de Institución
                                            </Label>
                                            <Input
                                                id="institution_type"
                                                name="institution_type"
                                                placeholder="Universidad, Instituto, Bootcamp..."
                                                value={formData.institution_type}
                                                onChange={handleChange}
                                                className="bg-white text-neutral-900 border-2 border-neutral-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="registration_id" className="font-semibold">
                                                ID de Registro / RUC
                                            </Label>
                                            <Input
                                                id="registration_id"
                                                name="registration_id"
                                                placeholder="20123456789"
                                                value={formData.registration_id}
                                                onChange={handleChange}
                                                className="bg-white text-neutral-900 border-2 border-neutral-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="website" className="font-semibold flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                                                Sitio Web
                                            </Label>
                                            <Input
                                                id="website"
                                                name="website"
                                                type="url"
                                                placeholder="https://www.ejemplo.edu"
                                                value={formData.website}
                                                onChange={handleChange}
                                                className="bg-white text-neutral-900 border-2 border-neutral-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Información de Contacto */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <User className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                                        Información de Contacto
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="contact_person_name" className="font-semibold">
                                                Nombre del Responsable
                                            </Label>
                                            <Input
                                                id="contact_person_name"
                                                name="contact_person_name"
                                                placeholder="Juan Pérez"
                                                value={formData.contact_person_name}
                                                onChange={handleChange}
                                                className="bg-white text-neutral-900 border-2 border-neutral-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="contact_person_email" className="font-semibold flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                                                Email del Responsable
                                            </Label>
                                            <Input
                                                id="contact_person_email"
                                                name="contact_person_email"
                                                type="email"
                                                placeholder="responsable@ejemplo.edu"
                                                value={formData.contact_person_email}
                                                onChange={handleChange}
                                                className="bg-white text-neutral-900 border-2 border-neutral-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="contact_academy_email" className="font-semibold flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                                                Email Institucional *
                                            </Label>
                                            <Input
                                                id="contact_academy_email"
                                                name="contact_academy_email"
                                                type="email"
                                                placeholder="contacto@ejemplo.edu"
                                                value={formData.contact_academy_email}
                                                onChange={handleChange}
                                                required
                                                className="bg-white text-neutral-900 border-2 border-neutral-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Ubicación */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                                        Ubicación
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label className="font-semibold">País</Label>
                                            <Combobox
                                                options={countriesData.countries.map((country) => ({
                                                    value: String(country.id),
                                                    label: country.name,
                                                }))}
                                                value={formData.country ? String(formData.country) : ""}
                                                onValueChange={(value) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        country: value ? Number(value) : undefined,
                                                        region_state: undefined,
                                                        city: undefined,
                                                    }))
                                                }
                                                placeholder="Seleccionar país"
                                                searchPlaceholder="Buscar país..."
                                                emptyText="No se encontró el país"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="font-semibold">Estado / Región</Label>
                                            <Combobox
                                                options={availableStates.map((state) => ({
                                                    value: String(state.id),
                                                    label: state.name,
                                                }))}
                                                value={formData.region_state ? String(formData.region_state) : ""}
                                                onValueChange={(value) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        region_state: value ? Number(value) : undefined,
                                                        city: undefined,
                                                    }))
                                                }
                                                placeholder="Seleccionar estado"
                                                searchPlaceholder="Buscar estado..."
                                                emptyText="No se encontró el estado"
                                                disabled={!formData.country || availableStates.length === 0}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="font-semibold">Ciudad</Label>
                                            <Combobox
                                                options={availableCities.map((city) => ({
                                                    value: String(city.id),
                                                    label: city.name,
                                                }))}
                                                value={formData.city ? String(formData.city) : ""}
                                                onValueChange={(value) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        city: value ? Number(value) : undefined,
                                                    }))
                                                }
                                                placeholder={isLoadingCities ? "Cargando..." : "Seleccionar ciudad"}
                                                searchPlaceholder="Buscar ciudad..."
                                                emptyText="No se encontró la ciudad"
                                                disabled={!formData.region_state || isLoadingCities || availableCities.length === 0}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={!canSubmit}
                                        className="w-full font-bold text-white py-6 bg-sky-500 hover:bg-sky-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                                    >
                                        {saveStatus === "loading" ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Guardando...
                                            </>
                                        ) : saveStatus === "success" ? (
                                            <>
                                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                                Guardado Exitosamente
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-5 w-5" />
                                                Guardar Cambios
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Error Message */}
                {saveStatus === "error" && errorMessage && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                        <Card className="rounded-2xl border shadow-xl bg-gradient-to-br from-red-50 to-red-100 border-red-300 dark:from-red-950/50 dark:to-red-900/30 dark:border-red-800/60">
                            <CardContent className="pt-6 pb-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-red-500/20">
                                        <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="mb-1 text-xl font-bold text-red-900 dark:text-red-100">Error al guardar</h3>
                                        <p className="text-red-800 dark:text-red-200">{errorMessage}</p>
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
