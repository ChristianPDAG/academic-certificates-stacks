"use server";
import { createClient } from "@/lib/supabase/server";
import { decryptPrivateKey } from "@/utils/cryptoUtils";


export async function getAcademyCredentials(id: string): Promise<{
    stacksAddress: string;
    privateKey: string;
    name: string;
}> {
    const supabase = await createClient();
    const { data, error }: { data: any; error: any; } = await supabase
        .from("academies")
        .select("stacks_key, stacks_address, legal_name")
        .eq("owner_user_id", id)
        .maybeSingle();
    if (error) {
        console.log("Error fetching academy credentials:", error);
        throw new Error(error.message);
    }

    const decryptedPrivateKey = decryptPrivateKey(data.stacks_key);
    return { stacksAddress: data.stacks_address, privateKey: decryptedPrivateKey, name: data.legal_name };
}

export async function getStudentWallet(email: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("users")
        .select("stacks_address, id_user, full_name")
        .eq("role", "student")
        .eq("email", email)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data || null;
}


export async function getAcademyIdByUserId(userId: string): Promise<string> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("academies")
        .select("id_academy")
        .eq("owner_user_id", userId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data.id_academy;
}
