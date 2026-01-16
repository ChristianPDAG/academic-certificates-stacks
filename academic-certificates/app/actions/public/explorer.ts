"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Get student wallet address by email
 */
export async function getStudentWalletByEmail(email: string) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("users")
            .select("stacks_address, id_user, full_name")
            .eq("role", "student")
            .eq("email", email)
            .maybeSingle();
        console.log("getStudentWalletByEmail data:", data);
        if (error) {
            console.error("Error getting student wallet:", error);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Error in getStudentWalletByEmail:", error);
        return null;
    }
}

/**
 * Get all certificates for a student by wallet address
 */
import type { CertificateType } from "@/components/student-dashboard";
export async function getCertificatesByStudentWallet(studentWallet: string): Promise<CertificateType[]> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("certificates")
            .select(`
                id_certificate,
                chain_cert_id,
                student_name,
                student_email,
                student_wallet,
                grade,
                status,
                created_at,
                tx_id,
                courses:id_course (
                    id_course,
                    title,
                    hours
                ),
                academies:id_academy (
                    id_academy,
                    legal_name,
                    stacks_address
                )
            `)
            .eq("student_wallet", studentWallet)
            .order("created_at", { ascending: false });
        if (error) {
            console.error("Error getting certificates by student wallet:", error);
            return [];
        }

        // Transform data to match CertificateType structure
        const transformedData = data?.map(cert => ({
            ...cert,
            courses: Array.isArray(cert.courses) ? cert.courses[0] : cert.courses,
            academies: Array.isArray(cert.academies) ? cert.academies[0] : cert.academies
        })) || [];

        return transformedData as CertificateType[];
    } catch (error) {
        console.error("Error in getCertificatesByStudentWallet:", error);
        return [];
    }
}

/**
 * Get all certificates issued by a school/academy
 */
export async function getCertificatesBySchool(schoolAddress: string) {
    try {
        const supabase = await createClient();

        // First get the academy by stacks_address
        const { data: academy, error: academyError } = await supabase
            .from("academies")
            .select("id_academy, legal_name")
            .eq("stacks_address", schoolAddress)
            .maybeSingle();

        if (academyError || !academy) {
            console.error("Academy not found or error:", academyError);
            return [];
        }

        // Then get all certificates for this academy
        const { data, error } = await supabase
            .from("certificates")
            .select(`
                id_certificate,
                chain_cert_id,
                student_name,
                student_email,
                student_wallet,
                grade,
                status,
                created_at,
                tx_id,
                courses:id_course (
                    id_course,
                    title,
                    course_code,
                    duration,
                    hours_duration
                )
            `)
            .eq("id_academy", academy.id_academy)
            .order("created_at", { ascending: false });

        console.log("getCertificatesBySchool data:", JSON.stringify(data, null, 2));
        if (error) {
            console.error("Error getting certificates by school:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Error in getCertificatesBySchool:", error);
        return [];
    }
}

/**
 * Get academy info by stacks address
 */
export async function getAcademyByStacksAddress(stacksAddress: string) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("academies")
            .select(`
                id_academy,
                legal_name,
                institution_type,
                contact_academy_email,
                website,
                stacks_address,
                credits,
                validation_status,
                created_at,
                country,
                region_state,
                city
            `)
            .eq("stacks_address", stacksAddress)
            .maybeSingle();

        if (error) {
            console.error("Error getting academy by stacks address:", error);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Error in getAcademyByStacksAddress:", error);
        return null;
    }
}

/**
 * Get certificate by chain ID with full related data
 */
export async function getCertificateByChainId(chainCertId: number) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("certificates")
            .select(`
                id_certificate,
                chain_cert_id,
                student_name,
                student_email,
                student_wallet,
                grade,
                status,
                created_at,
                tx_id,
                metadata_uri,
                metadata_hash,
                courses:id_course (
                    id_course,
                    title,
                    course_code,
                    description,
                    duration,
                    hours_duration
                ),
                academies:id_academy (
                    id_academy,
                    legal_name,
                    stacks_address,
                    website
                )
            `)
            .eq("chain_cert_id", chainCertId)
            .maybeSingle();

        console.log("getCertificateByChainId data:", JSON.stringify(data, null, 2));
        if (error) {
            console.error("Error getting certificate by chain ID:", error);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Error in getCertificateByChainId:", error);
        return null;
    }
}

/**
 * Get total statistics from database
 */
export async function getDatabaseStatistics() {
    try {
        const supabase = await createClient();

        // Count total certificates
        const { count: totalCerts, error: certsError } = await supabase
            .from("certificates")
            .select("*", { count: "exact", head: true });

        // Count total academies
        const { count: totalAcademies, error: academiesError } = await supabase
            .from("academies")
            .select("*", { count: "exact", head: true })
            .eq("validation_status", "approved");

        // Count total students with certificates
        const { data: uniqueStudents, error: studentsError } = await supabase
            .from("certificates")
            .select("student_wallet")
            .not("student_wallet", "is", null);

        if (certsError || academiesError || studentsError) {
            console.error("Error getting statistics");
            return {
                totalCertificates: 0,
                totalAcademies: 0,
                totalStudents: 0,
            };
        }

        const uniqueStudentCount = uniqueStudents
            ? new Set(uniqueStudents.map((s) => s.student_wallet)).size
            : 0;

        return {
            totalCertificates: totalCerts || 0,
            totalAcademies: totalAcademies || 0,
            totalStudents: uniqueStudentCount,
        };
    } catch (error) {
        console.error("Error in getDatabaseStatistics:", error);
        return {
            totalCertificates: 0,
            totalAcademies: 0,
            totalStudents: 0,
        };
    }
}
