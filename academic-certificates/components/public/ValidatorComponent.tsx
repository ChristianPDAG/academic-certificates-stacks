"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { slideInFromBottom } from "@/utils/motion";
import { IconSearch, IconCertificate, IconShieldCheck } from "@tabler/icons-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Validar Certificado | Certifikurs",
  description:
    "Valida la autenticidad de certificados académicos en la blockchain de Stacks. Ingresa el ID y verifica al instante con Certifikurs.",
  openGraph: {
    title: "Validar Certificado | Certifikurs",
    description:
      "Verifica certificados académicos en la blockchain de Stacks. Ingresa el ID y consulta la validez y detalles del certificado.",
    url: "https://certifikurs.vercel.app/validator",
    siteName: "Certifikurs",
    images: [
      {
        url: "https://certifikurs.vercel.app/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Certifikurs - Validación de certificados",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Validar Certificado | Certifikurs",
    description:
      "Valida certificados académicos en la blockchain de Stacks. Plataforma segura y transparente.",
    creator: "@Certifikurs",
    images: [
      {
        url: "https://certifikurs.vercel.app/tc-banner.jpg",
        width: 1200,
        height: 675,
        alt: "Certifikurs - Validación de certificados",
      },
    ],
  },
};

interface ValidationResult {
  isValid: boolean;
  txData?: any;
  error?: string;
}

export default function ValidatorComponent() {
  const [certificateId, setCertificateId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const searchParams = useSearchParams();

  // ⚠️ Cambia a tu contrato real si lo mueves a mainnet o cambia el nombre
  const EXPECTED_CONTRACT_ID = "ST15Z41T89K34CD6Q1N8DX2VZGCP50ATNAHPFXMBV.nft";

  /** 
   * Toma el primer TXID válido si viene "pegado dos veces" u otros ruidos.
   * Patrón: 0x + 64 hex (66 caracteres en total)
   */
  const sanitizeTxId = (raw: string) => {
    if (!raw) return "";
    const m = raw.match(/0x[a-fA-F0-9]{64}/);
    return (m ? m[0] : raw.trim()).toLowerCase();
  };

  /** Cuando el componente monta, si hay ?id= en la URL, autocompleta y valida */
  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;

    const clean = sanitizeTxId(id);
    if (!clean) return;

    setCertificateId(clean);

    // Microtask: asegura que el setState anterior se aplique antes de validar
    Promise.resolve().then(() => validateById(clean));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /** Valida llamando a la API de Hiro por TXID */
  const validateById = async (txid: string) => {
    if (!txid) return;

    setIsSearching(true);
    setValidationResult(null);

    try {
      const response = await fetch(
        `https://api.testnet.hiro.so/extended/v1/tx/${txid}`
      );

      if (response.ok) {
        const txData = await response.json();

        const contractId = txData?.contract_call?.contract_id;
        if (contractId !== EXPECTED_CONTRACT_ID) {
          setValidationResult({
            isValid: false,
            error: `Esta transacción no pertenece al contrato de certificados esperado. Contrato encontrado: ${contractId || "N/A"}`,
          });
        } else {
          setValidationResult({ isValid: true, txData });
        }
      } else {
        // Intenta leer cuerpo para logs (opcional)
        try {
          const errorData = await response.json();
          console.log("Error data:", errorData);
        } catch {}
        setValidationResult({
          isValid: false,
          error: "Certificado no encontrado en la blockchain",
        });
      }
    } catch (error) {
      console.error("Error validating certificate:", error);
      setValidationResult({
        isValid: false,
        error: "Error al consultar la blockchain. Por favor, intenta nuevamente.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  /** Submit del formulario (cuando el usuario escribe y pulsa validar) */
  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    const txid = sanitizeTxId(certificateId);
    if (!txid) return;
    setCertificateId(txid); // normaliza lo que vea el usuario
    await validateById(txid);
  };

  return (
    <main className="relative min-h-screen w-full bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Fondo decorativo + degradado para legibilidad */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('/img/bg-waves-3.svg')] bg-cover bg-center opacity-10 dark:opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white dark:from-neutral-950/60 dark:to-neutral-950" />
      </div>

      <div className="container mx-auto max-w-4xl py-16 md:py-20 px-4 lg:px-0">
        {/* Header */}
        <motion.div
          className="text-center mb-10 md:mb-12"
          initial="offScreen"
          whileInView="onScreen"
          viewport={{ once: true, amount: 0.4 }}
          variants={slideInFromBottom({ delay: 0.1 })}
        >
          <div className="flex justify-center mb-6">
            <div className="p-6 rounded-full border-2 shadow-sm bg-gradient-to-br from-sky-500/20 to-sky-500/10 border-sky-500/30">
              <IconCertificate size={64} className="text-sky-500 dark:text-sky-400" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Valida tu <span className="text-sky-500 dark:text-sky-400">Certificado</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            Verifica la autenticidad de cualquier certificado emitido en nuestra plataforma. Solo necesitas el ID del certificado.
          </p>
        </motion.div>

        {/* Card principal (glass) */}
        <motion.div
          className="rounded-2xl border backdrop-blur-xl shadow-2xl p-6 md:p-8 lg:p-10 bg-white/80 border-neutral-200 dark:bg-neutral-900/70 dark:border-neutral-800"
          initial="offScreen"
          whileInView="onScreen"
          viewport={{ once: true, amount: 0.35 }}
          variants={slideInFromBottom({ delay: 0.25 })}
        >
          <form onSubmit={handleValidate} className="space-y-6">
            <div>
              <label
                htmlFor="certificateId"
                className="block text-sm md:text-base font-semibold mb-2 text-neutral-800 dark:text-neutral-100"
              >
                ID del Certificado
              </label>

              <div className="relative">
                <input
                  id="certificateId"
                  type="text"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="Ej: 0x3a78e7... (txid Stacks)"
                  disabled={isSearching}
                  className="w-full rounded-xl px-5 md:px-6 py-3.5 md:py-4 pr-12 text-[15px] md:text-lg
                             bg-white text-neutral-900 placeholder:text-neutral-400
                             border-2 border-neutral-300
                             focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20
                             transition-all
                             dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:border-neutral-700"
                />
                <div className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
                  <IconSearch size={22} />
                </div>
              </div>

              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                El ID del certificado es único y fue proporcionado al momento de su emisión.
              </p>
            </div>

            <button
              type="submit"
              disabled={!certificateId.trim() || isSearching}
              className="w-full rounded-xl px-6 md:px-8 py-3.5 md:py-4 text-white font-semibold md:font-bold text-base md:text-lg
                         bg-sky-500 hover:bg-sky-600 shadow-lg hover:shadow-xl
                         transition-all duration-300 hover:-translate-y-0.5
                         disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSearching ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="h-5 w-5 md:h-6 md:w-6 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verificando en blockchain...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <IconShieldCheck size={22} />
                  Validar Certificado
                </span>
              )}
            </button>
          </form>

          {/* Resultado de la validación */}
          {validationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`mt-6 rounded-xl border p-5 md:p-6 ${
                validationResult.isValid
                  ? "bg-gradient-to-br from-green-50/70 to-green-100/60 border-green-200 dark:from-green-950/40 dark:to-green-900/20 dark:border-green-800/50"
                  : "bg-gradient-to-br from-red-50/70 to-red-100/60 border-red-200 dark:from-red-950/40 dark:to-red-900/20 dark:border-red-800/50"
              }`}
            >
              {validationResult.isValid ? (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <IconShieldCheck size={28} className="text-green-600 dark:text-green-400" />
                    <h3 className="text-lg md:text-xl font-bold text-green-900 dark:text-green-200">
                      ✓ Certificado Válido
                    </h3>
                  </div>

                  <p className="text-sm md:text-base text-green-800 dark:text-green-300 mb-4">
                    Este certificado existe en la blockchain de Stacks y es auténtico.
                  </p>

                  {validationResult.txData && (
                    <div className="space-y-2 text-sm text-green-800 dark:text-green-300 mb-4">
                      <div className="flex flex-col md:flex-row md:gap-2">
                        <span className="font-semibold">Estado:</span>
                        <span className="font-mono">{validationResult.txData.tx_status}</span>
                      </div>
                      <div className="flex flex-col md:flex-row md:gap-2">
                        <span className="font-semibold">Tipo:</span>
                        <span className="font-mono">{validationResult.txData.tx_type}</span>
                      </div>
                      {validationResult.txData.contract_call?.function_name && (
                        <div className="flex flex-col md:flex-row md:gap-2">
                          <span className="font-semibold">Función del Contrato:</span>
                          <span className="font-mono">{validationResult.txData.contract_call.function_name}</span>
                        </div>
                      )}
                      {validationResult.txData.contract_call?.contract_id && (
                        <div className="flex flex-col md:flex-row md:gap-2">
                          <span className="font-semibold">Contrato:</span>
                          <span className="font-mono text-xs break-all">
                            {validationResult.txData.contract_call.contract_id}
                          </span>
                        </div>
                      )}
                      {validationResult.txData.block_height && (
                        <div className="flex flex-col md:flex-row md:gap-2">
                          <span className="font-semibold">Bloque:</span>
                          <span className="font-mono">{validationResult.txData.block_height}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <a
                    href={`https://explorer.hiro.so/txid/${certificateId.trim()}?chain=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-white font-semibold text-sm md:text-base
                               bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg
                               transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <IconShieldCheck size={20} />
                    Ver en Blockchain Explorer
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-lg md:text-xl font-bold text-red-900 dark:text-red-200">
                      ✗ Certificado No Válido
                    </h3>
                  </div>

                  <p className="text-sm md:text-base text-red-800 dark:text-red-300">
                    {validationResult.error || "No se encontró ningún certificado con este ID en la blockchain."}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Info "Cómo funciona" */}
          <div className="mt-8 rounded-xl border p-5 md:p-6 bg-gradient-to-br from-blue-50/70 to-blue-100/60 border-blue-200 dark:from-blue-950/40 dark:to-blue-900/20 dark:border-blue-800/50">
            <h3 className="mb-3 flex items-center gap-2 text-base md:text-lg font-bold text-blue-900 dark:text-blue-200">
              <IconCertificate size={22} />
              ¿Cómo funciona la validación?
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              <li className="flex gap-2">
                <span className="text-sky-500 dark:text-sky-400 mt-0.5">✓</span>
                Ingresa el ID único del certificado que deseas validar.
              </li>
              <li className="flex gap-2">
                <span className="text-sky-500 dark:text-sky-400 mt-0.5">✓</span>
                El sistema consultará la blockchain de Stacks en tiempo real.
              </li>
              <li className="flex gap-2">
                <span className="text-sky-500 dark:text-sky-400 mt-0.5">✓</span>
                Verás toda la información del certificado y su estado de validez.
              </li>
              <li className="flex gap-2">
                <span className="text-sky-500 dark:text-sky-400 mt-0.5">✓</span>
                La validación es instantánea, segura y transparente.
              </li>
            </ul>
          </div>
        </motion.div>

        {/* CTA inferior */}
        <motion.div
          className="mt-10 text-center"
          initial="offScreen"
          whileInView="onScreen"
          viewport={{ once: true, amount: 0.4 }}
          variants={slideInFromBottom({ delay: 0.45 })}
        >
          <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400">
            ¿No tienes un certificado?{" "}
            <a
              href="/explorer"
              className="font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 underline-offset-4 hover:underline"
            >
              Explora certificados públicos →
            </a>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
