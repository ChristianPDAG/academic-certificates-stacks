import {
    principalCV,
    uintCV,
    cvToValue,
    fetchCallReadOnlyFunction,
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import { env } from '@/config/env/env.client';

const DATA_CONTRACT_ADDRESS = env.CONTRACT_ADDRESS;
const DATA_CONTRACT_NAME = env.CONTRACT_DATA_NAME;
const MANAGER_CONTRACT_NAME = env.CONTRACT_NAME;
const NETWORK = env.NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;

/**
 * Get super admin principal from certificate-data contract
 */
export async function getSuperAdmin(): Promise<string | null> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: DATA_CONTRACT_ADDRESS,
            contractName: DATA_CONTRACT_NAME,
            functionName: 'get-super-admin',
            functionArgs: [],
            network: NETWORK,
            senderAddress: DATA_CONTRACT_ADDRESS,
        });

        const adminValue = cvToValue(result);
        return adminValue || null;
    } catch (error) {
        console.error('Error getting super admin:', error);
        return null;
    }
}

/**
 * Get total certificates issued from certificate-data contract
 */
export async function getTotalCertificates(): Promise<number> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: DATA_CONTRACT_ADDRESS,
            contractName: DATA_CONTRACT_NAME,
            functionName: 'get-certificate-counter',
            functionArgs: [],
            network: NETWORK,
            senderAddress: DATA_CONTRACT_ADDRESS,
        });

        const totalValue = cvToValue(result);
        console.log('Total certificates raw value:', totalValue, 'Type:', typeof totalValue);

        // Handle both direct number and bigint responses
        if (typeof totalValue === 'number') {
            return totalValue;
        }
        if (typeof totalValue === 'bigint') {
            return Number(totalValue);
        }
        // Handle object with value property
        if (totalValue && typeof totalValue === 'object' && 'value' in totalValue) {
            const val = (totalValue as any).value;
            return typeof val === 'bigint' ? Number(val) : Number(val);
        }

        console.warn('Unexpected total certificates value format:', totalValue);
        return 0;
    } catch (error) {
        console.error('Error getting total certificates:', error);
        return 0;
    }
}

/**
 * Get STX per credit price from certificate-data contract
 */
export async function getStxPerCredit(): Promise<number> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: DATA_CONTRACT_ADDRESS,
            contractName: DATA_CONTRACT_NAME,
            functionName: 'get-stx-per-credit',
            functionArgs: [],
            network: NETWORK,
            senderAddress: DATA_CONTRACT_ADDRESS,
        });

        const value = cvToValue(result);
        return typeof value === 'number' ? value : 0;
    } catch (error) {
        console.error('Error getting STX per credit:', error);
        return 0;
    }
}

/**
 * Get school info from certificate-data contract
 */
export async function getSchoolInfo(schoolPrincipal: string) {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: DATA_CONTRACT_ADDRESS,
            contractName: DATA_CONTRACT_NAME,
            functionName: 'get-school-info',
            functionArgs: [principalCV(schoolPrincipal)],
            network: NETWORK,
            senderAddress: DATA_CONTRACT_ADDRESS,
        });

        const schoolData = cvToValue(result);

        if (schoolData && schoolData.value) {
            // Helper para extraer valores de objetos Clarity
            const getValue = (obj: any): any => {
                if (!obj) return null;
                if (typeof obj === 'object' && 'value' in obj) {
                    return getValue(obj.value);
                }
                return obj;
            };

            return {
                name: getValue(schoolData.value.name) || '',
                active: getValue(schoolData.value.active) || false,
                verified: getValue(schoolData.value.verified) || false,
                registrationHeight: getValue(schoolData.value['registration-height']) || 0,
                metadataUrl: getValue(schoolData.value['metadata-url']) || '',
            };
        }

        return null;
    } catch (error) {
        console.error('Error getting school info:', error);
        return null;
    }
}

/**
 * Get school credits from certificate-data contract
 */
export async function getSchoolCredits(schoolPrincipal: string): Promise<number> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: DATA_CONTRACT_ADDRESS,
            contractName: DATA_CONTRACT_NAME,
            functionName: 'get-school-credits',
            functionArgs: [principalCV(schoolPrincipal)],
            network: NETWORK,
            senderAddress: DATA_CONTRACT_ADDRESS,
        });

        const credits = cvToValue(result);
        return typeof credits === 'number' ? credits : 0;
    } catch (error) {
        console.error('Error getting school credits:', error);
        return 0;
    }
}

/**
 * Get certificate by ID from certificate-data contract
 */
export async function getCertificate(certId: number) {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: DATA_CONTRACT_ADDRESS,
            contractName: DATA_CONTRACT_NAME,
            functionName: 'get-certificate',
            functionArgs: [uintCV(certId)],
            network: NETWORK,
            senderAddress: DATA_CONTRACT_ADDRESS,
        });

        const certificateValue = cvToValue(result);

        if (certificateValue && certificateValue.value) {
            const cert = certificateValue.value;
            console.log('Certificate data:', cert);

            // Helper para extraer valores de objetos Clarity
            const getValue = (obj: any): any => {
                if (!obj) return null;
                if (typeof obj === 'object' && 'value' in obj) {
                    return getValue(obj.value);
                }
                return obj;
            };

            return {
                schoolId: getValue(cert['school-id']) || '',
                studentWallet: getValue(cert['student-wallet']) || '',
                grade: getValue(cert.grade) || null,
                issueHeight: getValue(cert['issue-height']) || 0,
                graduationDate: getValue(cert['graduation-date']) || 0,
                expirationHeight: getValue(cert['expiration-height']) || null,
                metadataUrl: getValue(cert['metadata-url']) || '',
                dataHash: getValue(cert['data-hash']) || '',
                revoked: getValue(cert.revoked) || false,
            };
        }

        return null;
    } catch (error) {
        console.error('Error getting certificate:', error);
        return null;
    }
}

/**
 * Check if certificate is valid (not revoked, not expired) from certificate-manager-v1
 */
export async function isCertificateValid(certId: number): Promise<boolean> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: DATA_CONTRACT_ADDRESS,
            contractName: MANAGER_CONTRACT_NAME,
            functionName: 'is-certificate-valid',
            functionArgs: [uintCV(certId)],
            network: NETWORK,
            senderAddress: DATA_CONTRACT_ADDRESS,
        });
        const isValid = cvToValue(result);
        return isValid?.value === true;
    } catch (error) {
        console.error('Error checking certificate validity:', error);
        return false;
    }
}

/**
 * TypeScript interfaces for better type safety
 */
export interface SchoolInfoData {
    name: string;
    active: boolean;
    verified: boolean;
    registrationHeight: number;
    metadataUrl: string;
}

export interface CertificateData {
    schoolId: string;
    studentWallet: string;
    grade: string | null;
    issueHeight: number;
    graduationDate: number;
    expirationHeight: number | null;
    metadataUrl: string;
    dataHash: string;
    revoked: boolean;
}
