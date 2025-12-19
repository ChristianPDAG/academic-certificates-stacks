import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import {
    stringAsciiCV,
    uintCV,
    ClarityValue,
    standardPrincipalCV,
    cvToValue,
    fetchCallReadOnlyFunction
} from '@stacks/transactions';
import { callContract } from '../utils';
import { env } from '@/config/env/env.client'

const MANAGER_CONTRACT_ADDRESS = env.CONTRACT_ADDRESS;
const MANAGER_CONTRACT_NAME = env.CONTRACT_NAME;
const NETWORK = env.NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;


async function getLastCertificateId(): Promise<number> {


    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'get-total-certificates',
            functionArgs: [],
            network: NETWORK,
            senderAddress: MANAGER_CONTRACT_ADDRESS
        });

        // Convertir ClarityValue a número
        const value = cvToValue(result);
        console.log("Total certificates from contract:", value);

        return typeof value === 'bigint' ? Number(value) : (typeof value === 'number' ? value : 0);
    } catch (error) {
        console.error("Error obteniendo total certificates:", error);
        return 0;
    }
}
// Función para emitir certificado con el nuevo contrato manager-v1

export async function issueCertificateWithPrivateKey(
    studentWallet: string,
    grade: string | null,
    graduationDate: number,
    expirationHeight: number | null,
    metadataUrl: string,
    dataHash: string,
    privateKey: string
): Promise<{ success: boolean; txid: string; urlTransaction: string; certificateId: number }> {
    try {
        // Obtener el próximo ID ANTES de emitir (respuesta instantánea)
        const nextCertificateId = (await getLastCertificateId()) + 1;

        const { someCV, noneCV, bufferCV, principalCV } = await import('@stacks/transactions');

        const functionArgs: ClarityValue[] = [
            principalCV(studentWallet),
            grade ? someCV(stringAsciiCV(grade)) : noneCV(),
            uintCV(graduationDate),
            expirationHeight ? someCV(uintCV(expirationHeight)) : noneCV(),
            stringAsciiCV(metadataUrl),
            bufferCV(Buffer.from(dataHash, 'hex'))
        ];

        const result = await callContract({
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'issue-certificate',
            functionArgs,
            privateKey,
            network: NETWORK
        });

        console.log("Result of issue-certificate:", result);
        const txid = result.txid;
        const urlTransaction = `https://explorer.hiro.so/txid/${txid}?chain=testnet`;

        // Devolver el ID predicho
        return { success: true, txid, urlTransaction, certificateId: nextCertificateId };
    } catch (error) {
        console.error("Error issuing certificate with private key:", error);
        throw error;
    }
}

// Función para revocar certificado con clave privada
export async function revokeCertificateWithPrivateKey(
    certId: number,
    privateKey: string
): Promise<{ success: boolean; txid: string; urlTransaction: string }> {
    try {
        const functionArgs: ClarityValue[] = [uintCV(certId)];

        const result = await callContract({
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'revoke-certificate',
            functionArgs,
            privateKey,
            network: NETWORK
        });

        const txid = result.txid;
        const urlTransaction = `https://explorer.hiro.so/txid/${txid}?chain=testnet`;
        return { success: true, txid, urlTransaction };
    } catch (error) {
        console.error("Error revoking certificate with private key:", error);
        throw error;
    }
}

// Función para reactivar certificado con clave privada
export async function reactivateCertificateWithPrivateKey(
    certId: number,
    privateKey: string
): Promise<{ success: boolean; txid: string; urlTransaction: string }> {

    try {
        const functionArgs: ClarityValue[] = [uintCV(certId)];

        const result = await callContract({
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'reactivate-certificate',
            functionArgs,
            privateKey,
            network: NETWORK
        });

        const txid = result.txid;
        const urlTransaction = `https://explorer.hiro.so/txid/${txid}?chain=testnet`;
        return { success: true, txid, urlTransaction };
    } catch (error) {
        console.error("Error reactivating certificate with private key:", error);
        throw error;
    }
}

// Exportar funciones de utilidad
export { stringAsciiCV, uintCV, standardPrincipalCV };

/**
 * Obtiene los detalles completos de un certificado desde la blockchain
 */
export async function getCertificateDetails(certId: number): Promise<{
    id: number;
    schoolId: string;
    studentWallet: string;
    grade: string | null;
    graduationDate: number;
    expirationHeight: number | null;
    metadataUrl: string;
    dataHash: string;
    revoked: boolean;
} | null> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'get-certificate',
            functionArgs: [uintCV(certId)],
            network: NETWORK,
            senderAddress: MANAGER_CONTRACT_ADDRESS
        });

        const value = cvToValue(result);

        if (!value || value.type === 'none') {
            return null;
        }

        const certData = value.value;

        return {
            id: certId,
            schoolId: certData['school-id'],
            studentWallet: certData['student-wallet'],
            grade: certData.grade || null,
            graduationDate: Number(certData['graduation-date']),
            expirationHeight: certData['expiration-height'] ? Number(certData['expiration-height']) : null,
            metadataUrl: certData['metadata-url'],
            dataHash: certData['data-hash'],
            revoked: certData.revoked
        };
    } catch (error) {
        console.error("Error getting certificate details:", error);
        throw error;
    }
}

/**
 * Verifica si un certificado es válido (no revocado y no expirado)
 */
export async function isCertificateValid(certId: number): Promise<boolean> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: MANAGER_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'is-certificate-valid',
            functionArgs: [uintCV(certId)],
            network: NETWORK,
            senderAddress: MANAGER_CONTRACT_ADDRESS
        });

        const value = cvToValue(result);
        return value === true || value?.value === true;
    } catch (error) {
        console.error("Error checking certificate validity:", error);
        return false;
    }
}