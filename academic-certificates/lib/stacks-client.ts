"use client";

import { openContractCall } from '@stacks/connect';
import {
    AnchorMode,
    PostConditionMode,
    stringAsciiCV,
    principalCV,
    uintCV,
    cvToJSON,
    fetchCallReadOnlyFunction,
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

// Configuración del contrato - DEBES CAMBIAR ESTOS VALORES
// Para obtener estos valores:
// 1. Despliega el contrato nft.clar usando Clarinet o Hiro Platform
// 2. Usa la dirección donde se desplegó el contrato
// 3. Asegúrate de usar la red correcta (testnet/mainnet)

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "ST15Z41T89K34CD6Q1N8DX2VZGCP50ATNAHPFXMBV";
const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || "nft";
const NETWORK = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;

/**
 * Registra una nueva academia en el sistema (Cliente)
 * Solo el super-admin puede ejecutar esta función
 */
export async function registerSchoolClient(
    schoolPrincipal: string,
    schoolName: string
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
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
            onFinish: (data: any) => {
                console.log('Transaction submitted:', data);
            },
            onCancel: () => {
                console.log('Transaction cancelled');
            },
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error registering school:', error);
        throw new Error(`Error al registrar la academia: ${error}`);
    }
}

/**
 * Desactiva una academia (Cliente)
 * Solo el super-admin puede ejecutar esta función
 */
export async function deactivateSchoolClient(schoolPrincipal: string) {
    try {
        const txOptions = {
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'deactivate-school',
            functionArgs: [principalCV(schoolPrincipal)],
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
            onFinish: (data: any) => {
                console.log('Transaction submitted:', data);
            },
            onCancel: () => {
                console.log('Transaction cancelled');
            },
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error deactivating school:', error);
        throw new Error(`Error al desactivar la academia: ${error}`);
    }
}

/**
 * Cambia el super administrador del sistema (Cliente)
 * Solo el super-admin actual puede ejecutar esta función
 */
export async function changeSuperAdminClient(newAdminAddress: string) {
    try {
        const txOptions = {
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'change-super-admin',
            functionArgs: [principalCV(newAdminAddress)],
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
            onFinish: (data: any) => {
                console.log('Transaction submitted:', data);
            },
            onCancel: () => {
                console.log('Transaction cancelled');
            },
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error changing super admin:', error);
        throw new Error(`Error al cambiar el super administrador: ${error}`);
    }
}

/**
 * Emite un certificado a un estudiante (Cliente)
 * Solo las academias autorizadas pueden ejecutar esta función
 */
export async function issueCertificateClient(
    studentId: string,
    course: string,
    grade: string,
    studentWallet: string
) {
    try {
        const txOptions = {
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'issue-certificate',
            functionArgs: [
                stringAsciiCV(studentId),
                stringAsciiCV(course),
                stringAsciiCV(grade),
                principalCV(studentWallet)
            ],
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
            onFinish: (data: any) => {
                console.log('Certificate transaction submitted:', data);
            },
            onCancel: () => {
                console.log('Certificate transaction cancelled');
            },
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error issuing certificate:', error);
        throw new Error(`Error al emitir certificado: ${error}`);
    }
}

/**
 * Obtiene información de una academia específica
 */
export async function getSchoolInfoClient(schoolPrincipal: string) {
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
export async function getSuperAdminClient() {
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
export async function getTotalCertificatesClient() {
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
export async function getSchoolCertificatesClient(schoolPrincipal: string) {
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
 * Obtiene detalles de un certificado específico por su ID
 */
export async function getCertificateClient(certId: number) {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-certificate',
            functionArgs: [uintCV(certId)],
            network: NETWORK,
            senderAddress: CONTRACT_ADDRESS,
        });

        return cvToJSON(result);
    } catch (error) {
        console.error('Error getting certificate:', error);
        throw new Error(`Error al obtener certificado: ${error}`);
    }
}

/**
 * Obtiene todos los certificados de un estudiante específico
 */
export async function getStudentCertificatesClient(studentWallet: string) {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-student-certificates',
            functionArgs: [principalCV(studentWallet)],
            network: NETWORK,
            senderAddress: CONTRACT_ADDRESS,
        });

        return cvToJSON(result);
    } catch (error) {
        console.error('Error getting student certificates:', error);
        throw new Error(`Error al obtener certificados del estudiante: ${error}`);
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

export interface CertificateDetails {
    'school-id': string;
    'student-id': string;
    'course': string;
    'grade': string;
    'student-wallet': string;
}

export interface AdminStats {
    totalCertificates: number;
    superAdmin: string;
}

/**
 * Función helper para obtener estadísticas generales del sistema
 */
export async function getSystemStatsClient(): Promise<AdminStats> {
    try {
        const [totalCerts, superAdmin] = await Promise.all([
            getTotalCertificatesClient(),
            getSuperAdminClient()
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