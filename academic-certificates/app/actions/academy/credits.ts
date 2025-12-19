"use server";
import { createClient } from "@/lib/supabase/server";


export async function deductAcademyCredit(academyId: string) {
    const supabase = await createClient();

    const { data: academy, error: fetchError } = await supabase
        .from("academies")
        .select("credits")
        .eq("id_academy", academyId)
        .single();

    if (fetchError) {
        throw new Error(fetchError.message);
    }

    if (academy.credits < 1) {
        throw new Error("Créditos insuficientes");
    }

    const { error: updateError } = await supabase
        .from("academies")
        .update({ credits: academy.credits - 1 })
        .eq("id_academy", academyId);

    if (updateError) {
        throw new Error(updateError.message);
    }

    return { success: true, remainingCredits: academy.credits - 1 };
}

export async function getAcademyCredits(userId: string): Promise<number> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("academies")
        .select("credits")
        .eq("owner_user_id", userId)
        .single();

    console.log("Academy credits:", data?.credits);
    if (error) {
        throw new Error(error.message);
    }
    return data?.credits || 0;
}