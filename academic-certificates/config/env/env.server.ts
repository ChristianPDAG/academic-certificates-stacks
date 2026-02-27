export const env = {
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!,
    PINATA_JWT: process.env.PINATA_JWT!,
    PINATA_API_KEY: process.env.PINATA_API_KEY!,
    PINATA_API_SECRET: process.env.PINATA_API_SECRET!,

    // Wallet Generator Lambda
    WALLET_GENERATOR_LAMBDA_URL: process.env.WALLET_GENERATOR_LAMBDA_URL!,
    CERTIFIKURS_API_KEY: process.env.CERTIFIKURS_API_KEY!,

    // Signer Lambda
    SIGNER_LAMBDA_URL: process.env.SIGNER_LAMBDA_URL!,
    CERTIFIKURS_API_KEY_SIGNER: process.env.CERTIFIKURS_API_KEY_SIGNER!,
}