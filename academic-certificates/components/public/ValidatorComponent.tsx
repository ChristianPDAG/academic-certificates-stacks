"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { IconSearch, IconCertificate, IconShieldCheck, IconAlertCircle, IconCalendar, IconUser, IconSchool, IconAward, IconHash, IconBrandStackshare } from "@tabler/icons-react";
import { Metadata } from "next";
import { validateCertificateAction } from "@/app/actions/public/validate-certificate";

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
  success: boolean;
  error?: string;
  data?: {
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
    metadata: {
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
    };
    hashVerified: boolean;
    databaseData?: {
      studentName: string;
      studentEmail: string | null;
      status: string;
      createdAt: string;
      courseId: string;
      academyId: string;
    };
    txId: string;
    explorerUrl: string;
  };
}

export default function ValidatorComponent() {
  const [certificateId, setCertificateId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const searchParams = useSearchParams();

  /** 
   * Sanitizes input to handle transaction IDs or certificate IDs
   */
  const sanitizeInput = (raw: string): string => {
    if (!raw) return "";
    const trimmed = raw.trim();

    // If it looks like a txid (0x + hex), extract the first valid one
    if (trimmed.startsWith("0x")) {
      const match = trimmed.match(/0x[a-fA-F0-9]{64}/);
      return match ? match[0].toLowerCase() : trimmed.toLowerCase();
    }

    // Otherwise, treat as certificate ID (numeric)
    return trimmed;
  };

  /** When component mounts, if there's ?id= in URL, autocomplete and validate */
  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;

    const clean = sanitizeInput(id);
    if (!clean) return;

    setCertificateId(clean);

    // Microtask: ensure setState applies before validation
    Promise.resolve().then(() => validateCertificate(clean));
  }, [searchParams]);

  /** Validates certificate using server action */
  const validateCertificate = async (input: string) => {
    if (!input) return;

    setIsSearching(true);
    setValidationResult(null);

    try {
      const result = await validateCertificateAction(input);
      setValidationResult(result);
    } catch (error) {
      console.error("Error validating certificate:", error);
      setValidationResult({
        success: false,
        error: "Error al consultar la blockchain. Por favor, intenta nuevamente.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  /** Submit form handler */
  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = sanitizeInput(certificateId);
    if (!input) return;
    setCertificateId(input);
    await validateCertificate(input);
  };

  /** Format date from ISO string */
  const formatDate = (isoString: string): string => {
    try {
      return new Date(isoString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
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
        <div className="text-center mb-10 md:mb-12">
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
        </div>

        {/* Card principal (glass) */}
        <div className="rounded-2xl border backdrop-blur-xl shadow-2xl p-6 md:p-8 lg:p-10 bg-white/80 border-neutral-200 dark:bg-neutral-900/70 dark:border-neutral-800">
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
                  placeholder="Ej: 123 o 0x3a78e7..."
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
                Ingresa el ID del certificado (número) o el hash de transacción (0x...).
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
            <div className="mt-6 space-y-4">
              {validationResult.success && validationResult.data ? (
                <>
                  {/* Status Badge */}
                  <div
                    className={`rounded-xl border p-5 md:p-6 ${validationResult.data.isValidOnChain && !validationResult.data.blockchainData.revoked
                        ? "bg-gradient-to-br from-green-50/70 to-green-100/60 border-green-200 dark:from-green-950/40 dark:to-green-900/20 dark:border-green-800/50"
                        : "bg-gradient-to-br from-yellow-50/70 to-yellow-100/60 border-yellow-200 dark:from-yellow-950/40 dark:to-yellow-900/20 dark:border-yellow-800/50"
                      }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {validationResult.data.isValidOnChain && !validationResult.data.blockchainData.revoked ? (
                        <>
                          <IconShieldCheck size={32} className="text-green-600 dark:text-green-400" />
                          <div>
                            <h3 className="text-xl font-bold text-green-900 dark:text-green-200">
                              ✓ Certificado Válido
                            </h3>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Verificado en blockchain de Stacks
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <IconAlertCircle size={32} className="text-yellow-600 dark:text-yellow-400" />
                          <div>
                            <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-200">
                              ⚠ Certificado {validationResult.data.blockchainData.revoked ? "Revocado" : "Expirado"}
                            </h3>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                              {validationResult.data.blockchainData.revoked
                                ? "Este certificado ha sido revocado por la institución emisora"
                                : "Este certificado ha alcanzado su fecha de expiración"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Hash Verification */}
                    <div className="flex items-center gap-2 text-sm">
                      {validationResult.data.hashVerified ? (
                        <>
                          <IconShieldCheck size={18} className="text-green-600 dark:text-green-400" />
                          <span className="text-green-800 dark:text-green-300 font-medium">
                            Integridad de datos verificada
                          </span>
                        </>
                      ) : (
                        <>
                          <IconAlertCircle size={18} className="text-red-600 dark:text-red-400" />
                          <span className="text-red-800 dark:text-red-300 font-medium">
                            Advertencia: Los datos podrían haber sido modificados
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Certificate Details */}
                  <div className="rounded-xl border p-6 md:p-8 bg-white/80 border-neutral-200 dark:bg-neutral-900/70 dark:border-neutral-800">
                    <h3 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                      <IconCertificate size={28} className="text-sky-500" />
                      Detalles del Certificado
                    </h3>

                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Course Information */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <IconAward size={20} className="text-sky-500" />
                            <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">Curso</h4>
                          </div>
                          <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                            {validationResult.data.metadata.certificate.title}
                          </p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            {validationResult.data.metadata.certificate.description}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Modalidad</p>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            {validationResult.data.metadata.certificate.modality}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Duración</p>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            {validationResult.data.metadata.certificate.hours} horas
                          </p>
                        </div>

                        {validationResult.data.metadata.certificate.category && (
                          <div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Categoría</p>
                            <p className="font-medium text-neutral-900 dark:text-neutral-100">
                              {validationResult.data.metadata.certificate.category}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Recipient & Achievement */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <IconUser size={20} className="text-sky-500" />
                            <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">Estudiante</h4>
                          </div>
                          <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                            {validationResult.data.metadata.recipient.name}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Calificación</p>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            {validationResult.data.metadata.achievement.grade}
                          </p>
                        </div>

                        {validationResult.data.metadata.achievement.skills_acquired.length > 0 && (
                          <div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Habilidades Adquiridas</p>
                            <div className="flex flex-wrap gap-2">
                              {validationResult.data.metadata.achievement.skills_acquired.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <IconCalendar size={20} className="text-sky-500" />
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Fecha de Emisión</p>
                          </div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            {formatDate(validationResult.data.metadata.certificate.issue_date_iso)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Issuer Information */}
                    <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-center gap-2 mb-3">
                        <IconSchool size={20} className="text-sky-500" />
                        <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">Institución Emisora</h4>
                      </div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                        {validationResult.data.metadata.issuer.name}
                      </p>
                      {validationResult.data.metadata.issuer.department && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                          {validationResult.data.metadata.issuer.department}
                        </p>
                      )}
                      {validationResult.data.metadata.issuer.instructors.length > 0 && (
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          <span className="font-medium">Instructores: </span>
                          {validationResult.data.metadata.issuer.instructors.join(", ")}
                        </div>
                      )}
                      <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2 font-mono">
                        ID: {validationResult.data.metadata.issuer.authorization_id}
                      </p>
                    </div>
                  </div>

                  {/* Blockchain Information */}
                  <div className="rounded-xl border p-5 md:p-6 bg-gradient-to-br from-purple-50/70 to-purple-100/60 border-purple-200 dark:from-purple-950/40 dark:to-purple-900/20 dark:border-purple-800/50">
                    <h4 className="flex items-center gap-2 text-base md:text-lg font-bold text-purple-900 dark:text-purple-200 mb-4">
                      <IconBrandStackshare size={24} />
                      Información de Blockchain
                    </h4>

                    <div className="grid gap-3 text-sm">
                      <div className="flex flex-col md:flex-row md:gap-2">
                        <span className="font-semibold text-purple-800 dark:text-purple-300">ID del Certificado:</span>
                        <span className="font-mono text-purple-900 dark:text-purple-100">
                          {validationResult.data.chainCertId}
                        </span>
                      </div>

                      <div className="flex flex-col md:flex-row md:gap-2">
                        <span className="font-semibold text-purple-800 dark:text-purple-300">Wallet del Estudiante:</span>
                        <span className="font-mono text-xs break-all text-purple-900 dark:text-purple-100">
                          {validationResult.data.blockchainData.studentWallet}
                        </span>
                      </div>

                      <div className="flex flex-col md:flex-row md:gap-2">
                        <span className="font-semibold text-purple-800 dark:text-purple-300">Institución (Wallet):</span>
                        <span className="font-mono text-xs break-all text-purple-900 dark:text-purple-100">
                          {validationResult.data.blockchainData.schoolId}
                        </span>
                      </div>

                      {validationResult.data.blockchainData.expirationHeight && (
                        <div className="flex flex-col md:flex-row md:gap-2">
                          <span className="font-semibold text-purple-800 dark:text-purple-300">Altura de Expiración:</span>
                          <span className="font-mono text-purple-900 dark:text-purple-100">
                            Bloque {validationResult.data.blockchainData.expirationHeight}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col md:flex-row md:gap-2">
                        <span className="font-semibold text-purple-800 dark:text-purple-300">Hash de Datos:</span>
                        <span className="font-mono text-xs break-all text-purple-900 dark:text-purple-100">
                          {validationResult.data.blockchainData.dataHash}
                        </span>
                      </div>
                    </div>

                    <a
                      href={validationResult.data.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-white font-semibold text-sm md:text-base
                                 bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg
                                 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <IconShieldCheck size={20} />
                      Ver en Blockchain Explorer
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </>
              ) : (
                // Error state
                <div className="rounded-xl border p-5 md:p-6 bg-gradient-to-br from-red-50/70 to-red-100/60 border-red-200 dark:from-red-950/40 dark:to-red-900/20 dark:border-red-800/50">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-lg md:text-xl font-bold text-red-900 dark:text-red-200">
                      ✗ No se pudo validar el certificado
                    </h3>
                  </div>

                  <p className="text-sm md:text-base text-red-800 dark:text-red-300">
                    {validationResult.error || "No se encontró ningún certificado con este ID en la blockchain."}
                  </p>
                </div>
              )}
            </div>
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
        </div>

        {/* CTA inferior */}
        <div className="mt-10 text-center">
          <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400">
            ¿No tienes un certificado?{" "}
            <a
              href="/explorer"
              className="font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 underline-offset-4 hover:underline"
            >
              Explora certificados públicos →
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
