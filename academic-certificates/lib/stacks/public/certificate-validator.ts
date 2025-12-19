import { cvToValue, fetchCallReadOnlyFunction, uintCV } from "@stacks/transactions";
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import { env } from '@/config/env/env.client'

const MANAGER_CONTRACT_ADDRESS = env.CONTRACT_ADDRESS;
const MANAGER_CONTRACT_NAME = env.CONTRACT_NAME;
const NETWORK = env.NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;

/**
 * Validates if a certificate is valid (not revoked and not expired)
 */
export async function isCertificateValid(certId: number): Promise<boolean> {
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

/**
 * Gets complete certificate data from blockchain
 */
export async function getCertificateData(certId: number) {
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
