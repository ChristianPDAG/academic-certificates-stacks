"use server"
import { createClient } from '@/lib/supabase/server';

export async function login() {
    const supabase = await createClient();
    // Update this route to redirect to an authenticated route. The user already has an active session.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not found");
    const { data, error: userFetchError } = await supabase.from('users').select().eq('email', user.email).single();
    if (userFetchError) throw userFetchError;
    console.log("Logged in user:", data.email);
    return data;
}