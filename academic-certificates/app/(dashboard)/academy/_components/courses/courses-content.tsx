"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { Course } from "@/types/course";
import {
    toggleCourseStatus,
    deleteCourse,
} from "@/app/actions/academy/courses";
import { getCoursesByAcademy } from "@/app/actions/academy/courses";
import {
    BookOpen,
    Plus,
    Search,
    Clock,
    Award,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CourseDialog } from "./course-dialog";
import { CoursesTable } from "./courses-table";

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const COURSES_CACHE_TTL = 60 * 1000;

interface CoursesContentProps {
    academyId: string;
}

export function CoursesContent({ academyId }: CoursesContentProps) {
    const { t } = useTranslation();
    const [courses, setCourses] = React.useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = React.useState<Course[]>([]);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [filterStatus, setFilterStatus] = React.useState<"all" | "active" | "inactive">("all");
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(25);
    const [sortField, setSortField] = React.useState<keyof Course | null>("created_at");
    const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");

    // Dialog states
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);

    const cacheKey = React.useMemo(() => `academy:courses:${academyId}`, [academyId]);

    const readCoursesCache = React.useCallback(() => {
        if (typeof window === "undefined") return null;
        const raw = window.sessionStorage.getItem(cacheKey);
        if (!raw) return null;
        try {
            const parsed = JSON.parse(raw) as { courses: Course[]; ts: number };
            if (Date.now() - parsed.ts > COURSES_CACHE_TTL) return null;
            return parsed.courses;
        } catch {
            return null;
        }
    }, [cacheKey]);

    const writeCoursesCache = React.useCallback(
        (data: Course[]) => {
            if (typeof window === "undefined") return;
            window.sessionStorage.setItem(
                cacheKey,
                JSON.stringify({ courses: data, ts: Date.now() })
            );
        },
        [cacheKey]
    );

    const loadCourses = React.useCallback(async (options?: { background?: boolean }) => {
        const background = options?.background ?? false;
        try {
            if (!background) setIsLoading(true);
            setError("");
            const data = await getCoursesByAcademy(academyId);
            setCourses(data);
            setFilteredCourses(data);
            writeCoursesCache(data);
        } catch (err: any) {
            setError(err.message || t("academy.courses.errorLoading"));
        } finally {
            if (!background) setIsLoading(false);
        }
    }, [academyId, t, writeCoursesCache]);

    React.useEffect(() => {
        const cachedCourses = readCoursesCache();
        if (cachedCourses) {
            setCourses(cachedCourses);
            setFilteredCourses(cachedCourses);
            setIsLoading(false);
            loadCourses({ background: true });
            return;
        }
        loadCourses();
    }, [loadCourses, readCoursesCache]);

    // Filter courses
    React.useEffect(() => {
        let filtered = courses;

        if (searchTerm) {
            filtered = filtered.filter(
                (course) =>
                    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    course.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    course.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterStatus !== "all") {
            filtered = filtered.filter((course) =>
                filterStatus === "active" ? course.is_active : !course.is_active
            );
        }

        // Sorting
        if (sortField) {
            filtered = [...filtered].sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];

                if (sortField === "created_at") {
                    aVal = new Date(a.created_at).getTime() as any;
                    bVal = new Date(b.created_at).getTime() as any;
                }

                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

                if (sortDirection === "asc") {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }

        setFilteredCourses(filtered);
    }, [searchTerm, filterStatus, courses, sortField, sortDirection]);

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, itemsPerPage]);

    // Pagination
    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const paginatedCourses = React.useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredCourses.slice(start, end);
    }, [filteredCourses, currentPage, itemsPerPage]);

    const handleAddCourse = () => {
        setSelectedCourse(null);
        setDialogOpen(true);
    };

    const handleEditCourse = (course: Course) => {
        setSelectedCourse(course);
        setDialogOpen(true);
    };

    const handleToggleStatus = async (course: Course) => {
        try {
            await toggleCourseStatus(course.id_course);
            await loadCourses({ background: true });
        } catch (err: any) {
            setError(err.message || t("academy.courses.errorLoading"));
        }
    };

    const handleDeleteCourse = async (course: Course) => {
        try {
            await deleteCourse(course.id_course);
            await loadCourses({ background: true });
        } catch (err: any) {
            setError(err.message || t("academy.courses.errorLoading"));
        }
    };

    const handleSort = (field: keyof Course) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    const stats = {
        total: courses.length,
        active: courses.filter((c) => c.is_active).length,
        inactive: courses.filter((c) => !c.is_active).length,
        totalHours: courses.reduce((sum, c) => sum + (c.hours || 0), 0),
    };

    return (
        <div className="space-y-6">

            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/10">
                            <BookOpen className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">
                            {t("academy.courses.title")}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {t("academy.courses.titleHighlight")}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {t("academy.courses.description")}
                    </p>
                </div>
                <Button onClick={handleAddCourse} size="sm" className="gap-1.5 self-start sm:self-auto bg-sky-600 hover:bg-sky-700 text-white">
                    <Plus className="h-3.5 w-3.5" />
                    {t("academy.courses.addCourse")}
                </Button>
            </div>

            {/* ── Stat cards ──────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {/* Total */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-sky-500" />
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{t("academy.courses.stats.total")}</p>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{stats.total}</p>
                        <BookOpen className="h-5 w-5 text-sky-400 dark:text-sky-500 mb-0.5" />
                    </div>
                </div>
                {/* Active */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500" />
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{t("academy.courses.stats.active")}</p>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{stats.active}</p>
                        <Award className="h-5 w-5 text-emerald-500 mb-0.5" />
                    </div>
                </div>
                {/* Inactive */}
                <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-amber-500" />
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{t("academy.courses.stats.inactive")}</p>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{stats.inactive}</p>
                        <AlertCircle className="h-5 w-5 text-amber-500 mb-0.5" />
                    </div>
                </div>
                {/* Hours */}
                <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-500/20 dark:bg-violet-500/10">
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-violet-500" />
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{t("academy.courses.stats.totalHours")}</p>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold tabular-nums text-violet-600 dark:text-violet-400">{stats.totalHours}</p>
                        <Clock className="h-5 w-5 text-violet-500 mb-0.5" />
                    </div>
                </div>
            </div>

            {/* ── Toolbar ─────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                        placeholder={t("academy.courses.filters.search")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm"
                    />
                </div>
                <div className="flex gap-1.5">
                    {(["all", "active", "inactive"] as const).map((status) => (
                        <button
                            key={status}
                            type="button"
                            onClick={() => setFilterStatus(status)}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                                filterStatus === status
                                    ? "bg-sky-600 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            }`}
                        >
                            {t(`academy.courses.filters.${status}`)}
                        </button>
                    ))}
                </div>
                {filteredCourses.length > 0 && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {t("academy.courses.results", { count: filteredCourses.length })}
                    </span>
                )}
            </div>

            {/* ── Error ───────────────────────────────────────────────── */}
            {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs dark:border-red-800/50 dark:bg-red-950/30">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" />
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
            )}

            {/* ── Loading ─────────────────────────────────────────────── */}
            {isLoading && (
                <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400">
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-sky-500 mr-3" />
                    <span className="text-sm">{t("academy.courses.table.loading")}</span>
                </div>
            )}

            {/* ── Empty state ─────────────────────────────────────────── */}
            {!isLoading && filteredCourses.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
                        <BookOpen className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                        {t("academy.courses.table.noCourses")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                        {searchTerm || filterStatus !== "all"
                            ? t("academy.courses.filters.search")
                            : t("academy.courses.table.noCoursesDescription")}
                    </p>
                    {!searchTerm && filterStatus === "all" && (
                        <Button onClick={handleAddCourse} size="sm" className="gap-1.5 bg-sky-600 hover:bg-sky-700 text-white">
                            <Plus className="h-3.5 w-3.5" />
                            {t("academy.courses.addCourse")}
                        </Button>
                    )}
                </div>
            )}

            {/* ── Table card ──────────────────────────────────────────── */}
            {!isLoading && filteredCourses.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="h-0.5 w-full bg-sky-500" />
                    <div className="p-0">
                        <CoursesTable
                            courses={paginatedCourses}
                            onEdit={handleEditCourse}
                            onToggleStatus={handleToggleStatus}
                            onDelete={handleDeleteCourse}
                            loading={isLoading}
                            sortField={sortField}
                            sortDirection={sortDirection}
                            onSort={handleSort}
                        />

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="items-per-page" className="text-xs text-slate-500 dark:text-slate-400">
                                        {t("academy.courses.pagination.itemsPerPage")}
                                    </Label>
                                    <Select
                                        value={itemsPerPage.toString()}
                                        onValueChange={(val) => setItemsPerPage(parseInt(val))}
                                    >
                                        <SelectTrigger id="items-per-page" className="h-7 w-16 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                                                <SelectItem key={option} value={option.toString()} className="text-xs">
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredCourses.length)} {t("academy.courses.pagination.of")} {filteredCourses.length}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                    </Button>
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 px-1">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Course Dialog */}
            <CourseDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                academyId={academyId}
                course={selectedCourse}
                onSuccess={() => loadCourses({ background: true })}
            />
        </div>
    );
}
