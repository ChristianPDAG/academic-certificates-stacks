"use client";

import { openContractCall } from '@stacks/connect';
import {
    AnchorMode,
    PostConditionMode,
    principalCV,
    cvToValue,
    fetchCallReadOnlyFunction,
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

const DATA_CONTRACT_ADDRESS = "ST15Z41T89K34CD6Q1N8DX2VZGCP50ATNAHPFXMBV";
const DATA_CONTRACT_NAME = "certificate-data";
const NETWORK = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;

// ========================================
// FUNCIONES PARA CERTIFICATE-DATA
// ========================================

// ---------- AUTORIZACIÓN DE CONTRATOS ESCRITORES ----------

/**
 * Autoriza un contrato para escribir en certificate-data (Cliente)
 * Solo el super-admin puede ejecutar esta función
 */
export async function authorizeWriterDataClient(writerContract: string) {
    try {
        const txOptions = {
            contractAddress: DATA_CONTRACT_ADDRESS,
            contractName: DATA_CONTRACT_NAME,
            functionName: 'authorize-writer',
            functionArgs: [principalCV(writerContract)],
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error authorizing writer:', error);
        throw new Error(`Error al autorizar contrato escritor: ${error}`);
    }
}

/**
 * Revoca la autorización de un contrato escritor (Cliente)
 * Solo el super-admin puede ejecutar esta función
 */
export async function revokeWriterDataClient(writerContract: string) {
    try {
        const txOptions = {
            contractAddress: DATA_CONTRACT_ADDRESS,
            contractName: DATA_CONTRACT_NAME,
            functionName: 'revoke-writer',
            functionArgs: [principalCV(writerContract)],
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error revoking writer:', error);
        throw new Error(`Error al revocar contrato escritor: ${error}`);
    }
}

/**
 * Verifica si un contrato está autorizado como escritor (Read-only)
 */
export async function isWriterAuthorizedDataClient(contractAddress: string): Promise<boolean> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: DATA_CONTRACT_ADDRESS,
            contractName: DATA_CONTRACT_NAME,
            functionName: 'is-writer-authorized',
            functionArgs: [principalCV(contractAddress)],
            network: NETWORK,
            senderAddress: DATA_CONTRACT_ADDRESS,
        });

        const isAuthorized = cvToValue(result);
        return isAuthorized === true;
    } catch (error) {
        console.error("Error checking writer authorization:", error);
        return false;
    }
}

// ---------- ADMINISTRACIÓN DEL SUPER-ADMIN ----------

/**
 * Cambia el super administrador del contrato de datos (Cliente)
 * Solo el super-admin actual puede ejecutar esta función
 */
export async function changeSuperAdminDataClient(newAdmin: string) {
    try {
        const txOptions = {
            contractAddress: DATA_CONTRACT_ADDRESS,
            contractName: DATA_CONTRACT_NAME,
            functionName: 'change-super-admin',
            functionArgs: [principalCV(newAdmin)],
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        };

        return await openContractCall(txOptions);
    } catch (error) {
        console.error('Error changing super admin in data contract:', error);
        throw new Error(`Error al cambiar el super admin del contrato de datos: ${error}`);
    }
}

/**
 * Obtiene el super admin del contrato de datos (Read-only)
 */
export async function getSuperAdminDataClient(): Promise<string> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: DATA_CONTRACT_ADDRESS,
            contractName: DATA_CONTRACT_NAME,
            functionName: 'get-super-admin',
            functionArgs: [],
            network: NETWORK,
            senderAddress: DATA_CONTRACT_ADDRESS,
        });

        const adminPrincipal = cvToValue(result);
        return adminPrincipal || "";
    } catch (error) {
        console.error("Error getting super admin from data contract:", error);
        throw new Error(`Error al obtener el super admin: ${error}`);
    }
}

// ---------- FUNCIONES READ-ONLY ADICIONALES ----------

/**
 * Obtiene el precio actual en STX por crédito (Read-only)
 */
export async function getStxPerCreditDataClient(): Promise<number> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: DATA_CONTRACT_ADDRESS,
            contractName: DATA_CONTRACT_NAME,
            functionName: 'get-stx-per-credit',
            functionArgs: [],
            network: NETWORK,
            senderAddress: DATA_CONTRACT_ADDRESS,
        });

        const price = cvToValue(result);
        return Number(price) || 0;
    } catch (error) {
        console.error("Error getting STX per credit from data contract:", error);
        return 0;
    }
}

/**
 * Obtiene el contador total de certificados (Read-only)
 */
export async function getCertificateCounterDataClient(): Promise<number> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: DATA_CONTRACT_ADDRESS,
            contractName: DATA_CONTRACT_NAME,
            functionName: 'get-certificate-counter',
            functionArgs: [],
            network: NETWORK,
            senderAddress: DATA_CONTRACT_ADDRESS,
        });

        const counter = cvToValue(result);
        return Number(counter) || 0;
    } catch (error) {
        console.error("Error getting certificate counter:", error);
        return 0;
    }
}
