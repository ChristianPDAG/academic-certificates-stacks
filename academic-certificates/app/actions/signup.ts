"use server";
import { createHash } from "crypto";
import { createClient } from '@/lib/supabase/server';

export async function hashPasswordDeterministic(password: string) {
    return createHash("sha256").update(password).digest("hex");
}

import { generateWallet, generateSecretKey } from '@stacks/wallet-sdk';
import { privateKeyToAddress } from '@stacks/transactions';

function logAddressesFromPrivateKey(privateKey: string) {
    // Compressed private key (64 or 66 characters)

    // For mainnet
    const mainnetAddress = privateKeyToAddress(
        privateKey,
        "mainnet"
    );

    // For testnet
    const testnetAddress = privateKeyToAddress(
        privateKey,
        "testnet"
    );

    return { mainnetAddress, testnetAddress };
}
async function createWalletFromSeed() {
    const secretKey = generateSecretKey();

    const wallet = await generateWallet({
        secretKey,
        password: 'optional-encryption-password',
    });

    // Get the first account's address
    const account = wallet.accounts[0];
    const result = logAddressesFromPrivateKey(account.stxPrivateKey);
    return {
        privateKey: account.stxPrivateKey,
        address: result.testnetAddress
    };
}


export async function signup({ id, email, role, nombre }: { id: string, email: string, role: string, nombre: string }) {
    try {
        // Generar wallet de Stacks para el nuevo usuario
        const wallet = await createWalletFromSeed();

        const supabase = await createClient();

        const { error } = await supabase.from('users').insert({
            email,
            role,
            private_key: wallet.privateKey,
            stacks_address: wallet.address,
            nombre,
            id_user: id
        });

        if (error) {
            console.error('Error inserting user:', error);
            return { success: false, error: error.message };
        }

        return {
            success: true,
            wallet: {
                address: wallet.address,
                // Note: No enviamos la private key al cliente por seguridad
            }
        };
    } catch (error) {
        console.error('Error during signup:', error);
        return { success: false, error: 'Failed to create user account' };
    }
}