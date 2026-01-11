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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const isDisabled = !selectedCourseId;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Course Selector */}
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="course">
          {t("academy.createCertificate.selectCourseRequired")}
        </Label>

        <Select value={selectedCourseId} onValueChange={onCourseSelect}>
          <SelectTrigger
            id="course"
            className="bg-white dark:bg-neutral-800 border-2"
          >
            <SelectValue
              placeholder={t("academy.createCertificate.selectCoursePlaceholder")}
            />
          </SelectTrigger>

          <SelectContent>
            {courses.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground text-center space-y-2">
                <div>{t("academy.createCertificate.noCourses")}</div>
                <a
                  href="/academy/courses"
                  className="inline-flex items-center justify-center gap-2 text-sky-500 hover:underline"
                >
                  <BookOpen className="h-4 w-4" />
                  {t("academy.createCertificate.createCourseFirst")}
                </a>
              </div>
            ) : (
              courses.map((course) => (
                <SelectItem
                  key={course.id_course}
                  value={course.id_course}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{course.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {[
                        course.category,
                        course.hours ? `${course.hours}h` : null,
                        course.instructor_name,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <p className="text-xs text-muted-foreground">
          {t("academy.createCertificate.courseInfoNote")}
        </p>

        <p className="text-xs text-muted-foreground">
          La información del curso se guardará como JSON en el storage y se hasheará
          para la blockchain.
        </p>
      </div>

      {/* Course Title */}
      <div className="space-y-2">
        <Label htmlFor="courseTitle">
          {t("academy.createCertificate.courseTitle")}
        </Label>
        <Input
          id="courseTitle"
          placeholder={t("academy.createCertificate.courseTitlePlaceholder")}
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
          className="bg-white dark:bg-neutral-800 border-2"
          disabled={isDisabled}
        />
      </div>

      {/* Course Description */}
      <div className="space-y-2">
        <Label htmlFor="courseDesc">
          {t("academy.createCertificate.courseDescription")}
        </Label>
        <Textarea
          id="courseDesc"
          placeholder={t("academy.createCertificate.courseDescriptionPlaceholder")}
          value={courseDescription}
          onChange={(e) => setCourseDescription(e.target.value)}
          className="bg-white dark:bg-neutral-800 border-2 min-h-[80px]"
          disabled={isDisabled}
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="courseCategory">
          {t("academy.createCertificate.courseCategory")}
        </Label>
        <Input
          id="courseCategory"
          placeholder={t("academy.createCertificate.courseCategoryPlaceholder")}
          value={courseCategory}
          onChange={(e) => setCourseCategory(e.target.value)}
          className="bg-white dark:bg-neutral-800 border-2"
          disabled={isDisabled}
        />
      </div>

      {/* Instructor */}
      <div className="space-y-2">
        <Label htmlFor="courseInstructor">
          {t("academy.createCertificate.courseInstructor")}
        </Label>
        <Input
          id="courseInstructor"
          placeholder={t("academy.createCertificate.courseInstructorPlaceholder")}
          value={courseInstructor}
          onChange={(e) => setCourseInstructor(e.target.value)}
          className="bg-white dark:bg-neutral-800 border-2"
          disabled={isDisabled}
        />
      </div>

      {/* Hours */}
      <div className="space-y-2">
        <Label htmlFor="courseHours">
          {t("academy.createCertificate.courseHours")}
        </Label>
        <Input
          id="courseHours"
          type="number"
          inputMode="numeric"
          placeholder={t("academy.createCertificate.courseHoursPlaceholder")}
          value={courseHours}
          onChange={(e) => setCourseHours(e.target.value)}
          className="bg-white dark:bg-neutral-800 border-2"
          disabled={isDisabled}
        />
      </div>

      {/* Modality */}
      <div className="space-y-2">
        <Label htmlFor="courseModality">
          {t("academy.createCertificate.courseModality")}
        </Label>
        <Input
          id="courseModality"
          placeholder={t("academy.createCertificate.courseModalityPlaceholder")}
          value={courseModality}
          onChange={(e) => setCourseModality(e.target.value)}
          className="bg-white dark:bg-neutral-800 border-2"
          disabled={isDisabled}
        />
      </div>

      {/* Skills */}
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="courseSkills">
          {t("academy.createCertificate.courseSkills")}
        </Label>
        <Input
          id="courseSkills"
          placeholder={t("academy.createCertificate.courseSkillsPlaceholder")}
          value={courseSkills}
          onChange={(e) => setCourseSkills(e.target.value)}
          className="bg-white dark:bg-neutral-800 border-2"
          disabled={isDisabled}
        />
      </div>
    </div>
  );
}
