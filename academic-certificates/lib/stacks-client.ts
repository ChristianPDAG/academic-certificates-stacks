"use client";

import { openContractCall } from '@stacks/connect';
import {
    AnchorMode,
    PostConditionMode,
    stringAsciiCV,
    principalCV,
    uintCV,
    cvToValue,
    fetchCallReadOnlyFunction,
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';



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

        // Usar cvToValue para convertir directamente a valores JavaScript
        const schoolData = cvToValue(result);

        // Si schoolData existe, retornar en el formato esperado
        if (schoolData) {
            return {
                value: {
                    'school-name': schoolData.value['school-name'].value,
                    'active': schoolData.active
                }
            };
        }

        return null;
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

        const adminValue = cvToValue(result);
        return { value: adminValue };
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

        const totalValue = cvToValue(result);
        return { value: totalValue };
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

        const certificatesValue = cvToValue(result);
        return { value: certificatesValue };
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

        const certificateValue = cvToValue(result);
        return { value: certificateValue };
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

        const certificatesValue = cvToValue(result);
        return { value: certificatesValue };
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

/**
 * Transfiere STX a una dirección específica
 * @param recipientAddress - Dirección del destinatario
 * @param amountSTX - Cantidad en STX (se convertirá a microSTX internamente)
 */
export async function transferSTXClient(
    recipientAddress: string,
    amountSTX: number
): Promise<any> {
    try {
        const { openSTXTransfer } = await import('@stacks/connect');

        // Convertir STX a microSTX (1 STX = 1,000,000 microSTX)
        const amountMicroSTX = BigInt(Math.floor(amountSTX * 1_000_000));

        const txOptions = {
            recipient: recipientAddress,
            amount: amountMicroSTX,
            network: NETWORK,
            anchorMode: AnchorMode.Any,

        };

        return await openSTXTransfer(txOptions);
    } catch (error) {
        console.error('Error transferring STX:', error);
        throw new Error(`Error al transferir STX: ${error}`);
    }
}

/**
 * Obtiene la URL de la API según la red configurada
 */
function getApiUrl(): string {
    // NETWORK es StacksTestnet o StacksMainnet
    if (process.env.NEXT_PUBLIC_NETWORK === 'mainnet') {
        return 'https://api.mainnet.hiro.so';
    }
    return 'https://api.testnet.hiro.so';
}

/**
 * Obtiene el balance STX de una dirección específica
 * @param address - Dirección de Stacks a consultar
 * @returns Balance en STX (no microSTX)
 */
export async function getAddressBalanceClient(address: string): Promise<number> {
    try {
        const apiUrl = getApiUrl();
        const url = `${apiUrl}/extended/v1/address/${address}/balances`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error fetching balance: ${response.statusText}`);
        }

        const data = await response.json();
        const microSTX = BigInt(data.stx.balance || '0');
        const stx = Number(microSTX) / 1_000_000;
        return stx;
    } catch (error) {
        console.error("Error getting address balance:", error);
        return 0;
    }
}

// ========================================
// FUNCIONES PARA EL CONTRATO REGISTRY
// ========================================

const REGISTRY_CONTRACT_ADDRESS = "ST15Z41T89K34CD6Q1N8DX2VZGCP50ATNAHPFXMBV";
const REGISTRY_CONTRACT_NAME = "registry";

/**
 * Establece el manager activo en el registry (Cliente)
 * Solo el super-admin puede ejecutar esta función
 */
export async function setActiveManagerClient(newManager: string) {
    try {
        const txOptions = {
            contractAddress: REGISTRY_CONTRACT_ADDRESS,
            contractName: REGISTRY_CONTRACT_NAME,
            functionName: 'set-active-manager',
            functionArgs: [principalCV(newManager)],
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error setting active manager:', error);
        throw new Error(`Error al establecer el manager activo: ${error}`);
    }
}

/**
 * Obtiene el manager activo del registry (Read-only)
 */
export async function getActiveManagerClient(): Promise<string> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: REGISTRY_CONTRACT_ADDRESS,
            contractName: REGISTRY_CONTRACT_NAME,
            functionName: 'get-active-manager',
            functionArgs: [],
            network: NETWORK,
            senderAddress: REGISTRY_CONTRACT_ADDRESS,
        });
        console.log("Result from getActiveManagerClient:", result);
        const managerPrincipal = cvToValue(result);
        console.log("Decoded manager principal:", managerPrincipal);
        return managerPrincipal || "";
    } catch (error) {
        console.error("Error getting active manager:", error);
        throw new Error(`Error al obtener el manager activo: ${error}`);
    }
}

/**
 * Cambia el super administrador del registry (Cliente)
 * Solo el super-admin actual puede ejecutar esta función
 */
export async function changeSuperAdminRegistryClient(newAdmin: string) {
    try {
        const txOptions = {
            contractAddress: REGISTRY_CONTRACT_ADDRESS,
            contractName: REGISTRY_CONTRACT_NAME,
            functionName: 'change-super-admin',
            functionArgs: [principalCV(newAdmin)],
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error changing super admin in registry:', error);
        throw new Error(`Error al cambiar el super admin del registry: ${error}`);
    }
}

/**
 * Obtiene el super admin del registry (Read-only)
 */
export async function getSuperAdminRegistryClient(): Promise<string> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: REGISTRY_CONTRACT_ADDRESS,
            contractName: REGISTRY_CONTRACT_NAME,
            functionName: 'get-super-admin',
            functionArgs: [],
            network: NETWORK,
            senderAddress: REGISTRY_CONTRACT_ADDRESS,
        });

        const adminPrincipal = cvToValue(result);
        return adminPrincipal || "";
    } catch (error) {
        console.error("Error getting super admin:", error);
        throw new Error(`Error al obtener el super admin: ${error}`);
    }
}


// ========================================
// FUNCIONES PARA CERTIFICATE-MANAGER-V1
// ========================================

const MANAGER_CONTRACT_ADDRESS = "ST15Z41T89K34CD6Q1N8DX2VZGCP50ATNAHPFXMBV";
const MANAGER_CONTRACT_NAME = "certificate-manager-v1";

// ---------- GESTIÓN DE ESCUELAS ----------

export async function addSchoolManagerClient(
    schoolPrincipal: string,
    name: string,
    metadataUrl: string
) {
    try {
        const txOptions = {
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'add-school',
            functionArgs: [
                principalCV(schoolPrincipal),
                stringAsciiCV(name),
                stringAsciiCV(metadataUrl)
            ],
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error adding school:', error);
        throw new Error(`Error al agregar escuela: ${error}`);
    }
}

export async function deactivateSchoolManagerClient(schoolPrincipal: string) {
    try {
        const txOptions = {
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'deactivate-school',
            functionArgs: [principalCV(schoolPrincipal)],
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error deactivating school:', error);
        throw new Error(`Error al desactivar escuela: ${error}`);
    }
}

export async function reactivateSchoolManagerClient(schoolPrincipal: string) {
    try {
        const txOptions = {
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'reactivate-school',
            functionArgs: [principalCV(schoolPrincipal)],
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error reactivating school:', error);
        throw new Error(`Error al reactivar escuela: ${error}`);
    }
}

export async function verifySchoolManagerClient(schoolPrincipal: string) {
    try {
        const txOptions = {
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'verify-school',
            functionArgs: [principalCV(schoolPrincipal)],
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error verifying school:', error);
        throw new Error(`Error al verificar escuela: ${error}`);
    }
}

export async function unverifySchoolManagerClient(schoolPrincipal: string) {
    try {
        const txOptions = {
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'unverify-school',
            functionArgs: [principalCV(schoolPrincipal)],
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error unverifying school:', error);
        throw new Error(`Error al quitar verificación de escuela: ${error}`);
    }
}

export async function updateSchoolMetadataUrlManagerClient(
    schoolPrincipal: string,
    metadataUrl: string
) {
    try {
        const txOptions = {
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'update-school-metadata-url',
            functionArgs: [
                principalCV(schoolPrincipal),
                stringAsciiCV(metadataUrl)
            ],
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error updating school metadata URL:', error);
        throw new Error(`Error al actualizar metadata URL: ${error}`);
    }
}

export async function getSchoolInfoManagerClient(schoolPrincipal: string) {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'get-school-info',
            functionArgs: [principalCV(schoolPrincipal)],
            network: NETWORK,
            senderAddress: MANAGER_CONTRACT_ADDRESS,
        });

        const schoolData = cvToValue(result);
        return schoolData;
    } catch (error) {
        console.error("Error getting school info:", error);
        return null;
    }
}

// ---------- SISTEMA DE CRÉDITOS ----------

export async function adminFundSchoolManagerClient(
    schoolPrincipal: string,
    credits: number
) {
    try {
        const txOptions = {
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'admin-fund-school',
            functionArgs: [
                principalCV(schoolPrincipal),
                uintCV(credits)
            ],
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error funding school:', error);
        throw new Error(`Error al fondear escuela: ${error}`);
    }
}

export async function setStxPerCreditManagerClient(newAmount: number) {
    try {
        const txOptions = {
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'set-stx-per-credit',
            functionArgs: [uintCV(newAmount)],
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error setting STX per credit:', error);
        throw new Error(`Error al establecer precio por crédito: ${error}`);
    }
}

export async function getSchoolCreditsManagerClient(schoolPrincipal: string): Promise<number> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'get-school-credits',
            functionArgs: [principalCV(schoolPrincipal)],
            network: NETWORK,
            senderAddress: MANAGER_CONTRACT_ADDRESS,
        });

        const credits = cvToValue(result);
        return Number(credits) || 0;
    } catch (error) {
        console.error("Error getting school credits:", error);
        return 0;
    }
}

export async function getStxPerCreditManagerClient(): Promise<number> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'get-stx-per-credit',
            functionArgs: [],
            network: NETWORK,
            senderAddress: MANAGER_CONTRACT_ADDRESS,
        });

        const price = cvToValue(result);
        return Number(price) || 0;
    } catch (error) {
        console.error("Error getting STX per credit:", error);
        return 0;
    }
}

// ---------- GESTIÓN DE CERTIFICADOS ----------

export async function revokeCertificateManagerClient(certId: number) {
    try {
        const txOptions = {
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'revoke-certificate',
            functionArgs: [uintCV(certId)],
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error revoking certificate:', error);
        throw new Error(`Error al revocar certificado: ${error}`);
    }
}

export async function reactivateCertificateManagerClient(certId: number) {
    try {
        const txOptions = {
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'reactivate-certificate',
            functionArgs: [uintCV(certId)],
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error reactivating certificate:', error);
        throw new Error(`Error al reactivar certificado: ${error}`);
    }
}

export async function getTotalCertificatesManagerClient(): Promise<number> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'get-total-certificates',
            functionArgs: [],
            network: NETWORK,
            senderAddress: MANAGER_CONTRACT_ADDRESS,
        });

        const total = cvToValue(result);
        return Number(total) || 0;
    } catch (error) {
        console.error("Error getting total certificates:", error);
        return 0;
    }
}

export async function getCertificateManagerClient(certId: number) {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'get-certificate',
            functionArgs: [uintCV(certId)],
            network: NETWORK,
            senderAddress: MANAGER_CONTRACT_ADDRESS,
        });

        const certData = cvToValue(result);
        return certData;
    } catch (error) {
        console.error("Error getting certificate:", error);
        return null;
    }
}

export async function isCertificateValidManagerClient(certId: number): Promise<boolean> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'is-certificate-valid',
            functionArgs: [uintCV(certId)],
            network: NETWORK,
            senderAddress: MANAGER_CONTRACT_ADDRESS,
        });

        const isValid = cvToValue(result);
        return isValid?.value === true;
    } catch (error) {
        console.error("Error checking certificate validity:", error);
        return false;
    }
}