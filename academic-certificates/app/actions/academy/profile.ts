"use server";
import { createClient } from "@/lib/supabase/server";

export async function getAcademyProfile(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("academies")
        .select("*")
        .eq("owner_user_id", userId)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function updateAcademyProfile(userId: string, profileData: {
    legal_name: string;
    institution_type: string;
    registration_id: string;
    contact_person_name: string;
    contact_person_email: string;
    contact_academy_email: string;
    website: string;
    country?: number;
    region_state?: number;
    city?: number;
}) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("academies")
        .update({
            legal_name: profileData.legal_name,
            institution_type: profileData.institution_type,
            registration_id: profileData.registration_id,
            contact_person_name: profileData.contact_person_name,
            contact_person_email: profileData.contact_person_email,
            contact_academy_email: profileData.contact_academy_email,
            website: profileData.website,
            country: profileData.country,
            region_state: profileData.region_state,
            city: profileData.city,
            updated_at: new Date().toISOString(),
        })
        .eq("owner_user_id", userId)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}