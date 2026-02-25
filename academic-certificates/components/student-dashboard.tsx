"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, GraduationCap, Loader2, AlertCircle } from "lucide-react";
import { getStudentWallet } from "@/app/actions/student/credentials";
import { getCertificatesByStudentWallet } from "@/app/actions/public/explorer";

interface StudentDashboardProps {
    user: {
        id: string;
        email: string;
    };
}

export interface CertificateType {
    id_certificate: string;
    chain_cert_id: number;
    student_name: string;
    student_email: string;
    student_wallet: string;
    grade: string | null;
    status: string;
    created_at: string;
    tx_id: string | null;
    courses: {
        id_course: string;
        title: string;
        hours: number;
    };
    academies: {
        id_academy: string;
        legal_name: string;
        stacks_address: string;
    };
}

export default function StudentDashboard({ user }: StudentDashboardProps) {
    const { t } = useTranslation();
    const [certificates, setCertificates] = useState<CertificateType[]>([]);
    const [loading, setLoading] = useState(true);
    const [stacksAddress, setStacksAddress] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStudentData();
    }, [user.email]);

    const loadStudentData = async () => {
        try {
            setLoading(true);
            setError(null);

            const studentData = await getStudentWallet(user.email);

            if (!studentData?.stacks_address) {
                setError(t("studentDashboard.noStacksAddress"));
                setLoading(false);
                return;
            }

            setStacksAddress(studentData.stacks_address);

            const certificatesData = await getCertificatesByStudentWallet(studentData.stacks_address);

            setCertificates(certificatesData);
        } catch (err) {
            console.error("Error loading student data:", err);
            setError(err instanceof Error ? err.message : t("studentDashboard.errorLoadingStudent"));
        } finally {
            setLoading(false);
        }
    };

    const CertificateCard = ({ certificate }: { certificate: CertificateType }) => (
        <Card
            className="rounded-2xl border backdrop-blur-xl transition-all duration-300
                       bg-white/80 border-neutral-200 hover:border-sky-500/50 hover:shadow-xl
                       dark:bg-neutral-900/70 dark:border-neutral-800 dark:hover:border-sky-500/60"
        >
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                        <CardTitle className="text-lg mb-1">
                            {certificate.courses.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                            {certificate.student_name}
                        </CardDescription>
                    </div>
                    <Badge className="bg-sky-500 text-white hover:bg-sky-600">
                        #{certificate.chain_cert_id}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {certificate.grade && (
                    <div
                        className="flex justify-between items-center p-3 rounded-xl border
                                  bg-gradient-to-br from-green-50 to-green-100 border-green-200
                                  dark:from-green-950/50 dark:to-green-900/30 dark:border-green-900/50"
                    >
                        <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                            {t("studentDashboard.gradeLabel")}
                        </span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {certificate.grade}
                        </span>
                    </div>
                )}

                <div className="grid gap-3">
                    <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                        <span className="text-sm font-semibold block mb-2">{t("studentDashboard.academyLabel")}</span>
                        <p className="text-sm mb-1">{certificate.academies.legal_name}</p>
                        <p
                            className="text-xs font-mono rounded-lg p-2 break-all border
                                      bg-white border-neutral-200 text-neutral-900
                                      dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100"
                        >
                            {certificate.academies.stacks_address}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="flex-1 w-full flex flex-col gap-6 mt-20">
            <div className="rounded-2xl border backdrop-blur-xl p-6
                          bg-white/80 border-neutral-200
                          dark:bg-neutral-900/70 dark:border-neutral-800">
                <div className="flex items-center gap-3 mb-2">
                    <GraduationCap className="h-8 w-8 text-sky-500 dark:text-sky-400" />
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                            {t("studentDashboard.welcome", { name: user.email.split("@")[0] })}
                        </h1>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            {t("studentDashboard.description")}
                        </p>
                    </div>
                </div>
            </div>

            {stacksAddress && (
                <Card className="rounded-2xl border backdrop-blur-xl
                               bg-white/80 border-neutral-200
                               dark:bg-neutral-900/70 dark:border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-base">{t("studentDashboard.stacksAddress")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
                            <p className="text-sm font-mono rounded-lg p-2 break-all border
                                        bg-white border-neutral-200 text-neutral-900
                                        dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100">
                                {stacksAddress}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div>
                <div className="flex items-center gap-2 mb-6">
                    <Award className="h-6 w-6 text-sky-500 dark:text-sky-400" />
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {t("studentDashboard.myCertificates")}
                    </h2>
                    {certificates.length > 0 && (
                        <Badge className="bg-sky-500 text-white">
                            {certificates.length}
                        </Badge>
                    )}
                </div>

                {loading ? (
                    <Card className="rounded-2xl border backdrop-blur-xl
                                   bg-white/80 border-neutral-200
                                   dark:bg-neutral-900/70 dark:border-neutral-800">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="h-12 w-12 animate-spin text-sky-500 dark:text-sky-400 mb-4" />
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {t("studentDashboard.loadingCertificates")}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : error ? (
                    <Card className="rounded-2xl border backdrop-blur-xl
                                   bg-red-50/80 border-red-200
                                   dark:bg-red-950/30 dark:border-red-900">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                <div>
                                    <p className="font-semibold text-red-900 dark:text-red-200">
                                        {t("studentDashboard.errorLoadingCertificates")}
                                    </p>
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : certificates.length === 0 ? (
                    <Card className="rounded-2xl border backdrop-blur-xl
                                   bg-white/80 border-neutral-200
                                   dark:bg-neutral-900/70 dark:border-neutral-800">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center py-12 text-neutral-500 dark:text-neutral-400">
                                <Award className="h-16 w-16 mb-4 opacity-50" />
                                <p className="text-lg font-semibold mb-2">
                                    {t("studentDashboard.noCertificates")}
                                </p>
                                <p className="text-sm text-center max-w-md">
                                    {t("studentDashboard.noCertificatesDescription")}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certificates.map((certificate) => (
                            <CertificateCard key={certificate.id_certificate} certificate={certificate} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
