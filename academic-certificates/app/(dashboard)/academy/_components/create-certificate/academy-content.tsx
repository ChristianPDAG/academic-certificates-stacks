"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { issueCertificateAction } from "@/app/actions/academy/certificates";
import { getCoursesByAcademy } from "@/app/actions/academy/courses";
import { getAcademyCredits } from "@/app/actions/academy/credits";
import {
  getAcademyCredentials,
  getAcademyIdByUserId,
} from "@/app/actions/academy/credentials";
import { getStudentWallet } from "@/app/actions/student/credentials";

import type { Course } from "@/types/course";

import { StudentInfoForm } from "@/app/(dashboard)/academy/_components/create-certificate/student-info-form";
import { CourseInfoForm } from "@/app/(dashboard)/academy/_components/create-certificate/course-info-form";
import { CertificateDetailsForm } from "@/app/(dashboard)/academy/_components/create-certificate/certificate-details-form";

import { Button } from "@/components/ui/button";

import {
  School,
  GraduationCap,
  Award,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Coins,
} from "lucide-react";

type TransactionStatus = "idle" | "loading" | "success" | "error" | "insufficient-credits";
const ACADEMY_CONTENT_CACHE_TTL = 60 * 1000;

interface AcademyContentProps {
  id: string; // user id
}

export function AcademyContent({ id }: AcademyContentProps) {
  const { t } = useTranslation();

  // Academy state
  const [academyStacksAddress, setAcademyStacksAddress] = useState<string>("");
  const [academyName, setAcademyName] = useState<string>("");
  const [credits, setCredits] = useState<number>(0);
  const [isLoadingAcademy, setIsLoadingAcademy] = useState(true);
  const [academyId, setAcademyId] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  // Form state - Issue Certificate
  const [studentEmail, setStudentEmail] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentIdentifier, setStudentIdentifier] = useState("");
  const [studentWallet, setStudentWallet] = useState("");
  const [grade, setGrade] = useState("");
  const [graduationDate, setGraduationDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // Course metadata fields (editable)
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseCategory, setCourseCategory] = useState("");
  const [courseHours, setCourseHours] = useState("");
  const [courseModality, setCourseModality] = useState("");
  const [courseInstructor, setCourseInstructor] = useState("");
  const [courseSkills, setCourseSkills] = useState("");

  // UX state
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [txid, setTxid] = useState("");
  const [urlTransaction, setUrlTransaction] = useState("");
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Load academy data
  useEffect(() => {
    const cacheKey = `academy:create-certificate:${id}`;
    const readCache = () => {
      if (typeof window === "undefined") return null;
      const raw = window.sessionStorage.getItem(cacheKey);
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as {
          academyStacksAddress: string;
          academyName: string;
          credits: number;
          academyId: string;
          courses: Course[];
          ts: number;
        };
        if (Date.now() - parsed.ts > ACADEMY_CONTENT_CACHE_TTL) return null;
        return parsed;
      } catch {
        return null;
      }
    };

    const writeCache = (data: {
      academyStacksAddress: string;
      academyName: string;
      credits: number;
      academyId: string;
      courses: Course[];
    }) => {
      if (typeof window === "undefined") return;
      window.sessionStorage.setItem(cacheKey, JSON.stringify({ ...data, ts: Date.now() }));
    };

    const loadAcademyData = async () => {
      if (!id) {
        setIsLoadingAcademy(false);
        return;
      }

      try {
        const cached = readCache();
        if (cached) {
          setAcademyStacksAddress(cached.academyStacksAddress);
          setAcademyName(cached.academyName);
          setCredits(cached.credits);
          setAcademyId(cached.academyId);
          setCourses(cached.courses);
          setIsLoadingAcademy(false);
        } else {
          setIsLoadingAcademy(true);
        }

        const [credentials, creditsCount, academyIdResult] = await Promise.all([
          getAcademyCredentials(id),
          getAcademyCredits(id),
          getAcademyIdByUserId(id),
        ]);
        const coursesData = await getCoursesByAcademy(academyIdResult);
        const activeCourses = coursesData.filter((c) => c.is_active);

        setAcademyStacksAddress(credentials.stacksAddress);
        setAcademyName(credentials.name);
        setCredits(creditsCount);
        setAcademyId(academyIdResult);
        setCourses(activeCourses);
        writeCache({
          academyStacksAddress: credentials.stacksAddress,
          academyName: credentials.name,
          credits: creditsCount,
          academyId: academyIdResult,
          courses: activeCourses,
        });
      } catch (error) {
        console.error("Error loading academy data:", error);
      } finally {
        setIsLoadingAcademy(false);
      }
    };

    loadAcademyData();
  }, [id]);

  // Handle course selection - auto-fill course metadata fields
  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);

    if (!courseId) {
      setCourseTitle("");
      setCourseDescription("");
      setCourseCategory("");
      setCourseHours("");
      setCourseModality("");
      setCourseInstructor("");
      setCourseSkills("");
      return;
    }

    const course = courses.find((c) => c.id_course === courseId);
    if (!course) return;

    setCourseTitle(course.title || "");
    setCourseDescription(course.description || "");
    setCourseCategory(course.category || "");
    setCourseHours(course.hours != null ? String(course.hours) : "");
    setCourseModality(course.modality || "");
    setCourseInstructor(course.instructor_name || "");
    setCourseSkills(Array.isArray(course.skills) ? course.skills.join(", ") : "");
  };

  const canSubmitIssue =
    !!studentEmail.trim() &&
    !!studentName.trim() &&
    !!studentIdentifier.trim() &&
    !!studentWallet.trim() &&
    !!graduationDate.trim() &&
    !!selectedCourseId.trim() &&
    transactionStatus !== "loading";

  // Search wallet
  const handleSearchWallet = async () => {
    if (!studentEmail.trim()) return;

    setIsLoadingWallet(true);
    try {
      const studentData = await getStudentWallet(studentEmail.trim());

      if (studentData?.stacks_address) {
        setStudentWallet(studentData.stacks_address);

        if (studentData.full_name) {
          setStudentName(studentData.full_name);
        }
      } else {
        alert(t("academy.createCertificate.noWalletFound"));
      }
    } catch (err) {
      console.error("Buscar wallet:", err);
      alert(t("academy.createCertificate.errorSearchWallet"));
    } finally {
      setIsLoadingWallet(false);
    }
  };

  // Issue certificate
  const handleIssueCertificate = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmitIssue) return;

    if (!selectedCourseId.trim()) {
      alert(t("academy.createCertificate.selectCourseRequired"));
      return;
    }

    if (credits < 1) {
      setTransactionStatus("insufficient-credits");
      setErrorMessage(t("academy.certificates.insufficientCreditsMessage"));
      return;
    }

    setTransactionStatus("loading");
    setTxid("");
    setUrlTransaction("");
    setVerificationCode("");
    setErrorMessage("");

    try {
      // Convert date to unix timestamp
      const gradDate = Math.floor(new Date(graduationDate).getTime() / 1000);

      // Convert expiration date to block height (aprox: 1 bloque ~ 10 minutos)
      let expirationHeight: number | null = null;
      if (expirationDate) {
        const expirationTimestamp = Math.floor(new Date(expirationDate).getTime() / 1000);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const secondsUntilExpiration = expirationTimestamp - currentTimestamp;
        const blocksUntilExpiration = Math.floor(secondsUntilExpiration / 600);

        // TODO: ideal obtener el block height real desde API de red
        const currentBlockHeight = 150000;
        expirationHeight = currentBlockHeight + Math.max(0, blocksUntilExpiration);
      }

      const result = await issueCertificateAction(
        id,
        studentWallet.trim(),
        studentName.trim(),
        studentIdentifier.trim(),
        studentEmail.trim(),
        grade?.trim() ? grade.trim() : null,
        gradDate,
        expirationHeight,
        selectedCourseId,
        {
          title: courseTitle,
          description: courseDescription,
          category: courseCategory,
          skills: courseSkills,
          hours: courseHours,
          modality: courseModality,
          instructor_name: courseInstructor,
        }
      );

      // Update credits after issuing
      const newCredits = await getAcademyCredits(id);
      setCredits(newCredits);

      setTxid(result.txid);
      setUrlTransaction(result.urlTransaction);
      setVerificationCode(result.verificationCode);
      setTransactionStatus("success");

      // Reset form
      setStudentEmail("");
      setStudentName("");
      setStudentIdentifier("");
      setStudentWallet("");
      setGrade("");
      setGraduationDate("");
      setExpirationDate("");
      setSelectedCourseId("");
      setCourseTitle("");
      setCourseDescription("");
      setCourseCategory("");
      setCourseHours("");
      setCourseModality("");
      setCourseInstructor("");
      setCourseSkills("");
    } catch (error: any) {
      console.error("Error issuing certificate:", error);
      setTransactionStatus("error");
      setErrorMessage(error?.message || t("academy.createCertificate.errorIssue"));
    }
  };

  return (
      <div className="space-y-6">

        {/* ── Header con estado de academia ────────────────────── */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/10">
              <GraduationCap className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">
              {t("academy.createCertificate.title")}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("academy.createCertificate.issueCertificate")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("academy.createCertificate.description")}
          </p>
        </div>

        {/* ── Stat cards academia ────────────────────────────────── */}
        {!isLoadingAcademy && academyStacksAddress && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Nombre + Stacks address */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-sky-500" />
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/10">
                  <School className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{academyName}</p>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate">{academyStacksAddress}</p>
                </div>
              </div>
            </div>
            {/* Créditos */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-amber-500" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{t("academy.profile.credits")}</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{credits}</p>
                <Coins className="h-5 w-5 text-amber-500 mb-0.5" />
              </div>
            </div>
          </div>
        )}

        {/* ── Formulario ────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="h-0.5 w-full bg-sky-500" />

          <form onSubmit={handleIssueCertificate} className="divide-y divide-slate-100 dark:divide-slate-800">

            {/* Sección: Información del estudiante */}
            <div className="px-5 py-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-500/10">
                  <Award className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t("academy.createCertificate.studentSection")}
                </h3>
              </div>
              <StudentInfoForm
                studentEmail={studentEmail}
                setStudentEmail={setStudentEmail}
                studentName={studentName}
                setStudentName={setStudentName}
                studentIdentifier={studentIdentifier}
                setStudentIdentifier={setStudentIdentifier}
                studentWallet={studentWallet}
                setStudentWallet={setStudentWallet}
                isLoadingWallet={isLoadingWallet}
                onSearchWallet={handleSearchWallet}
              />
            </div>

            {/* Sección: Curso */}
            <div className="px-5 py-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-500/10">
                  <GraduationCap className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t("academy.createCertificate.courseSection")}
                </h3>
              </div>
              <CourseInfoForm
                courses={courses}
                selectedCourseId={selectedCourseId}
                onCourseSelect={handleCourseSelect}
                courseTitle={courseTitle}
                setCourseTitle={setCourseTitle}
                courseDescription={courseDescription}
                setCourseDescription={setCourseDescription}
                courseCategory={courseCategory}
                setCourseCategory={setCourseCategory}
                courseInstructor={courseInstructor}
                setCourseInstructor={setCourseInstructor}
                courseHours={courseHours}
                setCourseHours={setCourseHours}
                courseModality={courseModality}
                setCourseModality={setCourseModality}
                courseSkills={courseSkills}
                setCourseSkills={setCourseSkills}
              />
            </div>

            {/* Sección: Detalles del certificado */}
            <div className="px-5 py-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-500/10">
                  <School className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t("academy.createCertificate.detailsSection")}
                </h3>
              </div>
              <CertificateDetailsForm
                grade={grade}
                setGrade={setGrade}
                graduationDate={graduationDate}
                setGraduationDate={setGraduationDate}
                expirationDate={expirationDate}
                setExpirationDate={setExpirationDate}
              />
            </div>

            {/* Submit */}
            <div className="px-5 py-4 flex justify-end">
              <Button
                type="submit"
                disabled={!canSubmitIssue}
                size="sm"
                className="gap-1.5 bg-sky-600 hover:bg-sky-700 text-white"
              >
                {transactionStatus === "loading" ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" />{t("academy.createCertificate.issuing")}</>
                ) : (
                  <><Award className="h-3.5 w-3.5" />{t("academy.createCertificate.issueCertificate")}</>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* ── Éxito ────────────────────────────────────────────────── */}
        {transactionStatus === "success" && (
          <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <div className="h-0.5 w-full bg-emerald-500" />
            <div className="p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                      {t("academy.createCertificate.successIssued")}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {t("academy.certificates.successIssued")}
                    </p>
                  </div>
                  {verificationCode && (
                    <div className="rounded-xl border border-emerald-300 bg-emerald-100/70 dark:border-emerald-700 dark:bg-emerald-900/30 px-4 py-3">
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
                        {t("explorer.verificationCode")}:
                      </p>
                      <p className="text-xl font-mono font-bold tracking-widest text-emerald-700 dark:text-emerald-300">
                        {verificationCode}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{t("explorer.saveCode")}</p>
                    </div>
                  )}
                  {txid && urlTransaction && (
                    <a href={urlTransaction} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 hover:underline font-medium">
                      <ExternalLink className="h-3.5 w-3.5" />
                      {t("explorer.viewTransaction")}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Créditos insuficientes ─────────────────────────────────── */}
        {transactionStatus === "insufficient-credits" && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-950/30">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">{t("academy.certificates.insufficientCredits")}</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────────── */}
        {transactionStatus === "error" && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/50 dark:bg-red-950/30">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">{t("academy.createCertificate.errorIssue")}</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

      </div>
  );
}
