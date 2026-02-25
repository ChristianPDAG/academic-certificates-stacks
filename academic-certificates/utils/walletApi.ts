// utils/walletApi.ts
// Client for the Wallet Generator Lambda service.
// This replaces the local @stacks/wallet-sdk generation with a secure
// server-side wallet derivation via AWS KMS.

import { env } from "@/config/env/env.server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WalletResponse {
    userId: string;
    walletIndex: number;
    stacksAddress: string;
    publicKey: string;
    derivationPath: string;
}

export interface CreateWalletResult {
    isNew: boolean;
    wallet: WalletResponse;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class WalletServiceError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
        public readonly details?: unknown
    ) {
        super(message);
        this.name = "WalletServiceError";
    }
}

// ---------------------------------------------------------------------------
// API Client
// ---------------------------------------------------------------------------

/**
 * Calls the Wallet Generator Lambda to create (or retrieve) a Stacks wallet
 * for the authenticated user.
 *
 * This endpoint is idempotent: if the user already has a wallet, it returns
 * the existing one (HTTP 200) with full details including publicKey.
 *
 * @param jwt - A valid Supabase access token (JWT) for the user.
 * @returns   The wallet information returned by the Lambda.
 * @throws    {WalletServiceError} When the Lambda returns a non-2xx status.
 */
export async function createWalletForUser(
    jwt: string
): Promise<CreateWalletResult> {
    const baseUrl = env.WALLET_GENERATOR_LAMBDA_URL;
    const apiKey = env.CERTIFIKURS_API_KEY;

    const response = await fetch(`${baseUrl}/wallet-generator`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
            "x-api-key": apiKey,
        },
        body: JSON.stringify({}),
    });

    const body = await response.json();

    if (!response.ok) {
        throw new WalletServiceError(
            body?.message ?? "Wallet service request failed",
            response.status,
            body?.details
        );
    }

    return {
        isNew: body.isNew,
        wallet: body.wallet,
    };
}

/**
 * Retrieves the wallet info (including publicKey) for the authenticated user.
 * Internally calls the same create endpoint which is idempotent — existing
 * wallets are returned without modification.
 *
 * @param jwt - A valid Supabase access token (JWT) for the user.
 * @returns   The wallet details including stacksAddress and publicKey.
 * @throws    {WalletServiceError} When the Lambda returns a non-2xx status.
 */
export async function getWalletForUser(jwt: string): Promise<WalletResponse> {
    const result = await createWalletForUser(jwt);
    return result.wallet;
}
