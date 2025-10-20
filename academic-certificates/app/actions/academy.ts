"use server";
import { createClient } from "@/lib/supabase/server";

export async function getAcademyCredentials(id: string): Promise<{
    stacksAddress: string;
    privateKey: string;
}> {
    console.log(id)
    const supabase = await createClient();
    console.log("Fetching academy credentials for ID:", id);
    const { data, error }: { data: any; error: any; } = await supabase
        .from("users")
        .select("private_key,stacks_address ")
        .eq("role", "academy")
        .eq("id_user", id)
        .maybeSingle();
    console.log(data);
    if (error) {
        throw new Error(error.message);
    }

    return { stacksAddress: data.stacks_address, privateKey: data.private_key };
}

export async function getStudentWallet(email: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("users")
        .select("stacks_address, id")
        .eq("role", "student")
        .eq("email", email)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data || null;
}