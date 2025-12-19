import { createHash, randomBytes } from 'crypto';

// 1. Generar el Código de Verificación (ej: "X7Z9P2")
// Este código se muestra al alumno y se imprime en el diploma, pero NO va al JSON plano.
export function generateVerificationCode(length: number = 6): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin I, 1, 0, O para evitar confusión
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export function generateSalt(): string {
    return randomBytes(16).toString('hex');
}

// 2. Hash Blindado
export function hashIdentifier(
    identifier: string,
    verificationCode: string,
    salt: string
): string {
    // Normalizamos el identificador
    const cleanIdentifier = identifier.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    // Normalizamos el código (por si acaso)
    const cleanCode = verificationCode.trim().toUpperCase();

    // Combinamos los TRES elementos
    const combined = cleanIdentifier + cleanCode + salt;

    return createHash('sha256').update(combined).digest('hex');
}
