"use server";
import { createClient } from '@/lib/supabase/server';

export async function getAllAcademies() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('academies')
            .select(`
                id_academy,
                legal_name,
                contact_academy_email,
                stacks_address,
                credits,
                validation_status,
                created_at,
                disabled_at,
                owner_user_id
            `)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data || [];
    } catch (error: any) {
        console.error('Error in getAllAcademies:', error);
        throw new Error(error.message || 'Error al obtener academias');
    }
}

/**
 * Actualiza el estado de una academia (activar/desactivar) en BD
 * NOTA: Esta función solo actualiza la BD. La transacción blockchain debe ejecutarse primero desde el cliente.
 */
export async function updateAcademyStatusInDB(academyId: string, disabled: boolean) {
    try {
        const supabase = await createClient();

        const updateData: any = {
            disabled_at: disabled ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('academies')
            .update(updateData)
            .eq('id_academy', academyId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } catch (error: any) {
        console.error('Error in updateAcademyStatusInDB:', error);
        throw new Error(error.message || 'Error al actualizar el estado de la academia en BD');
    }
}
/**
 * Actualiza los créditos de una academia en BD
 * NOTA: Esta función solo actualiza la BD. La transacción blockchain debe ejecutarse primero desde el cliente.
 */
export async function updateAcademyCreditsInDB(academyId: string, creditsToAdd: number) {
    try {
        const supabase = await createClient();

        // Primero obtenemos los créditos actuales
        const { data: currentData, error: fetchError } = await supabase
            .from('academies')
            .select('credits')
            .eq('id_academy', academyId)
            .single();

        if (fetchError) {
            throw new Error(fetchError.message);
        }

        const currentCredits = currentData?.credits || 0;
        const newCredits = currentCredits + creditsToAdd;

        // Actualizamos con los nuevos créditos
        const { data, error } = await supabase
            .from('academies')
            .update({
                credits: newCredits,
                updated_at: new Date().toISOString(),
            })
            .eq('id_academy', academyId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } catch (error: any) {
        console.error('Error in updateAcademyCreditsInDB:', error);
        throw new Error(error.message || 'Error al actualizar los créditos en BD');
    }
}


/**
 * Actualiza el estado de validación de una academia
 */
export async function updateAcademyValidationStatus(
    academyId: string,
    status: 'pending' | 'approved' | 'rejected',
    adminNotes?: string
) {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('academies')
            .update({
                validation_status: status,
                admin_notes: adminNotes,
                approved_by_user_id: user?.id,
                updated_at: new Date().toISOString(),
            })
            .eq('id_academy', academyId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } catch (error: any) {
        console.error('Error in updateAcademyValidationStatus:', error);
        throw new Error(error.message || 'Error al actualizar el estado de validación');
    }
}