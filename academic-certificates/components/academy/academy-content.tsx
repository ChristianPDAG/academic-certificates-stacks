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

import { StudentInfoForm } from "@/app/academy/components/student-info-form";
import { CourseInfoForm } from "@/app/academy/components/course-info-form";
import { CertificateDetailsForm } from "@/app/academy/components/certificate-details-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

import { getSchoolCreditsManagerClient } from "@/lib/stacks/admin/fund-schools-manager";

type TransactionStatus = "idle" | "loading" | "success" | "error" | "insufficient-credits";

interface AcademyContentProps {
  id: string; // user id
}

export function AcademyContent({ id }: AcademyContentProps) {
  const { t, i18n } = useTranslation();

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

  const locale = i18n.language?.startsWith("en") ? "en-US" : "es-ES";

  // Load academy data
  useEffect(() => {
    const loadAcademyData = async () => {
      if (!id) {
        setIsLoadingAcademy(false);
        return;
      }

      try {
        setIsLoadingAcademy(true);

        const credentials = await getAcademyCredentials(id);
        setAcademyStacksAddress(credentials.stacksAddress);
        setAcademyName(credentials.name);

        // Optional: read credits from blockchain for debugging
        try {
          await getSchoolCreditsManagerClient(credentials.stacksAddress);
        } catch {
          // Silencioso: no bloquea UI
        }

        const creditsCount = await getAcademyCredits(id);
        setCredits(creditsCount);

        const academyIdResult = await getAcademyIdByUserId(id);
        setAcademyId(academyIdResult);

        const coursesData = await getCoursesByAcademy(academyIdResult);
        setCourses(coursesData.filter((c) => c.is_active));
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

        if (studentData.nombre) {
          setStudentName(studentData.nombre);
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
      setErrorMessage(
        t("academy.certificates.insufficientCreditsMessage") ||
          "No tienes créditos suficientes para emitir certificados"
      );
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
      setErrorMessage(error?.message || t("academy.createCertificate.errorIssue") || "Error al emitir certificado");
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('/img/bg-waves-3.svg')] bg-cover bg-center opacity-10 dark:opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white dark:from-neutral-950/60 dark:to-neutral-950" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 lg:px-0 py-16 md:py-20">
        {/* Academy Header */}
        {!isLoadingAcademy && academyStacksAddress && (
          <div className="mb-8">
            <div
              className="rounded-2xl border backdrop-blur-xl p-6
                         bg-white/80 border-neutral-200
                         dark:bg-neutral-900/70 dark:border-neutral-800"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <School className="h-8 w-8 text-sky-500 dark:text-sky-400" />
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      {academyName}
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">
                      {academyStacksAddress}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {t("academy.profile.credits")}
                      </p>
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {credits}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Issue Certificate Form */}
        <Card
          className="rounded-2xl border backdrop-blur-xl shadow-2xl
                     bg-white/80 border-neutral-200
                     dark:bg-neutral-900/70 dark:border-neutral-800"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <span className="p-2 rounded-lg bg-sky-500/10">
                <GraduationCap className="h-6 w-6 text-sky-500 dark:text-sky-400" />
              </span>
              {t("academy.createCertificate.title")}
            </CardTitle>

            <CardDescription className="text-base">
              {t("academy.createCertificate.description")}{" "}
              <span className="text-neutral-600 dark:text-neutral-400">
                {t("academy.createCertificate.creditNote") || "Se deducirá 1 crédito."}
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleIssueCertificate} className="space-y-6">
              {/* Student Information */}
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

              {/* Course Information */}
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

              {/* Certificate Details */}
              <CertificateDetailsForm
                grade={grade}
                setGrade={setGrade}
                graduationDate={graduationDate}
                setGraduationDate={setGraduationDate}
                expirationDate={expirationDate}
                setExpirationDate={setExpirationDate}
              />

              <Button
                type="submit"
                disabled={!canSubmitIssue}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white h-12 text-lg"
              >
                {transactionStatus === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("academy.createCertificate.issuing")}
                  </>
                ) : (
                  <>
                    <Award className="mr-2 h-5 w-5" />
                    {t("academy.createCertificate.issueCertificate")}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Success Message */}
        {transactionStatus === "success" && (
          <div className="mt-8">
            <Card
              className="rounded-2xl border shadow-xl
                         bg-gradient-to-br from-green-50 to-green-100 border-green-300
                         dark:from-green-950/50 dark:to-green-900/30 dark:border-green-800/60"
            >
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">
                      {t("academy.createCertificate.successIssued")}
                    </h3>

                    <p className="text-green-800 dark:text-green-200 mb-4">
                      {t("academy.certificates.successIssued")}
                    </p>

                    {/* Verification Code Display */}
                    {verificationCode && (
                      <div className="mb-4 p-4 rounded-lg bg-green-200/50 dark:bg-green-900/30 border border-green-400 dark:border-green-700">
                        <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                          {t("explorer.verificationCode")}:
                        </p>
                        <p className="text-2xl font-mono font-bold text-green-800 dark:text-green-200 mb-2 tracking-wider">
                          {verificationCode}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          {t("explorer.saveCode")}
                        </p>
                      </div>
                    )}

                    {txid && urlTransaction && (
                      <a
                        href={urlTransaction}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-green-700 dark:text-green-300 hover:underline font-medium"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t("explorer.viewTransaction")}
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Insufficient Credits */}
        {transactionStatus === "insufficient-credits" && (
          <div className="mt-8">
            <Card
              className="rounded-2xl border shadow-xl
                         bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300
                         dark:from-orange-950/50 dark:to-orange-900/30 dark:border-orange-800/60"
            >
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-12 w-12 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100 mb-2">
                      {t("academy.certificates.insufficientCredits")}
                    </h3>
                    <p className="text-orange-800 dark:text-orange-200">{errorMessage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Message */}
        {transactionStatus === "error" && (
          <div className="mt-8">
            <Card
              className="rounded-2xl border shadow-xl
                         bg-gradient-to-br from-red-50 to-red-100 border-red-300
                         dark:from-red-950/50 dark:to-red-900/30 dark:border-red-800/60"
            >
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">
                      {t("academy.createCertificate.errorIssue")}
                    </h3>
                    <p className="text-red-800 dark:text-red-200">{errorMessage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
