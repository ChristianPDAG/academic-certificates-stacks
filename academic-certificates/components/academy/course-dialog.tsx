"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { Course, CourseFormData } from "@/types/course";
import { createCourse, updateCourse } from "@/app/actions/academy/courses";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MultiSelectSkills } from "./multi-select-skills";

interface CourseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    academyId: string;
    course?: Course | null;
    onSuccess: () => void;
}

const categories = [
    "Tecnología",
    "Finanzas",
    "Marketing",
    "Diseño",
    "Negocios",
    "Blockchain",
    "Desarrollo Web",
    "Ciencia de Datos",
    "Otro",
];

const modalities = [
    "Online - Sincrónico",
    "Online - Asincrónico",
    "Presencial",
    "Híbrido",
];

export function CourseDialog({
    open,
    onOpenChange,
    academyId,
    course,
    onSuccess,
}: CourseDialogProps) {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState("");

    const [formData, setFormData] = React.useState<CourseFormData>({
        title: "",
        description: "",
        category: "",
        skills: [],
        hours: undefined,
        modality: "",
        template_image_url: "",
        instructor_name: "",
    });

    // Initialize form data when course changes
    React.useEffect(() => {
        if (course) {
            setFormData({
                title: course.title,
                description: course.description || "",
                category: course.category || "",
                skills: course.skills || [],
                hours: course.hours || undefined,
                modality: course.modality || "",
                template_image_url: course.template_image_url || "",
                instructor_name: course.instructor_name || "",
            });
        } else {
            setFormData({
                title: "",
                description: "",
                category: "",
                skills: [],
                hours: undefined,
                modality: "",
                template_image_url: "",
                instructor_name: "",
            });
        }
        setError("");
    }, [course, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            if (!formData.title.trim()) {
                throw new Error(t("academy.courses.dialog.errorTitle"));
            }

            if (course) {
                await updateCourse(course.id_course, formData);
            } else {
                await createCourse(academyId, formData);
            }

            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            setError(err.message || t("academy.courses.dialog.errorSaving"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {course ? t("academy.courses.dialog.edit") : t("academy.courses.dialog.create")}
                    </DialogTitle>
                    <DialogDescription>
                        {course
                            ? t("academy.courses.dialog.editDescription")
                            : t("academy.courses.dialog.createDescription")}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            {t("academy.courses.dialog.titleRequired")}
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            placeholder={t("academy.courses.dialog.titlePlaceholder")}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">{t("academy.courses.dialog.description")}</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder={t("academy.courses.dialog.descriptionPlaceholder")}
                            rows={3}
                        />
                    </div>

                    {/* Instructor Name */}
                    <div className="space-y-2">
                        <Label htmlFor="instructor_name">{t("academy.courses.dialog.instructor")}</Label>
                        <Input
                            id="instructor_name"
                            value={formData.instructor_name}
                            onChange={(e) =>
                                setFormData({ ...formData, instructor_name: e.target.value })
                            }
                            placeholder={t("academy.courses.dialog.instructorPlaceholder")}
                        />
                    </div>

                    {/* Category and Modality */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">{t("academy.courses.dialog.category")}</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, category: value })
                                }
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder={t("academy.courses.dialog.selectCategory")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="modality">{t("academy.courses.dialog.modality")}</Label>
                            <Select
                                value={formData.modality}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, modality: value })
                                }
                            >
                                <SelectTrigger id="modality">
                                    <SelectValue placeholder={t("academy.courses.dialog.selectModality")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {modalities.map((mod) => (
                                        <SelectItem key={mod} value={mod}>
                                            {mod}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Hours */}
                    <div className="space-y-2">
                        <Label htmlFor="hours">{t("academy.courses.dialog.hours")}</Label>
                        <Input
                            id="hours"
                            type="number"
                            min="0"
                            value={formData.hours || ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    hours: e.target.value ? parseInt(e.target.value) : undefined,
                                })
                            }
                            placeholder={t("academy.courses.dialog.hoursPlaceholder")}
                        />
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                        <Label>{t("academy.courses.dialog.skills")}</Label>
                        <MultiSelectSkills
                            value={formData.skills || []}
                            onChange={(skills) => setFormData({ ...formData, skills })}
                        />
                    </div>

                    {/* Template Image URL */}
                    <div className="space-y-2">
                        <Label htmlFor="template_image_url">{t("academy.courses.dialog.templateImage")}</Label>
                        <Input
                            id="template_image_url"
                            value={formData.template_image_url}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    template_image_url: e.target.value,
                                })
                            }
                            placeholder={t("academy.courses.dialog.templateImagePlaceholder")}
                            disabled
                            className="opacity-50"
                        />
                        <p className="text-xs text-muted-foreground">
                            {t("academy.courses.dialog.templateImagePlaceholder")}
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            {t("academy.courses.dialog.cancel")}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? t("academy.courses.dialog.saving")
                                : course
                                    ? t("academy.courses.dialog.save")
                                    : t("academy.courses.dialog.create")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
