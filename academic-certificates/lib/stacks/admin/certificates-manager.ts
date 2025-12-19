"use client";

import { openContractCall } from "@stacks/connect";
import { AnchorMode, cvToValue, fetchCallReadOnlyFunction, PostConditionMode, uintCV } from "@stacks/transactions";
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

import { env } from '@/config/env/env.client'

const MANAGER_CONTRACT_ADDRESS = env.CONTRACT_ADDRESS;
const MANAGER_CONTRACT_NAME = env.CONTRACT_NAME;
const NETWORK = env.NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;


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