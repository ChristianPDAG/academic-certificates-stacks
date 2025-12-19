"use client";

import { openContractCall } from "@stacks/connect";
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import { AnchorMode, cvToValue, fetchCallReadOnlyFunction, PostConditionMode, principalCV } from "@stacks/transactions";
import { env } from '@/config/env/env.client'

const REGISTRY_CONTRACT_ADDRESS = env.CONTRACT_ADDRESS;
const REGISTRY_CONTRACT_NAME = env.CONTRACT_REGISTRY_NAME;
const NETWORK = env.NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;

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
        const managerPrincipal = cvToValue(result);
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
