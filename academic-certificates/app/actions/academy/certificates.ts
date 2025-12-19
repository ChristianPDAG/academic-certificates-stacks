"use server";
import { createClient } from "@/lib/supabase/server";
import { getAcademyCredits, deductAcademyCredit } from "./credits";
import { getAcademyCredentials, getAcademyIdByUserId } from "./credentials";
import { uploadCourseMetadata } from "./courses";

export async function issueCertificateAction(
    userId: string,
    studentWallet: string,
    studentName: string,
    studentIdentifier: string, // DNI, RUT, Passport, etc.
    studentEmail: string, // Para buscar id_user
    grade: string | null,
    graduationDate: number,
    expirationHeight: number | null, // Block height de vencimiento (opcional)
    courseId: string,
    editableCourseData: {
        title: string;
        description?: string;
        category?: string;
        skills?: string;
        hours?: string;
        modality?: string;
        instructor_name?: string;
    }
): Promise<{ success: boolean; txid: string; urlTransaction: string; verificationCode: string; certificateId: string }> {
    try {
        // Get academy credentials
        const { privateKey, stacksAddress, name: academyName } = await getAcademyCredentials(userId);
        const academyId = await getAcademyIdByUserId(userId);

        // Check credits
        const credits = await getAcademyCredits(userId);
        if (credits < 1) {
            throw new Error("Créditos insuficientes");
        }

        // Parse skills from comma-separated string to array
        const skillsArray = editableCourseData.skills
            ? editableCourseData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
            : [];

        // Upload metadata to Storage and get URL + hash + verification code
        const { metadataUrl, hash, verificationCode } = await uploadCourseMetadata(
            academyId,
            {
                id: courseId,
                title: editableCourseData.title,
                description: editableCourseData.description,
                category: editableCourseData.category,
                skills: skillsArray.length > 0 ? skillsArray : undefined,
                hours: editableCourseData.hours ? parseInt(editableCourseData.hours) : undefined,
                modality: editableCourseData.modality,
                instructor_name: editableCourseData.instructor_name,
            },
            {
                name: studentName,
                identifier: studentIdentifier,
                wallet: studentWallet,
                grade: grade || undefined,
                graduationDate,
            },
            {
                name: academyName,
                department: undefined // Can be added later
            }
        );

        // Import function from stacks-academy
        const { issueCertificateWithPrivateKey } = await import("@/lib/stacks/academy/certificates-manager");

        // Issue certificate on blockchain with metadata URL and hash
        const result = await issueCertificateWithPrivateKey(
            studentWallet,
            grade,
            graduationDate,
            expirationHeight, // Pasar el block height de vencimiento
            metadataUrl,
            hash, // Use the SHA-256 hash of the JSON
            privateKey
        );
        console.log("Certificate issued on blockchain:", result);
        // Deduct credit from DB
        await deductAcademyCredit(academyId);

        // Get student user_id from email (if exists)
        const supabase = await createClient();
        let studentUserId = null;
        if (studentEmail) {
            const { data: studentData } = await supabase
                .from("users")
                .select("id_user")
                .eq("email", studentEmail)
                .eq("role", "student")
                .maybeSingle();

            studentUserId = studentData?.id_user || null;
        }

        // Save certificate record in database
        const { data: certificateRecord, error: certError } = await supabase
            .from("certificates")
            .insert({
                id_course: courseId,
                id_academy: academyId,
                id_user: studentUserId,
                student_name: studentName,
                student_email: studentEmail || null,
                student_wallet: studentWallet,
                grade: grade,
                verification_code: verificationCode,
                metadata_uri: metadataUrl,
                metadata_hash: hash,
                chain_cert_id: result.certificateId, // Se puede actualizar después si la blockchain devuelve un ID
                tx_id: result.txid,
                status: 'issued',
            })
            .select('id_certificate')
            .single();

        if (certError) {
            console.error("Error saving certificate to database:", certError);
            // No lanzar error aquí para no fallar la emisión si blockchain fue exitoso
        }

        return {
            ...result,
            verificationCode,
            certificateId: certificateRecord?.id_certificate || '',
        };
    } catch (error: any) {
        console.error("Error issuing certificate:", error);
        throw new Error(error.message || "Error al emitir certificado");
    }
}

export async function revokeCertificateAction(
    userId: string,
    certId: number
): Promise<{ success: boolean; txid: string; urlTransaction: string }> {
    try {
        const { privateKey } = await getAcademyCredentials(userId);
        const { revokeCertificateWithPrivateKey } = await import("@/lib/stacks/academy/certificates-manager");

        const result = await revokeCertificateWithPrivateKey(certId, privateKey);
        return result;
    } catch (error: any) {
        console.error("Error revoking certificate:", error);
        throw new Error(error.message || "Error al revocar certificado");
    }
}

export async function reactivateCertificateAction(
    userId: string,
    certId: number
): Promise<{ success: boolean; txid: string; urlTransaction: string }> {
    try {
        const { privateKey } = await getAcademyCredentials(userId);
        const { reactivateCertificateWithPrivateKey } = await import("@/lib/stacks/academy/certificates-manager");

        const result = await reactivateCertificateWithPrivateKey(certId, privateKey);
        return result;
    } catch (error: any) {
        console.error("Error reactivating certificate:", error);
        throw new Error(error.message || "Error al reactivar certificado");
    }
}

/**
 * Obtiene todos los certificados emitidos por una academia específica
 */
export async function getCertificatesByAcademy(userId: string) {
    try {
        const academyId = await getAcademyIdByUserId(userId);
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("certificates")
            .select(`
                id_certificate,
                id_course,
                id_academy,
                id_user,
                student_name,
                student_email,
                student_wallet,
                grade,
                verification_code,
                metadata_uri,
                metadata_hash,
                chain_cert_id,
                tx_id,
                status,
                created_at,
                updated_at,
                id_course:courses(title, category)
            `)
            .eq("id_academy", academyId)
            .order("created_at", { ascending: false });
        if (error) {
            throw new Error(error.message);
        }

        return data || [];
    } catch (error: any) {
        console.error("Error fetching certificates:", error);
        throw new Error(error.message || "Error al obtener certificados");
    }
}

/**
 * Actualiza el estado de un certificado en la base de datos después de revocar/reactivar
 */
export async function updateCertificateStatus(
    certificateId: string,
    status: "issued" | "revoked"
): Promise<void> {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from("certificates")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id_certificate", certificateId);

        if (error) {
            throw new Error(error.message);
        }
    } catch (error: any) {
        console.error("Error updating certificate status:", error);
        throw new Error(error.message || "Error al actualizar estado del certificado");
    }
}

/**
 * Revoca múltiples certificados en lote
 */
export async function bulkRevokeCertificates(
    userId: string,
    certIds: number[]
): Promise<{ success: number; failed: number; errors: string[] }> {
    const { privateKey } = await getAcademyCredentials(userId);
    const { revokeCertificateWithPrivateKey } = await import("@/lib/stacks/academy/certificates-manager");

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const certId of certIds) {
        try {
            await revokeCertificateWithPrivateKey(certId, privateKey);
            success++;
        } catch (error: any) {
            failed++;
            errors.push(`Certificado #${certId}: ${error.message}`);
        }
    }

    return { success, failed, errors };
}

/**
 * Reactiva múltiples certificados en lote
 */
export async function bulkReactivateCertificates(
    userId: string,
    certIds: number[]
): Promise<{ success: number; failed: number; errors: string[] }> {
    const { privateKey } = await getAcademyCredentials(userId);
    const { reactivateCertificateWithPrivateKey } = await import("@/lib/stacks/academy/certificates-manager");

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const certId of certIds) {
        try {
            await reactivateCertificateWithPrivateKey(certId, privateKey);
            success++;
        } catch (error: any) {
            failed++;
            errors.push(`Certificado #${certId}: ${error.message}`);
        }
    }

    return { success, failed, errors };
}

/**
 * Sincroniza el estado de un certificado con la blockchain
 * Compara el estado en la BD con el estado en blockchain y actualiza si es necesario
 */
export async function syncCertificateStatus(certificateId: string, chainCertId: number): Promise<{
    synced: boolean;
    blockchainStatus: "active" | "revoked" | "not_found";
    updated: boolean;
}> {
    try {
        const { isCertificateValid } = await import("@/lib/stacks/academy/certificates-manager");

        // Obtener estado desde blockchain
        const blockchainCert = await isCertificateValid(chainCertId);
        console.log("Blockchain certificate details:", blockchainCert);

        const blockchainStatus = blockchainCert ? "active" : "revoked";
        const dbStatus = blockchainStatus === "revoked" ? "revoked" : "issued";

        // Obtener estado actual de la BD
        const supabase = await createClient();
        const { data: currentCert, error: fetchError } = await supabase
            .from("certificates")
            .select("status")
            .eq("id_certificate", certificateId)
            .single();

        if (fetchError) {
            throw new Error(fetchError.message);
        }

        // Si no coinciden, actualizar BD
        if (currentCert.status !== dbStatus) {
            await updateCertificateStatus(certificateId, dbStatus as "issued" | "revoked");
            return {
                synced: true,
                blockchainStatus,
                updated: true
            };
        }

        return {
            synced: true,
            blockchainStatus,
            updated: false
        };
    } catch (error: any) {
        console.error("Error syncing certificate status:", error);
        throw new Error(error.message || "Error al sincronizar estado del certificado");
    }
}
