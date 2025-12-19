"use client";

import { AnchorMode, cvToValue, fetchCallReadOnlyFunction, PostConditionMode, principalCV, uintCV } from "@stacks/transactions";
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import { openContractCall } from "@stacks/connect";
import { env } from '@/config/env/env.client'

const MANAGER_CONTRACT_ADDRESS = env.CONTRACT_ADDRESS;
const MANAGER_CONTRACT_NAME = env.CONTRACT_NAME;
const NETWORK = env.NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;


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