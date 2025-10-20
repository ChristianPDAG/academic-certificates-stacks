
import { useState } from "react";
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
    url: "https://ovalcampus.com/validator",
    siteName: "Certifikurs",
    images: [
      {
        url: "https://ovalcampus.com/og-banner.jpg",
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
    creator: "@OvalCampusInc",
    images: [
      {
        url: "https://ovalcampus.com/tc-banner.jpg",
        width: 1200,
        height: 675,
        alt: "Certifikurs - Validación de certificados",
      },
    ],
  },
};

export default function ValidatorComponent() {
  const [certificateId, setCertificateId] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) return;
    setIsSearching(true);
    // TODO: Lógica real de validación
    setTimeout(() => setIsSearching(false), 1500);
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
            <div className="p-6 rounded-full border-2 shadow-sm
                            bg-gradient-to-br from-sky-500/20 to-sky-500/10
                            border-sky-500/30">
              {/* Tabler hereda color por clase */}
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
          className="rounded-2xl border backdrop-blur-xl shadow-2xl p-6 md:p-8 lg:p-10
                     bg-white/80 border-neutral-200
                     dark:bg-neutral-900/70 dark:border-neutral-800"
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
                  placeholder="Ej: CERT-2025-ABC123"
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

          {/* Info “Cómo funciona” */}
          <div className="mt-8 rounded-xl border p-5 md:p-6
                          bg-gradient-to-br from-blue-50/70 to-blue-100/60 border-blue-200
                          dark:from-blue-950/40 dark:to-blue-900/20 dark:border-blue-800/50">
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
