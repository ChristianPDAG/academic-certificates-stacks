"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { getAcademyProfile, updateAcademyProfile } from "@/app/actions/academy/profile";
import { getCitiesByState } from "@/app/actions/utils/nations";
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
    Mail,
    User,
    Globe,
    FileText,
    AlertCircle,
    MapPin,
} from "lucide-react";

type SaveStatus = "idle" | "loading" | "success" | "error";
const PROFILE_CACHE_TTL = 2 * 60 * 1000;
const CITIES_CACHE_TTL = 5 * 60 * 1000;

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
    const { t } = useTranslation();
    const profileCacheKey = `academy:profile:${id}`;
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

    const readProfileCache = useCallback(() => {
        if (typeof window === "undefined") return null;
        const raw = window.sessionStorage.getItem(profileCacheKey);
        if (!raw) return null;
        try {
            const parsed = JSON.parse(raw) as { data: AcademyData; ts: number };
            if (Date.now() - parsed.ts > PROFILE_CACHE_TTL) return null;
            return parsed.data;
        } catch {
            return null;
        }
    }, [profileCacheKey]);

    const writeProfileCache = useCallback(
        (data: AcademyData) => {
            if (typeof window === "undefined") return;
            window.sessionStorage.setItem(
                profileCacheKey,
                JSON.stringify({ data, ts: Date.now() })
            );
        },
        [profileCacheKey]
    );

    const readCitiesCache = useCallback((stateId: number) => {
        if (typeof window === "undefined") return null;
        const raw = window.sessionStorage.getItem(`academy:cities:${stateId}`);
        if (!raw) return null;
        try {
            const parsed = JSON.parse(raw) as { data: Array<{ id: number; name: string }>; ts: number };
            if (Date.now() - parsed.ts > CITIES_CACHE_TTL) return null;
            return parsed.data;
        } catch {
            return null;
        }
    }, []);

    const writeCitiesCache = useCallback(
        (stateId: number, cities: Array<{ id: number; name: string }>) => {
            if (typeof window === "undefined") return;
            window.sessionStorage.setItem(
                `academy:cities:${stateId}`,
                JSON.stringify({ data: cities, ts: Date.now() })
            );
        },
        []
    );

    // ─── Load academy profile ────────────────────────────────────────────
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const cachedProfile = readProfileCache();
                if (cachedProfile) {
                    setFormData(cachedProfile);
                    if (cachedProfile.country) {
                        const filteredStates = statesData.states.filter(
                            (state) => state.id_country === cachedProfile.country
                        );
                        setAvailableStates(filteredStates);
                    }
                    if (cachedProfile.region_state) {
                        const cachedCities = readCitiesCache(cachedProfile.region_state);
                        if (cachedCities) {
                            setAvailableCities(cachedCities);
                        }
                    }
                    setIsLoadingProfile(false);
                } else {
                    setIsLoadingProfile(true);
                }

                const profile = await getAcademyProfile(id);
                if (profile) {
                    const normalizedProfile: AcademyData = {
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
                    };
                    setFormData(normalizedProfile);
                    writeProfileCache(normalizedProfile);

                    // Load states if country is set
                    if (profile.country) {
                        const filteredStates = statesData.states.filter((state) => state.id_country === profile.country);
                        setAvailableStates(filteredStates);
                    }

                    // Load cities if state is set
                    if (profile.region_state) {
                        const cachedCities = readCitiesCache(profile.region_state);
                        const cities = cachedCities || (await getCitiesByState(profile.region_state));
                        setAvailableCities(cities);
                        if (!cachedCities) {
                            writeCitiesCache(profile.region_state, cities);
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading profile:", error);
                setErrorMessage(t("academy.profile.errorLoadingProfile"));
            } finally {
                setIsLoadingProfile(false);
            }
        };

        loadProfile();
    }, [id, t, readProfileCache, writeProfileCache, readCitiesCache, writeCitiesCache]);

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
                    const cachedCities = readCitiesCache(formData.region_state);
                    if (cachedCities) {
                        setAvailableCities(cachedCities);
                        setIsLoadingCities(false);
                        return;
                    }
                    setIsLoadingCities(true);
                    const cities = await getCitiesByState(formData.region_state);
                    setAvailableCities(cities);
                    writeCitiesCache(formData.region_state, cities);

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
    }, [formData.region_state, formData.city, readCitiesCache, writeCitiesCache]);

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
            writeProfileCache(formData);
            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch (error: any) {
            console.error("Error updating profile:", error);
            setSaveStatus("error");
            setErrorMessage(error?.message || t("academy.profile.errorSavingProfile"));
            setTimeout(() => setSaveStatus("idle"), 5000);
        }
    };

    const canSubmit = formData.legal_name.trim() && formData.contact_academy_email.trim() && saveStatus !== "loading";

    // ─── Loading state ───────────────────────────────────────────────────
    if (isLoadingProfile) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
                    <p className="text-sm">{t("academy.profile.loading")}</p>
                </div>
            </div>
        );
    }

    // ─── UI ──────────────────────────────────────────────────────────────
    return (
        <div className="space-y-8">

            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/10">
                            <Building2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">
                            {t("academy.profile.title")}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {t("academy.profile.titleHighlight")}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {t("academy.profile.description")}
                    </p>
                </div>
            </div>

            {/* ── Status cards ────────────────────────────────────────── */}
            {formData.stacks_address && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Validation */}
                    <div className={`relative overflow-hidden rounded-2xl border p-5 ${
                        formData.validation_status === "approved"
                            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                            : formData.validation_status === "rejected"
                                ? "bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20"
                                : "bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20"
                    }`}>
                        <div className={`absolute inset-x-0 top-0 h-0.5 ${
                            formData.validation_status === "approved" ? "bg-emerald-500"
                            : formData.validation_status === "rejected" ? "bg-red-500"
                            : "bg-amber-500"
                        }`} />
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                            {t("academy.profile.validationStatus")}
                        </p>
                        <div className="flex items-center gap-2">
                            {formData.validation_status === "approved" ? (
                                <>
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                        {t("academy.profile.validationApproved")}
                                    </span>
                                </>
                            ) : formData.validation_status === "rejected" ? (
                                <>
                                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    <span className="font-semibold text-red-700 dark:text-red-400">
                                        {t("academy.profile.validationRejected")}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                                        {t("academy.profile.validationPending")}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Credits */}
                    <div className="relative overflow-hidden rounded-2xl border p-5 bg-sky-50 border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/20">
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-sky-500" />
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                            {t("academy.profile.credits")}
                        </p>
                        <p className="text-3xl font-bold tabular-nums text-sky-600 dark:text-sky-400">
                            {formData.credits}
                        </p>
                    </div>

                    {/* Stacks address */}
                    <div className="relative overflow-hidden rounded-2xl border p-5 bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-slate-400 dark:bg-slate-600" />
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                            {t("academy.profile.stacksAddress")}
                        </p>
                        <p className="truncate font-mono text-xs text-slate-800 dark:text-slate-200">
                            {formData.stacks_address}
                        </p>
                    </div>
                </div>
            )}

            {/* ── Form card ───────────────────────────────────────────── */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="h-0.5 w-full bg-sky-500" />

                <form onSubmit={handleSubmit} className="divide-y divide-slate-100 dark:divide-slate-800">

                    {/* Sección: Información institucional */}
                    <div className="px-5 py-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-500/10">
                                <FileText className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                {t("academy.profile.institutionalInfo")}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="legal_name" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                    {t("academy.profile.legalNameRequired")}
                                </Label>
                                <Input
                                    id="legal_name" name="legal_name" required
                                    placeholder={t("academy.profile.legalNamePlaceholder")}
                                    value={formData.legal_name}
                                    onChange={handleChange}
                                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="institution_type" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                    {t("academy.profile.institutionType")}
                                </Label>
                                <Input
                                    id="institution_type" name="institution_type"
                                    placeholder={t("academy.profile.institutionTypePlaceholder")}
                                    value={formData.institution_type}
                                    onChange={handleChange}
                                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="registration_id" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                    {t("academy.profile.registrationId")}
                                </Label>
                                <Input
                                    id="registration_id" name="registration_id"
                                    placeholder={t("academy.profile.registrationIdPlaceholder")}
                                    value={formData.registration_id}
                                    onChange={handleChange}
                                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="website" className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Globe className="h-3.5 w-3.5 text-sky-500" />
                                    {t("academy.profile.website")}
                                </Label>
                                <Input
                                    id="website" name="website" type="url"
                                    placeholder={t("academy.profile.websitePlaceholder")}
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección: Contacto */}
                    <div className="px-5 py-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-500/10">
                                <User className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                {t("academy.profile.contactInfo")}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="contact_person_name" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                    {t("academy.profile.contactPersonName")}
                                </Label>
                                <Input
                                    id="contact_person_name" name="contact_person_name"
                                    placeholder={t("academy.profile.contactPersonNamePlaceholder")}
                                    value={formData.contact_person_name}
                                    onChange={handleChange}
                                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="contact_person_email" className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5 text-sky-500" />
                                    {t("academy.profile.contactPersonEmail")}
                                </Label>
                                <Input
                                    id="contact_person_email" name="contact_person_email" type="email"
                                    placeholder={t("academy.profile.contactPersonEmailPlaceholder")}
                                    value={formData.contact_person_email}
                                    onChange={handleChange}
                                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="contact_academy_email" className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5 text-sky-500" />
                                    {t("academy.profile.academyEmailRequired")}
                                </Label>
                                <Input
                                    id="contact_academy_email" name="contact_academy_email" type="email" required
                                    placeholder={t("academy.profile.academyEmailPlaceholder")}
                                    value={formData.contact_academy_email}
                                    onChange={handleChange}
                                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección: Ubicación */}
                    <div className="px-5 py-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-500/10">
                                <MapPin className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                {t("academy.profile.locationInfo")}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                    {t("academy.profile.country")}
                                </Label>
                                <Combobox
                                    options={countriesData.countries.map((c) => ({ value: String(c.id), label: c.name }))}
                                    value={formData.country ? String(formData.country) : ""}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, country: value ? Number(value) : undefined, region_state: undefined, city: undefined }))}
                                    placeholder={t("academy.profile.selectCountry")}
                                    searchPlaceholder={t("academy.profile.searchCountry")}
                                    emptyText={t("academy.profile.countryNotFound")}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                    {t("academy.profile.state")}
                                </Label>
                                <Combobox
                                    options={availableStates.map((s) => ({ value: String(s.id), label: s.name }))}
                                    value={formData.region_state ? String(formData.region_state) : ""}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, region_state: value ? Number(value) : undefined, city: undefined }))}
                                    placeholder={t("academy.profile.selectState")}
                                    searchPlaceholder={t("academy.profile.searchState")}
                                    emptyText={t("academy.profile.stateNotFound")}
                                    disabled={!formData.country || availableStates.length === 0}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                    {t("academy.profile.city")}
                                </Label>
                                <Combobox
                                    options={availableCities.map((c) => ({ value: String(c.id), label: c.name }))}
                                    value={formData.city ? String(formData.city) : ""}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, city: value ? Number(value) : undefined }))}
                                    placeholder={isLoadingCities ? t("academy.profile.loadingCities") : t("academy.profile.selectCity")}
                                    searchPlaceholder={t("academy.profile.searchCity")}
                                    emptyText={t("academy.profile.cityNotFound")}
                                    disabled={!formData.region_state || isLoadingCities || availableCities.length === 0}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección: Submit */}
                    <div className="px-5 py-4 flex flex-col gap-3">
                        {/* Error inline */}
                        {saveStatus === "error" && errorMessage && (
                            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs dark:border-red-800/50 dark:bg-red-950/30">
                                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" />
                                <p className="text-red-700 dark:text-red-300">{errorMessage}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={!canSubmit}
                            size="sm"
                            className="self-end gap-1.5 bg-sky-600 hover:bg-sky-700 text-white"
                        >
                            {saveStatus === "loading" ? (
                                <><Loader2 className="h-3.5 w-3.5 animate-spin" />{t("academy.profile.savingProfile")}</>
                            ) : saveStatus === "success" ? (
                                <><CheckCircle2 className="h-3.5 w-3.5" />{t("academy.profile.profileSaved")}</>
                            ) : (
                                <><Save className="h-3.5 w-3.5" />{t("academy.profile.saveChanges")}</>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

        </div>
    );
}
