"use server";
import { createClient } from "@/lib/supabase/server";
import { Course, CourseFormData } from "@/types/course";
import crypto from "crypto";
import { generateVerificationCode, generateSalt, hashIdentifier } from "@/utils/certificateUtils";
import { pinata } from "@/utils/config";

export async function uploadCourseMetadata(
    academyId: string,
    courseData: {
        id: string;
        title: string;
        description?: string;
        category?: string;
        skills?: string[];
        hours?: number;
        modality?: string;
        instructor_name?: string;
    },
    studentData: {
        name: string;
        identifier: string; // DNI, RUT, ID, etc.
        wallet: string;
        grade?: string;
        graduationDate: number;
    },
    academyData: {
        name: string;
        department?: string;
    }
) {
    const supabase = await createClient();

    // Generate verification code and salt
    const verificationCode = generateVerificationCode(6);
    const salt = generateSalt();

    // Create identifier hash (DNI + verification code + salt)
    const identifierHash = hashIdentifier(
        studentData.identifier,
        verificationCode,
        salt
    );

    // Create secure metadata JSON object (NO private info)
    const metadata = {
        version: "1.0",
        certificate: {
            title: courseData.title,
            description: courseData.description || null,
            modality: courseData.modality || null,
            hours: courseData.hours || null,
            issue_date_iso: new Date().toISOString(),
            language: "es-ES"
        },
        recipient: {
            name: studentData.name,
            identifier_hash: identifierHash,
            identifier_salt: salt
        },
        issuer: {
            name: academyData.name,
            department: academyData.department || null,
            instructors: courseData.instructor_name ? [courseData.instructor_name] : [],
            authorization_id: `CERT-${academyId.substring(0, 8).toUpperCase()}-${Date.now()}`
        },
        achievement: {
            skills_acquired: courseData.skills || [],
            grade: studentData.grade || null,
            category: courseData.category || null
        }
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(metadata, null, 2);

    // Calculate SHA-256 hash
    const hash = crypto.createHash('sha256').update(jsonString).digest('hex');

    // Generate filename: academy_timestamp_hash.json
    const timestamp = Date.now();
    const fileName = `certificates/${academyId}/${timestamp}_${hash.substring(0, 8)}.json`;

    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], `${fileName.split('/').pop()}`, { type: 'application/json' });

    // Upload to Pinata
    const { cid } = await pinata.upload.public.file(file);
    const urlData = await pinata.gateways.public.convert(cid);
    return {
        metadataUrl: urlData,
        hash: hash,
        metadata: metadata,
        fileName: fileName,
        verificationCode: verificationCode, // Return this to store in DB
        identifierHash: identifierHash,
    };
}

export async function getCoursesByAcademy(academyId: string): Promise<Course[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id_academy", academyId)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data || [];
}

export async function createCourse(
    academyId: string,
    courseData: CourseFormData
): Promise<Course> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("courses")
        .insert({
            id_academy: academyId,
            title: courseData.title,
            description: courseData.description || null,
            category: courseData.category || null,
            skills: courseData.skills || null,
            hours: courseData.hours || null,
            modality: courseData.modality || null,
            template_image_url: courseData.template_image_url || null,
            instructor_name: courseData.instructor_name || null,
            is_active: true,
        })
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function updateCourse(
    courseId: string,
    courseData: CourseFormData
): Promise<Course> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("courses")
        .update({
            title: courseData.title,
            description: courseData.description || null,
            category: courseData.category || null,
            skills: courseData.skills || null,
            hours: courseData.hours || null,
            modality: courseData.modality || null,
            template_image_url: courseData.template_image_url || null,
            instructor_name: courseData.instructor_name || null,
            updated_at: new Date().toISOString(),
        })
        .eq("id_course", courseId)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function toggleCourseStatus(courseId: string): Promise<Course> {
    const supabase = await createClient();

    // First get the current status
    const { data: currentCourse, error: fetchError } = await supabase
        .from("courses")
        .select("is_active")
        .eq("id_course", courseId)
        .single();

    if (fetchError) {
        throw new Error(fetchError.message);
    }

    // Toggle the status
    const { data, error } = await supabase
        .from("courses")
        .update({
            is_active: !currentCourse.is_active,
            updated_at: new Date().toISOString(),
        })
        .eq("id_course", courseId)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function deleteCourse(courseId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id_course", courseId);

    if (error) {
        throw new Error(error.message);
    }
}