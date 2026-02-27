"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getStudentWallet } from "@/app/actions/student/credentials";
import { getCertificatesByStudentWallet } from "@/app/actions/public/explorer";
import type { StudentCertificate } from "@/app/(dashboard)/student/_components/types";

const STUDENT_CACHE_TTL = 60 * 1000;

interface StudentDashboardData {
  fullName: string;
  stacksAddress: string;
  certificates: StudentCertificate[];
}

interface UseStudentDataParams {
  email: string;
}

export function useStudentData({ email }: UseStudentDataParams) {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = useMemo(() => `student:dashboard:${email}`, [email]);

  const loadData = useCallback(
    async (options?: { background?: boolean }) => {
      const background = options?.background ?? false;
      try {
        if (!background) setLoading(true);
        setError(null);

        const studentData = await getStudentWallet(email);
        if (!studentData?.stacks_address) {
          setData(null);
          setError("no-stacks-address");
          return;
        }

        const certificates = await getCertificatesByStudentWallet(studentData.stacks_address);
        const nextData: StudentDashboardData = {
          fullName: studentData.full_name || "",
          stacksAddress: studentData.stacks_address,
          certificates,
        };
        setData(nextData);

        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ ts: Date.now(), data: nextData })
          );
        }
      } catch (err) {
        console.error("Error loading student data:", err);
        setError("generic");
      } finally {
        if (!background) setLoading(false);
      }
    },
    [cacheKey, email]
  );

  useEffect(() => {
    if (!email) return;

    if (typeof window !== "undefined") {
      const raw = window.sessionStorage.getItem(cacheKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { ts: number; data: StudentDashboardData };
          if (Date.now() - parsed.ts < STUDENT_CACHE_TTL) {
            setData(parsed.data);
            setLoading(false);
            loadData({ background: true });
            return;
          }
        } catch {
          // ignore invalid cache
        }
      }
    }

    loadData();
  }, [cacheKey, email, loadData]);

  return {
    data,
    loading,
    error,
    reload: () => loadData(),
  };
}
