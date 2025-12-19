"use client";

import { openContractCall } from "@stacks/connect";
import { AnchorMode, cvToValue, fetchCallReadOnlyFunction, PostConditionMode, principalCV, stringAsciiCV } from "@stacks/transactions";
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import { env } from '@/config/env/env.client'

const MANAGER_CONTRACT_ADDRESS = env.CONTRACT_ADDRESS;
const MANAGER_CONTRACT_NAME = env.CONTRACT_NAME;
const NETWORK = env.NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;

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
