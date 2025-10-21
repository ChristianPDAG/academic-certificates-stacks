"use server";

import { openContractCall } from '@stacks/connect';
import {
    AnchorMode,
    PostConditionMode,
    stringAsciiCV,
    principalCV,
    cvToJSON,
    fetchCallReadOnlyFunction,
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';



const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "ST15Z41T89K34CD6Q1N8DX2VZGCP50ATNAHPFXMBV";
const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || "nft";
const NETWORK = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;

/**
 * Registra una nueva academia en el sistema
 * Solo el super-admin puede ejecutar esta función
 */
export async function registerSchool(
    schoolPrincipal: string,
    schoolName: string,
    senderAddress: string
) {
    try {
        const txOptions = {
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'add-school',
            functionArgs: [
                principalCV(schoolPrincipal),
                stringAsciiCV(schoolName)
            ],
            senderKey: senderAddress,
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error registering school:', error);
        throw new Error(`Error al registrar la academia: ${error}`);
    }
}

/**
 * Desactiva una academia
 * Solo el super-admin puede ejecutar esta función
 */
export async function deactivateSchool(
    schoolPrincipal: string,
    senderAddress: string
) {
    try {
        const txOptions = {
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'deactivate-school',
            functionArgs: [principalCV(schoolPrincipal)],
            senderKey: senderAddress,
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error deactivating school:', error);
        throw new Error(`Error al desactivar la academia: ${error}`);
    }
}

/**
 * Cambia el super administrador del sistema
 * Solo el super-admin actual puede ejecutar esta función
 */
export async function changeSuperAdmin(
    newAdminAddress: string,
    senderAddress: string
) {
    try {
        const txOptions = {
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'change-super-admin',
            functionArgs: [principalCV(newAdminAddress)],
            senderKey: senderAddress,
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error changing super admin:', error);
        throw new Error(`Error al cambiar el super administrador: ${error}`);
    }
}

/**
 * Obtiene información de una academia específica
 */
export async function getSchoolInfo(schoolPrincipal: string) {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-school-info',
            functionArgs: [principalCV(schoolPrincipal)],
            network: NETWORK,
            senderAddress: CONTRACT_ADDRESS,
        });

        return cvToJSON(result);
    } catch (error) {
        console.error('Error getting school info:', error);
        throw new Error(`Error al obtener información de la academia: ${error}`);
    }
}

/**
 * Obtiene la dirección del super administrador actual
 */
export async function getSuperAdmin() {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-super-admin',
            functionArgs: [],
            network: NETWORK,
            senderAddress: CONTRACT_ADDRESS,
        });

        return cvToJSON(result);
    } catch (error) {
        console.error('Error getting super admin:', error);
        throw new Error(`Error al obtener el super administrador: ${error}`);
    }
}

/**
 * Obtiene el total de certificados emitidos en el sistema
 */
export async function getTotalCertificates() {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-total-certificates',
            functionArgs: [],
            network: NETWORK,
            senderAddress: CONTRACT_ADDRESS,
        });

        return cvToJSON(result);
    } catch (error) {
        console.error('Error getting total certificates:', error);
        throw new Error(`Error al obtener el total de certificados: ${error}`);
    }
}

/**
 * Obtiene todos los certificados emitidos por una academia específica
 */
export async function getSchoolCertificates(schoolPrincipal: string) {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-school-certificates',
            functionArgs: [principalCV(schoolPrincipal)],
            network: NETWORK,
            senderAddress: CONTRACT_ADDRESS,
        });

        return cvToJSON(result);
    } catch (error) {
        console.error('Error getting school certificates:', error);
        throw new Error(`Error al obtener certificados de la academia: ${error}`);
    }
}

/**
 * Tipos de respuesta para mejor tipado en TypeScript
 */
export interface SchoolInfo {
    'school-name': string;
    active: boolean;
}

export interface CertificatesList {
    'certificate-ids': number[];
}

export interface AdminStats {
    totalCertificates: number;
    superAdmin: string;
}

/**
 * Función helper para obtener estadísticas generales del sistema
 */
export async function getSystemStats(): Promise<AdminStats> {
    try {
        const [totalCerts, superAdmin] = await Promise.all([
            getTotalCertificates(),
            getSuperAdmin()
        ]);

        return {
            totalCertificates: totalCerts.value || 0,
            superAdmin: superAdmin.value || ''
        };
    } catch (error) {
        console.error('Error getting system stats:', error);
        throw new Error(`Error al obtener estadísticas del sistema: ${error}`);
    }
}

/**
 * Obtiene la lista de usuarios con role "academy" desde Supabase
 * Retorna: email, name, stacks_address, role, created_at
 */
export async function getAcademyUsers() {
    try {
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('users')
            .select('email, nombre, stacks_address, role, created_at')
            .eq('role', 'academy')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching academy users:', error);
            throw new Error(`Error al obtener academias: ${error.message}`);
        }

        return data || [];
    } catch (error) {
        console.error('Error in getAcademyUsers:', error);
        throw new Error(`Error al obtener academias: ${error}`);
    }
}