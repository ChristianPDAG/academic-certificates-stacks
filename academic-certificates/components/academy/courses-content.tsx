"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Course } from "@/types/course";
import {
    toggleCourseStatus,
    deleteCourse,
} from "@/app/actions/academy/courses";
import { getCoursesByAcademy } from "@/app/actions/academy/courses";
import { slideInFromBottom } from "@/utils/motion";
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
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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

    const loadCourses = React.useCallback(async () => {
        try {
            setIsLoading(true);
            setError("");
            const data = await getCoursesByAcademy(academyId);
            setCourses(data);
            setFilteredCourses(data);
        } catch (err: any) {
            setError(err.message || t("academy.courses.errorLoading"));
        } finally {
            setIsLoading(false);
        }
    }, [academyId]);

    React.useEffect(() => {
        loadCourses();
    }, [loadCourses]);

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
            await loadCourses();
        } catch (err: any) {
            setError(err.message || "Error al cambiar el estado del curso");
        }
    };

    const handleDeleteCourse = async (course: Course) => {
        try {
            await deleteCourse(course.id_course);
            await loadCourses();
        } catch (err: any) {
            setError(err.message || "Error al eliminar el curso");
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
        <main className="relative min-h-screen w-full bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[url('/img/bg-waves-3.svg')] bg-cover bg-center opacity-10 dark:opacity-20" />
            </div>

            <div className="container mx-auto max-w-7xl px-4 lg:px-0 py-16 md:py-20">
                {/* Header */}
                <motion.div
                    initial="offScreen"
                    whileInView="onScreen"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={slideInFromBottom({ delay: 0.05 })}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                {t("academy.courses.title")} <span className="text-sky-500">{t("academy.courses.titleHighlight")}</span>
                            </h1>
                            <p className="text-muted-foreground">
                                {t("academy.courses.description")}
                            </p>
                        </div>
                        <Button onClick={handleAddCourse} size="lg">
                            <Plus className="mr-2 h-5 w-5" />
                            {t("academy.courses.addCourse")}
                        </Button>
                    </div>
                </motion.div>

                {/* Statistics */}
                <motion.div
                    initial="offScreen"
                    whileInView="onScreen"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={slideInFromBottom({ delay: 0.1 })}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t("academy.courses.stats.total")}</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t("academy.courses.stats.active")}</CardTitle>
                            <Award className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {stats.active}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t("academy.courses.stats.inactive")}</CardTitle>
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">
                                {stats.inactive}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t("academy.courses.stats.totalHours")}</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalHours}</div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Search and Filter */}
                <motion.div
                    initial="offScreen"
                    whileInView="onScreen"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={slideInFromBottom({ delay: 0.15 })}
                    className="mb-6 flex flex-col md:flex-row gap-4"
                >
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t("academy.courses.filters.search")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant={filterStatus === "all" ? "default" : "outline"}
                            onClick={() => setFilterStatus("all")}
                            size="sm"
                        >
                            {t("academy.courses.filters.all")}
                        </Button>
                        <Button
                            variant={filterStatus === "active" ? "default" : "outline"}
                            onClick={() => setFilterStatus("active")}
                            size="sm"
                        >
                            {t("academy.courses.filters.active")}
                        </Button>
                        <Button
                            variant={filterStatus === "inactive" ? "default" : "outline"}
                            onClick={() => setFilterStatus("inactive")}
                            size="sm"
                        >
                            {t("academy.courses.filters.inactive")}
                        </Button>
                    </div>
                </motion.div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial="offScreen"
                        whileInView="onScreen"
                        viewport={{ once: true, amount: 0.4 }}
                        variants={slideInFromBottom({ delay: 0.2 })}
                        className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-400"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Empty State */}
                {!isLoading && filteredCourses.length === 0 && (
                    <motion.div
                        initial="offScreen"
                        whileInView="onScreen"
                        viewport={{ once: true, amount: 0.4 }}
                        variants={slideInFromBottom({ delay: 0.2 })}
                        className="text-center py-12"
                    >
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            {searchTerm || filterStatus !== "all"
                                ? t("academy.courses.table.noCourses")
                                : t("academy.courses.table.noCourses")}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {searchTerm || filterStatus !== "all"
                                ? t("academy.courses.filters.search")
                                : t("academy.courses.table.noCoursesDescription")}
                        </p>
                        {!searchTerm && filterStatus === "all" && (
                            <Button onClick={handleAddCourse}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t("academy.courses.addCourse")}
                            </Button>
                        )}
                    </motion.div>
                )}

                {/* Courses Table */}
                {!isLoading && filteredCourses.length > 0 && (
                    <motion.div
                        initial="offScreen"
                        whileInView="onScreen"
                        viewport={{ once: true, amount: 0.4 }}
                        variants={slideInFromBottom({ delay: 0.2 })}
                    >
                        <Card>
                            <CardContent className="pt-6">
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
                                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="items-per-page" className="text-sm">
                                                {t("academy.courses.pagination.itemsPerPage")}
                                            </Label>
                                            <Select
                                                value={itemsPerPage.toString()}
                                                onValueChange={(val) => setItemsPerPage(parseInt(val))}
                                            >
                                                <SelectTrigger id="items-per-page" className="w-20">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                                                        <SelectItem key={option} value={option.toString()}>
                                                            {option}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                                {t("academy.courses.pagination.showing")} {(currentPage - 1) * itemsPerPage + 1} {t("academy.courses.pagination.to")}{" "}
                                                {Math.min(currentPage * itemsPerPage, filteredCourses.length)} {t("academy.courses.pagination.of")}{" "}
                                                {filteredCourses.length}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <span className="text-sm font-medium">
                                                Página {currentPage} {t("academy.courses.pagination.of")} {totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>

            {/* Course Dialog */}
            <CourseDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                academyId={academyId}
                course={selectedCourse}
                onSuccess={loadCourses}
            />
        </main>
    );
}
