import { StacksNetwork } from "@stacks/network";
import { broadcastTransaction, ClarityValue, getAddressFromPrivateKey, makeContractCall, TxBroadcastResult } from "@stacks/transactions";

// Interfaces para mejorar el tipado
interface ContractCallParams {
    contractAddress: string;
    contractName: string;
    functionName: string;
    functionArgs: ClarityValue[];
    privateKey: string;
    network: StacksNetwork;
}

interface AccountInfo {
    nonce: number;
    balance: string;
}

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
        return 0; // Fallback para desarrollo/testing
    }
}



// Función más flexible para llamadas de contrato
export async function callContract(params: ContractCallParams): Promise<TxBroadcastResult> {


    try {
        // Obtener la dirección del sender desde la clave privada
        const senderAddress: string = getAddressFromPrivateKey(params.privateKey, params.network);
        const nonce: number = await getAccountNonce(senderAddress);

        const txOptions = {
            contractAddress: params.contractAddress,
            contractName: params.contractName,
            functionName: params.functionName,
            functionArgs: params.functionArgs,
            senderKey: params.privateKey,
            network: params.network,
            fee: BigInt(500), // Fee por defecto
            nonce: nonce,
        };


        const transaction = await makeContractCall(txOptions);

        const result: TxBroadcastResult = await broadcastTransaction({
            transaction,
            network: params.network
        });

        if ('error' in result) {

            // Lanzar un error específico para fondos insuficientes
            if (result.reason === "NotEnoughFunds" || result.error === "transaction rejected") {
                const error = new Error("NotEnoughFunds");
                (error as any).reason = result.reason; // 
                (error as any).originalError = result.error; // 
                throw error;
            }

            // Para otros errores, lanzar un error genérico
            const error = new Error(result.error || "Error desconocido en la transacción");
            (error as any).reason = result.reason; // 
            throw error;
        }

        return result;
    } catch (error) {
        console.error("❌ [callContract] Error en callContract:", error);
        throw error;
    }
}

export { getAccountNonce };
