"use client";

import { useTranslation } from "react-i18next";
import { Course } from "@/types/course";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Edit,
    Trash2,
    MoreVertical,
    Clock,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Power,
    PowerOff,
} from "lucide-react";
import { useState } from "react";

interface CoursesTableProps {
    courses: Course[];
    onEdit: (course: Course) => void;
    onToggleStatus: (course: Course) => void;
    onDelete: (course: Course) => void;
    loading: boolean;
    sortField: keyof Course | null;
    sortDirection: "asc" | "desc";
    onSort: (field: keyof Course) => void;
}

export function CoursesTable({
    courses,
    onEdit,
    onToggleStatus,
    onDelete,
    loading,
    sortField,
    sortDirection,
    onSort,
}: CoursesTableProps) {
    const { t } = useTranslation();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

    const handleDeleteClick = (course: Course) => {
        setCourseToDelete(course);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (courseToDelete) {
            onDelete(courseToDelete);
            setDeleteDialogOpen(false);
            setCourseToDelete(null);
        }
    };

    const SortIcon = ({ field }: { field: keyof Course }) => {
        if (sortField !== field) {
            return <ChevronsUpDown className="h-4 w-4 text-neutral-400" />;
        }
        return sortDirection === "asc" ? (
            <ChevronUp className="h-4 w-4 text-sky-500" />
        ) : (
            <ChevronDown className="h-4 w-4 text-sky-500" />
        );
    };

    const SortableHeader = ({ field, children }: { field: keyof Course; children: React.ReactNode }) => (
        <th
            className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            onClick={() => onSort(field)}
        >
            <div className="flex items-center gap-2">
                {children}
                <SortIcon field={field} />
            </div>
        </th>
    );

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge className="bg-green-500 hover:bg-green-600 text-white">{t("academy.courses.table.active")}</Badge>
        ) : (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white">{t("academy.courses.table.inactive")}</Badge>
        );
    };

    return (
        <>
            <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                    <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                        <tr>
                            <SortableHeader field="title">{t("academy.courses.table.course")}</SortableHeader>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                                {t("academy.courses.table.category")}
                            </th>
                            <SortableHeader field="instructor_name">{t("academy.courses.table.instructor")}</SortableHeader>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                                {t("academy.courses.table.details")}
                            </th>
                            <SortableHeader field="is_active">{t("academy.courses.table.status")}</SortableHeader>
                            <SortableHeader field="created_at">{t("academy.courses.table.createdAt")}</SortableHeader>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                                {t("academy.courses.table.actions")}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-neutral-950 divide-y divide-neutral-200 dark:divide-neutral-800">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-sky-500" />
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            {t("academy.courses.table.loading")}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ) : courses.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                                    {t("academy.courses.table.noCourses")}
                                </td>
                            </tr>
                        ) : (
                            courses.map((course) => (
                                <tr
                                    key={course.id_course}
                                    className="hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors"
                                >
                                    {/* Título y descripción */}
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                                {course.title}
                                            </span>
                                            {course.description && (
                                                <span className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 max-w-xs">
                                                    {course.description}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Categoría */}
                                    <td className="px-4 py-3">
                                        {course.category ? (
                                            <Badge variant="outline" className="text-xs">
                                                {course.category}
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-neutral-400">N/A</span>
                                        )}
                                    </td>

                                    {/* Instructor */}
                                    <td className="px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100">
                                        {course.instructor_name || (
                                            <span className="text-neutral-400">N/A</span>
                                        )}
                                    </td>

                                    {/* Detalles (horas, modalidad, skills) */}
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                                                {course.hours && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {course.hours}h
                                                    </div>
                                                )}
                                                {course.modality && (
                                                    <span className="text-xs">{course.modality}</span>
                                                )}
                                            </div>
                                            {course.skills && course.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {course.skills.slice(0, 2).map((skill) => (
                                                        <Badge
                                                            key={skill}
                                                            variant="secondary"
                                                            className="text-xs px-1.5 py-0"
                                                        >
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                    {course.skills.length > 2 && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs px-1.5 py-0"
                                                        >
                                                            +{course.skills.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Estado */}
                                    <td className="px-4 py-3">{getStatusBadge(course.is_active)}</td>

                                    {/* Fecha */}
                                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                                        {new Date(course.created_at).toLocaleDateString("es-ES", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-4 py-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(course)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    {t("academy.courses.table.edit")}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onToggleStatus(course)}>
                                                    {course.is_active ? (
                                                        <>
                                                            <PowerOff className="mr-2 h-4 w-4" />
                                                            {t("academy.courses.table.deactivate")}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Power className="mr-2 h-4 w-4" />
                                                            {t("academy.courses.table.activate")}
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteClick(course)}
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    {t("academy.courses.table.delete")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("academy.courses.deleteDialog.title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("academy.courses.deleteDialog.description")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("academy.courses.deleteDialog.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {t("academy.courses.deleteDialog.delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
