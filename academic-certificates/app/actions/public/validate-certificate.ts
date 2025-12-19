"use server";

import { createClient } from "@/lib/supabase/server";
import {
    getCertificateData,
    isCertificateValid,
} from "@/lib/stacks/public/certificate-validator";
import crypto from "crypto";
import { env } from "@/config/env/env.client";

interface CertificateMetadata {
    version: string;
    certificate: {
        title: string;
        description: string;
        modality: string;
        hours: number;
        issue_date_iso: string;
        language: string;
        category?: string;
    };
    recipient: {
        name: string;
        identifier_hash: string;
        identifier_salt: string;
    };
    issuer: {
        name: string;
        department: string | null;
        instructors: string[];
        authorization_id: string;
    };
    achievement: {
        skills_acquired: string[];
        grade: string;
        category: string;
    };
}

interface BlockchainCertData {
    "school-id": { type: string; value: string };
    "student-wallet": { type: string; value: string };
    grade: { type: string; value: string } | null;
    "issue-height": { type: string; value: string };
    "graduation-date": { type: string; value: string };
    "expiration-height": { type: string; value: string } | null;
    "metadata-url": { type: string; value: string };
    "data-hash": { type: string; value: string };
    revoked: { type: string; value: boolean };
}

interface ValidationResult {
    success: boolean;
    error?: string;
    data?: {
        // Blockchain data
        chainCertId: number;
        isValidOnChain: boolean;
        blockchainData: {
            schoolId: string;
            studentWallet: string;
            grade: string | null;
            issueHeight: number;
            graduationDate: number;
            expirationHeight: number | null;
            metadataUrl: string;
            dataHash: string;
            revoked: boolean;
        };
        // Metadata
        metadata: CertificateMetadata;
        hashVerified: boolean;
        // Database data (optional)
        databaseData?: {
            studentName: string;
            studentEmail: string | null;
            status: string;
            createdAt: string;
            courseId: string;
            academyId: string;
        };
        // Transaction data
        txId: string;
        explorerUrl: string;
    };
}

/**
 * Validates a certificate by transaction ID or certificate ID
 * Performs comprehensive validation including:
 * - Blockchain contract validation (revocation, expiration)
 * - Metadata fetching and hash verification
 * - Database lookup for additional context
 */
export async function validateCertificateAction(
    input: string
): Promise<ValidationResult> {
    try {
        const supabase = await createClient();

        // Step 1: Determine input type and get certificate ID
        const isTxId = input.startsWith("0x");
        let chainCertId: number;
        let txId: string;

        if (isTxId) {
            // Input is a transaction ID - query database to get chain_cert_id
            txId = input.toLowerCase();

            const { data: dbCert, error: dbError } = await supabase
                .from("certificates")
                .select("chain_cert_id, tx_id")
                .eq("tx_id", txId)
                .single();

            if (dbError || !dbCert?.chain_cert_id) {
                return {
                    success: false,
                    error: "Certificado no encontrado en la base de datos. Verifica el ID de transacción.",
                };
            }

            chainCertId = dbCert.chain_cert_id;
        } else {
            // Input is a certificate ID
            const parsedId = parseInt(input);
            if (isNaN(parsedId) || parsedId <= 0) {
                return {
                    success: false,
                    error: "ID de certificado inválido. Debe ser un número positivo o un hash de transacción.",
                };
            }
            chainCertId = parsedId;
            txId = ""; // Will be fetched from database if available
        }

        // Step 2: Validate on blockchain using smart contract
        const [isValidOnChain, certDataRaw] = await Promise.all([
            isCertificateValid(chainCertId),
            getCertificateData(chainCertId),
        ]);

        if (!certDataRaw || !certDataRaw.value) {
            return {
                success: false,
                error: "Certificado no encontrado en la blockchain.",
            };
        }

        const certData = certDataRaw.value as unknown as BlockchainCertData;

        // Parse blockchain data
        const blockchainData = {
            schoolId: certData["school-id"]?.value || "",
            studentWallet: certData["student-wallet"]?.value || "",
            grade: certData.grade?.value || null,
            issueHeight: parseInt(certData["issue-height"]?.value || "0"),
            graduationDate: parseInt(certData["graduation-date"]?.value || "0"),
            expirationHeight: certData["expiration-height"]
                ? parseInt(certData["expiration-height"].value)
                : null,
            metadataUrl: certData["metadata-url"]?.value || "",
            dataHash: certData["data-hash"]?.value || "",
            revoked: certData.revoked?.value || false,
        };

        // Step 3: Fetch metadata from URI
        if (!blockchainData.metadataUrl) {
            return {
                success: false,
                error: "URL de metadatos no disponible en el certificado.",
            };
        }

        let metadata: CertificateMetadata;
        try {
            const metadataResponse = await fetch(blockchainData.metadataUrl);
            if (!metadataResponse.ok) {
                throw new Error("No se pudo obtener los metadatos");
            }
            metadata = await metadataResponse.json();
        } catch (error) {
            return {
                success: false,
                error: "Error al obtener los metadatos del certificado desde el almacenamiento.",
            };
        }

        // Step 4: Verify hash integrity
        const metadataString = JSON.stringify(metadata, null, 2);
        console.log("Metadata String:", metadataString);
        const computedHash = crypto
            .createHash("sha256")
            .update(metadataString)
            .digest("hex");
        // Remove 0x prefix from blockchain hash for comparison
        const blockchainHash = blockchainData.dataHash.startsWith("0x")
            ? blockchainData.dataHash.slice(2)
            : blockchainData.dataHash;

        const hashVerified = computedHash === blockchainHash;
        // Step 5: Query database for additional information
        const { data: dbData } = await supabase
            .from("certificates")
            .select(
                "student_name, student_email, status, created_at, id_course, id_academy, tx_id"
            )
            .eq("chain_cert_id", chainCertId)
            .single();

        // Use database tx_id if we didn't have it from input
        if (!txId && dbData?.tx_id) {
            txId = dbData.tx_id;
        }

        const databaseData = dbData
            ? {
                studentName: dbData.student_name,
                studentEmail: dbData.student_email || null,
                status: dbData.status,
                createdAt: dbData.created_at,
                courseId: dbData.id_course,
                academyId: dbData.id_academy,
            }
            : undefined;

        // Step 6: Determine network for explorer URL
        const network =
            env.NETWORK === "mainnet" ? "mainnet" : "testnet";
        const explorerUrl = txId
            ? `https://explorer.hiro.so/txid/${txId}?chain=${network}`
            : `https://explorer.hiro.so/?chain=${network}`;

        return {
            success: true,
            data: {
                chainCertId,
                isValidOnChain,
                blockchainData,
                metadata,
                hashVerified,
                databaseData,
                txId,
                explorerUrl,
            },
        };
    } catch (error) {
        console.error("Error validating certificate:", error);
        return {
            success: false,
            error:
                "Error inesperado al validar el certificado. Por favor, intenta nuevamente.",
        };
    }
}
