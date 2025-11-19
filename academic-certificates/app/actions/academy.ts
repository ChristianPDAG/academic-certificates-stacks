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
        .from("users")
        .select("private_key, stacks_address, nombre ")
        .eq("role", "academy")
        .eq("id_user", id)
        .maybeSingle();
    if (error) {
        throw new Error(error.message);
    }

    const decryptedPrivateKey = decryptPrivateKey(data.private_key);
    return { stacksAddress: data.stacks_address, privateKey: decryptedPrivateKey, name: data.nombre };
}

export async function getStudentWallet(email: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("users")
        .select("stacks_address, id, nombre")
        .eq("role", "student")
        .eq("email", email)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data || null;
}