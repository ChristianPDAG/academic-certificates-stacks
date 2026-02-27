// utils/signerApi.ts
// Client for the Signer Lambda service.
// Sends unsigned transactions to be signed (and optionally sponsored)
// server-side via AWS KMS — private keys never leave the Lambda.

import { env } from "@/config/env/env.server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Response when the transaction is NOT sponsored */
export interface SignTransactionResponse {
    success: true;
    signedTxHex: string;
    isSponsored: false;
    signerAddress: string;
}

/** Response when the transaction IS sponsored (origin + sponsor in one call) */
export interface SponsoredTransactionResponse {
    success: true;
    signedTxHex: string;
    isSponsored: true;
    signerAddress: string;
    sponsorAddress: string;
    sponsorFee: string;
    sponsorNonce: string;
    txId: string;
}

export type SignTxResult = SignTransactionResponse | SponsoredTransactionResponse;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class SignerServiceError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
        public readonly code?: string,
        public readonly details?: unknown
    ) {
        super(message);
        this.name = "SignerServiceError";
    }
}

// ---------------------------------------------------------------------------
// API Client
// ---------------------------------------------------------------------------

/**
 * Sends an unsigned (or partially-signed) transaction to the Signer Lambda
 * for signing. If the transaction uses AuthType.Sponsored, the Lambda
 * automatically handles both the origin and sponsor signatures in a single call.
 *
 * @param jwt   - A valid Supabase access token (JWT) for the user.
 * @param txHex - The unsigned transaction serialized as a hex string.
 * @returns       The signing result including the fully signed transaction hex.
 * @throws        {SignerServiceError} When the Lambda returns a non-2xx status.
 */
export async function signTransaction(
    jwt: string,
    txHex: string
): Promise<SignTxResult> {
    const baseUrl = env.SIGNER_LAMBDA_URL;
    const apiKey = env.CERTIFIKURS_API_KEY_SIGNER;

    const response = await fetch(`${baseUrl}/wallet-signer`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
            "x-api-key": apiKey,
        },
        body: JSON.stringify({ txHex }),
    });

    const body = await response.json();

    if (!response.ok) {
        throw new SignerServiceError(
            body?.message ?? "Signer service request failed",
            response.status,
            body?.code ?? body?.error,
            body?.details
        );
    }

    return body as SignTxResult;
}
