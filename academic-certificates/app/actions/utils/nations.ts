"use server";
import { createClient } from "@/lib/supabase/server";


export async function getCitiesByState(stateId: number) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("cities")
        .select("id, name")
        .eq("id_state", stateId)
        .order("name");

    if (error) {
        throw new Error(error.message);
    }

    return data || [];
}
