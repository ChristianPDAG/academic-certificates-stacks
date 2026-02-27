import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import {
    stringAsciiCV,
    uintCV,
    ClarityValue,
    standardPrincipalCV,
    cvToValue,
    fetchCallReadOnlyFunction
} from '@stacks/transactions';
import { callContract, buildUnsignedContractCall, broadcastSignedTransaction } from '../utils';
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

// ---------------------------------------------------------------------------
// Legacy functions (private-key based) — kept during migration
// ---------------------------------------------------------------------------

/** @deprecated Use {@link buildIssueCertificateTx} + Signer Lambda instead. */
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

        return { success: true, txid, urlTransaction, certificateId: nextCertificateId };
    } catch (error) {
        console.error("Error issuing certificate with private key:", error);
        throw error;
    }
}

/** @deprecated Use {@link buildRevokeCertificateTx} + Signer Lambda instead. */
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

/** @deprecated Use {@link buildReactivateCertificateTx} + Signer Lambda instead. */
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

// ---------------------------------------------------------------------------
// New: unsigned transaction builders for Signer Lambda
// ---------------------------------------------------------------------------

/**
 * Builds an unsigned sponsored contract call for issuing a certificate.
 * The returned hex must be sent to the Signer Lambda for signing + broadcast.
 */
export async function buildIssueCertificateTx(
    studentWallet: string,
    grade: string | null,
    graduationDate: number,
    expirationHeight: number | null,
    metadataUrl: string,
    dataHash: string,
    publicKey: string
): Promise<{ txHex: string; certificateId: number }> {
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

    const txHex = await buildUnsignedContractCall({
        contractAddress: MANAGER_CONTRACT_ADDRESS,
        contractName: MANAGER_CONTRACT_NAME,
        functionName: 'issue-certificate',
        functionArgs,
        publicKey,
        network: NETWORK,
        sponsored: true,
    });

    return { txHex, certificateId: nextCertificateId };
}

/**
 * Builds an unsigned sponsored contract call for revoking a certificate.
 */
export async function buildRevokeCertificateTx(
    certId: number,
    publicKey: string
): Promise<string> {
    const functionArgs: ClarityValue[] = [uintCV(certId)];

    return buildUnsignedContractCall({
        contractAddress: MANAGER_CONTRACT_ADDRESS,
        contractName: MANAGER_CONTRACT_NAME,
        functionName: 'revoke-certificate',
        functionArgs,
        publicKey,
        network: NETWORK,
        sponsored: true,
    });
}

/**
 * Builds an unsigned sponsored contract call for reactivating a certificate.
 */
export async function buildReactivateCertificateTx(
    certId: number,
    publicKey: string
): Promise<string> {
    const functionArgs: ClarityValue[] = [uintCV(certId)];

    return buildUnsignedContractCall({
        contractAddress: MANAGER_CONTRACT_ADDRESS,
        contractName: MANAGER_CONTRACT_NAME,
        functionName: 'reactivate-certificate',
        functionArgs,
        publicKey,
        network: NETWORK,
        sponsored: true,
    });
}

/**
 * Broadcasts a signed transaction hex and returns the result in the standard format.
 */
export async function broadcastCertificateTx(
    signedTxHex: string
): Promise<{ success: boolean; txid: string; urlTransaction: string }> {
    const result = await broadcastSignedTransaction(signedTxHex, NETWORK);
    const txid = result.txid;
    const chain = env.NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
    const urlTransaction = `https://explorer.hiro.so/txid/${txid}?chain=${chain}`;
    return { success: true, txid, urlTransaction };
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