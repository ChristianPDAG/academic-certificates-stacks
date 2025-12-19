"use server";
import { createClient } from "@/lib/supabase/server";

export async function getStudentWallet(email: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("users")
        .select("stacks_address, id_user, nombre")
        .eq("role", "student")
        .eq("email", email)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data || null;
}