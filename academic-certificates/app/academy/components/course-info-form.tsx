"use client";

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
import { BookOpen } from "lucide-react";
import { Course } from "@/types/course";

interface CourseInfoFormProps {
    courses: Course[];
    selectedCourseId: string;
    onCourseSelect: (courseId: string) => void;
    courseTitle: string;
    setCourseTitle: (value: string) => void;
    courseDescription: string;
    setCourseDescription: (value: string) => void;
    courseCategory: string;
    setCourseCategory: (value: string) => void;
    courseInstructor: string;
    setCourseInstructor: (value: string) => void;
    courseHours: string;
    setCourseHours: (value: string) => void;
    courseModality: string;
    setCourseModality: (value: string) => void;
    courseSkills: string;
    setCourseSkills: (value: string) => void;
}

export function CourseInfoForm({
    courses,
    selectedCourseId,
    onCourseSelect,
    courseTitle,
    setCourseTitle,
    courseDescription,
    setCourseDescription,
    courseCategory,
    setCourseCategory,
    courseInstructor,
    setCourseInstructor,
    courseHours,
    setCourseHours,
    courseModality,
    setCourseModality,
    courseSkills,
    setCourseSkills,
}: CourseInfoFormProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Selector */}
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="course" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Seleccionar Curso <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedCourseId} onValueChange={onCourseSelect} required>
                    <SelectTrigger id="course" className="bg-white dark:bg-neutral-800 border-2">
                        <SelectValue placeholder="Selecciona un curso..." />
                    </SelectTrigger>
                    <SelectContent>
                        {courses.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                                No hay cursos activos.{" "}
                                <a href="/academy/courses" className="text-sky-500 hover:underline">
                                    Crear curso
                                </a>
                            </div>
                        ) : (
                            courses.map((course) => (
                                <SelectItem key={course.id_course} value={course.id_course}>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{course.title}</span>
                                        {course.category && (
                                            <span className="text-xs text-muted-foreground">
                                                {course.category}
                                                {course.hours && ` • ${course.hours}h`}
                                                {course.instructor_name && ` • ${course.instructor_name}`}
                                            </span>
                                        )}
                                    </div>
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                    La información del curso se guardará como JSON en el storage y se hasheará para la blockchain
                </p>
            </div>

            {/* Course Title */}
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="courseTitle">Título del Curso</Label>
                <Input
                    id="courseTitle"
                    placeholder="Nombre del curso..."
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="bg-white dark:bg-neutral-800 border-2"
                    disabled={!selectedCourseId}
                />
            </div>

            {/* Course Description */}
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="courseDesc">Descripción del Curso</Label>
                <Textarea
                    id="courseDesc"
                    placeholder="Descripción del curso..."
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    className="bg-white dark:bg-neutral-800 border-2 min-h-[80px]"
                    disabled={!selectedCourseId}
                />
            </div>

            {/* Category and Instructor */}
            <div className="space-y-2">
                <Label htmlFor="courseCategory">Categoría</Label>
                <Input
                    id="courseCategory"
                    placeholder="Ej: Tecnología, Blockchain..."
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value)}
                    className="bg-white dark:bg-neutral-800 border-2"
                    disabled={!selectedCourseId}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="courseInstructor">Instructor</Label>
                <Input
                    id="courseInstructor"
                    placeholder="Nombre del instructor..."
                    value={courseInstructor}
                    onChange={(e) => setCourseInstructor(e.target.value)}
                    className="bg-white dark:bg-neutral-800 border-2"
                    disabled={!selectedCourseId}
                />
            </div>

            {/* Hours and Modality */}
            <div className="space-y-2">
                <Label htmlFor="courseHours">Horas del Curso</Label>
                <Input
                    id="courseHours"
                    type="number"
                    placeholder="40"
                    value={courseHours}
                    onChange={(e) => setCourseHours(e.target.value)}
                    className="bg-white dark:bg-neutral-800 border-2"
                    disabled={!selectedCourseId}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="courseModality">Modalidad</Label>
                <Input
                    id="courseModality"
                    placeholder="Online, Presencial, Híbrido..."
                    value={courseModality}
                    onChange={(e) => setCourseModality(e.target.value)}
                    className="bg-white dark:bg-neutral-800 border-2"
                    disabled={!selectedCourseId}
                />
            </div>

            {/* Skills */}
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="courseSkills">Habilidades (separadas por comas)</Label>
                <Input
                    id="courseSkills"
                    placeholder="React, Clarity, Smart Contracts..."
                    value={courseSkills}
                    onChange={(e) => setCourseSkills(e.target.value)}
                    className="bg-white dark:bg-neutral-800 border-2"
                    disabled={!selectedCourseId}
                />
            </div>
        </div>
    );
}
