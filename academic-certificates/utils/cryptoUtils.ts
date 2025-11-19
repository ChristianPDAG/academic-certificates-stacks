// utils/cryptoUtils.ts

import * as crypto from 'crypto';

// --- CONFIGURACIÓN DE SEGURIDAD ---

/**
 * El algoritmo de encriptación que usaremos. AES-256-CBC es un estándar fuerte.
 */
const ALGORITHM = 'aes-256-cbc';

/**
 * El tamaño de la clave en bytes. 256 bits = 32 bytes para AES-256.
 */
const KEY_SIZE = 32;

/**
 * El tamaño del vector de inicialización (IV) en bytes. 16 bytes para AES.
 */
const IV_SIZE = 16;

/**
 * Obtiene la clave de encriptación del entorno y la verifica.
 * La clave debe ser de 32 bytes (64 caracteres hexadecimales) para AES-256.
 * @returns La clave de encriptación en formato Buffer.
 * @throws Error si la variable de entorno no está definida o no tiene el tamaño correcto.
 */
function getEncryptionKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY;

  if (!keyHex) {
    throw new Error('FATAL: La variable de entorno ENCRYPTION_KEY no está definida.');
  }

  // Verifica que la clave hexadecimal tenga el tamaño correcto (32 bytes = 64 caracteres hex)
  if (keyHex.length !== KEY_SIZE * 2) {
    throw new Error(`FATAL: La clave ENCRYPTION_KEY debe ser de ${KEY_SIZE * 2} caracteres hexadecimales (ej: 64)`);
  }

  return Buffer.from(keyHex, 'hex');
}

// --- FUNCIONES DE CRIPTOGRAFÍA ---

/**
 * 🔑 Encripta una clave privada usando AES-256-CBC.
 * Genera un nuevo Vector de Inicialización (IV) aleatorio en cada llamada.
 * @param privateKey La clave privada (string) a encriptar.
 * @returns La clave encriptada, codificada en Base64, en formato "IV:ENCRYPTED_DATA".
 */
export function encryptPrivateKey(privateKey: string): string {
  try {
    const key = getEncryptionKey();
    // 1. Generar un IV único para cada encriptación
    const iv = crypto.randomBytes(IV_SIZE);

    // 2. Crear el objeto de encriptación
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // 3. Encriptar los datos
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // 4. Devolver IV y datos encriptados concatenados y codificados en Base64
    // Esto es crucial para poder desencriptar: el IV es necesario.
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Error durante la encriptación:', error);
    throw new Error('Fallo en la encriptación de la clave privada.');
  }
}

/**
 * 🔓 Desencripta una clave privada usando AES-256-CBC.
 * @param encryptedKey La clave encriptada en formato "IV:ENCRYPTED_DATA" (Base64).
 * @returns La clave privada desencriptada (string).
 */
export function decryptPrivateKey(encryptedKey: string): string {
  try {
    const key = getEncryptionKey();
    
    // 1. Separar el IV y los datos encriptados
    const parts = encryptedKey.split(':');
    if (parts.length !== 2) {
        throw new Error('Formato de clave encriptada inválido. Esperado: "IV:ENCRYPTED_DATA"');
    }
    const ivHex = parts[0];
    const encryptedHex = parts[1];

    if (ivHex.length !== IV_SIZE * 2) {
         throw new Error('El IV extraído no tiene el tamaño correcto.');
    }

    const iv = Buffer.from(ivHex, 'hex');

    // 2. Crear el objeto de desencriptación
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    // 3. Desencriptar los datos
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    // 4. Devolver la clave desencriptada
    return decrypted;
  } catch (error) {
    console.error('Error durante la desencriptación:', error);
    throw new Error('Fallo en la desencriptación de la clave privada.');
  }
}

// --- FUNCIÓN DE UTILIDAD OPCIONAL (PARA GENERAR LA CLAVE EN EL .ENV) ---

/**
 * Genera una clave aleatoria de 32 bytes (64 caracteres hexadecimales) para el entorno.
 * ¡Úsala solo una vez para generar tu clave ENCRYPTION_KEY!
 * @returns Una clave aleatoria segura en formato hexadecimal.
 */
export function generateRandomKey(): string {
    return crypto.randomBytes(KEY_SIZE).toString('hex');
}