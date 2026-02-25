"use server";
import { createHash } from "crypto";
import { createClient } from '@/lib/supabase/server';
import { createWalletForUser, WalletServiceError } from '@/utils/walletApi';

export async function hashPasswordDeterministic(password: string) {
    return createHash("sha256").update(password).digest("hex");
}


export async function signup({ id, email, role, nombre }: { id: string, email: string, role: string, nombre: string }) {
    try {
        // 1. Obtain the current session JWT for authenticating with the wallet service
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
            console.error('No active session found during signup wallet creation');
            return { success: false, error: 'Authentication required to create wallet' };
        }


        // 3. Persist user/academy data in Supabase
        if (role === 'academy') {
            const { data, error: errorAcademy } = await supabase.from('academies').insert({
                legal_name: nombre,
                contact_academy_email: email,
                validation_status: 'pending',
                owner_user_id: id
            }).select().single();

            const { error } = await supabase.from('users').insert({
                email,
                role,
                full_name: nombre,
                id_user: id,
                id_academy: data?.id_academy,
                user_role_in_academy: 'owner'
            });
            if (error) {
                console.error('Error inserting user:', error);
                return { success: false, error: error.message };
            }
            if (errorAcademy) {
                console.error('Error inserting academy:', errorAcademy);
                return { success: false, error: errorAcademy.message };
            }
        } else {
            const { error } = await supabase.from('users').insert({
                email,
                role,
                full_name: nombre,
                id_user: id
            });
            if (error) {
                console.error('Error inserting user:', error);
                return { success: false, error: error.message };
            }
        }
        // 2. Create wallet via Wallet Generator Lambda (secure, KMS-backed)
        const walletResult = await createWalletForUser(session.access_token);
        const stacksAddress = walletResult.wallet.stacksAddress;

        return {
            success: true,
            wallet: {
                address: stacksAddress,
            }
        };
    } catch (error) {
        if (error instanceof WalletServiceError) {
            console.error(`Wallet service error (${error.statusCode}):`, error.message, error.details);
            return { success: false, error: 'Failed to create wallet. Please try again.' };
        }
        console.error('Error during signup:', error);
        return { success: false, error: 'Failed to create user account' };
    }
}