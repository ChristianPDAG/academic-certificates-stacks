import { STACKS_TESTNET, StacksNetwork } from '@stacks/network';
import {
    makeContractCall,
    broadcastTransaction,
    stringAsciiCV,
    uintCV,
    getAddressFromPrivateKey,
    TxBroadcastResult,
    ClarityValue,
    standardPrincipalCV
} from '@stacks/transactions';

// *** ADVERTENCIA: Esta clave privada debe estar en un entorno seguro (server-side) ***
// ⚠️ En producción, mover esto al servidor y usar API routes
const CONTRACT_ADDRESS: string = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "sin-contrato";
const CONTRACT_NAME: string = process.env.NEXT_PUBLIC_CONTRACT_NAME || "nft";
const FUNCTION_NAME: string = process.env.NEXT_PUBLIC_CERTIFICATE_FUNCTION_NAME || "sin-funcion";


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

// Función auxiliar para obtener el nonce de una cuenta
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

// Función helper para crear argumentos de certificado académico
export function createAcademicCertificateArgs(
    studentId: string,
    course: string,
    grade: string,
    studentWallet: string
): ClarityValue[] {

    const idStudent = studentId.toString();
    return [
        stringAsciiCV(idStudent),
        stringAsciiCV(course),
        stringAsciiCV(grade),
        standardPrincipalCV(studentWallet)
    ];
}

// Función para llamar al contrato con argumentos específicos de certificado
export async function signAcademicCertificate(
    studentId: string,
    course: string,
    grade: string,
    studentWallet: string,
    privateKey: string
): Promise<{ success: boolean; txid: string; urlTransaction: string }> {

    const functionArgs = createAcademicCertificateArgs(studentId, course, grade, studentWallet);

    try {
        const result = await callContract({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: FUNCTION_NAME,
            functionArgs: functionArgs,
            privateKey: privateKey,
            network: STACKS_TESTNET
        });
        const txid = result.txid;
        const urlTransaction = `https://explorer.hiro.so/txid/${txid}?chain=testnet`;
        return { success: true, txid, urlTransaction };
    } catch (error) {
        console.error("💥 [signAcademicCertificate] ¡ERROR! Fallo al firmar certificado:", error);
        if (error instanceof Error) {
            console.error("📝 [signAcademicCertificate] Mensaje de error:", error.message);
        }
        // Re-lanzar el error para que sea manejado por el componente
        throw error;
    }
}

// Exportar funciones de utilidad
export { getAccountNonce };
export { stringAsciiCV, uintCV, standardPrincipalCV };
