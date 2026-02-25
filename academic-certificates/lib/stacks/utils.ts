import { StacksNetwork } from "@stacks/network";
import {
    broadcastTransaction,
    ClarityValue,
    getAddressFromPrivateKey,
    makeContractCall,
    makeUnsignedContractCall,
    deserializeTransaction,
    TxBroadcastResult,
    PostConditionMode,
} from "@stacks/transactions";

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

interface ContractCallParams {
    contractAddress: string;
    contractName: string;
    functionName: string;
    functionArgs: ClarityValue[];
    privateKey: string;
    network: StacksNetwork;
}

interface UnsignedContractCallParams {
    contractAddress: string;
    contractName: string;
    functionName: string;
    functionArgs: ClarityValue[];
    publicKey: string;
    network: StacksNetwork;
    sponsored?: boolean;
}

interface AccountInfo {
    nonce: number;
    balance: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getAccountNonce(address: string): Promise<number> {
    try {
        const apiUrl = `https://api.testnet.hiro.so/v2/accounts/${address}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Error al obtener información de la cuenta: ${response.status}`);
        }

        const accountInfo: AccountInfo = await response.json();
        return accountInfo.nonce;
    } catch (error) {
        console.warn("⚠️ [getAccountNonce] Error al obtener el nonce, usando 0:", error);
        return 0;
    }
}

// ---------------------------------------------------------------------------
// Legacy: signed contract call (private key required)
// Kept temporarily for any remaining callers during migration.
// ---------------------------------------------------------------------------

/** @deprecated Use {@link buildUnsignedContractCall} + Signer Lambda instead. */
export async function callContract(params: ContractCallParams): Promise<TxBroadcastResult> {
    try {
        const senderAddress: string = getAddressFromPrivateKey(params.privateKey, params.network);
        const nonce: number = await getAccountNonce(senderAddress);

        const txOptions = {
            contractAddress: params.contractAddress,
            contractName: params.contractName,
            functionName: params.functionName,
            functionArgs: params.functionArgs,
            senderKey: params.privateKey,
            network: params.network,
            fee: BigInt(500),
            nonce: nonce,
        };

        const transaction = await makeContractCall(txOptions);

        const result: TxBroadcastResult = await broadcastTransaction({
            transaction,
            network: params.network,
        });

        if ("error" in result) {
            if (result.reason === "NotEnoughFunds" || result.error === "transaction rejected") {
                const error = new Error("NotEnoughFunds");
                (error as any).reason = result.reason;
                (error as any).originalError = result.error;
                throw error;
            }

            const error = new Error(result.error || "Error desconocido en la transacción");
            (error as any).reason = result.reason;
            throw error;
        }

        return result;
    } catch (error) {
        console.error("❌ [callContract] Error en callContract:", error);
        throw error;
    }
}

// ---------------------------------------------------------------------------
// New: build unsigned contract call for Signer Lambda
// ---------------------------------------------------------------------------

/**
 * Builds an unsigned (sponsored) contract call and returns its hex
 * representation. The hex is meant to be sent to the Signer Lambda which
 * will handle origin signing + optional sponsor signing.
 *
 * @returns The serialized unsigned transaction as a hex string.
 */
export async function buildUnsignedContractCall(
    params: UnsignedContractCallParams
): Promise<string> {
    const tx = await makeUnsignedContractCall({
        contractAddress: params.contractAddress,
        contractName: params.contractName,
        functionName: params.functionName,
        functionArgs: params.functionArgs,
        publicKey: params.publicKey,
        network: params.network,
        postConditionMode: PostConditionMode.Allow,
        sponsored: params.sponsored ?? true,
        fee: BigInt(0), // The sponsor/signer will set the fee
    });

    return tx.serialize();
}

/**
 * Broadcasts a fully signed transaction (hex) to the Stacks network.
 * Used after the Signer Lambda has returned a signed tx.
 *
 * @param signedTxHex - Hex string of the fully signed transaction.
 * @param network     - The target Stacks network.
 * @returns             The broadcast result containing the txid.
 */
export async function broadcastSignedTransaction(
    signedTxHex: string,
    network: StacksNetwork
): Promise<TxBroadcastResult> {
    const transaction = deserializeTransaction(signedTxHex);

    const result: TxBroadcastResult = await broadcastTransaction({
        transaction,
        network,
    });

    if ("error" in result) {
        if (result.reason === "NotEnoughFunds" || result.error === "transaction rejected") {
            const error = new Error("NotEnoughFunds");
            (error as any).reason = result.reason;
            (error as any).originalError = result.error;
            throw error;
        }

        const error = new Error(result.error || "Error desconocido en la transacción");
        (error as any).reason = result.reason;
        throw error;
    }

    return result;
}

export { getAccountNonce };
