"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { slideInFromBottom } from "@/utils/motion";
import { IconSearch, IconCertificate, IconShieldCheck } from "@tabler/icons-react";

export default function ValidatorPage() {
  const [certificateId, setCertificateId] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) return;

    setIsSearching(true);
    // TODO: Implementar lógica de validación aquí
    console.log("Validando certificado:", certificateId);
    
    // Simulación de búsqueda
    setTimeout(() => {
      setIsSearching(false);
    }, 2000);
  };

  return (
    <main className="relative flex bg-white dark:bg-black-100 justify-center items-center flex-col overflow-hidden mx-auto min-h-screen">
      <div className="bg-[url('/img/bg-waves-3.svg')] w-full h-full bg-cover bg-center absolute top-0 left-0 opacity-30 dark:opacity-20 -z-10" />

      <div className="container mx-auto max-w-4xl z-10 py-20 px-4 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={"offScreen"}
          whileInView={"onScreen"}
          viewport={{ once: true }}
          variants={slideInFromBottom({ delay: 0.2 })}
        >
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-gradient-to-br from-[#00A1FF]/20 to-[#00A1FF]/10 rounded-full border-2 border-[#00A1FF]/30">
              <IconCertificate size={64} color="#00A1FF" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-4 text-neutral-900 dark:text-white">
            Validador de <span className="text-[#00A1FF]">Certificados</span>
          </h1>
          <p className="text-lg lg:text-xl text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto">
            Ingresa el ID del certificado para verificar su autenticidad en la blockchain de Stacks
          </p>
        </motion.div>

        <motion.div
          className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 p-8 lg:p-12 shadow-2xl"
          initial={"offScreen"}
          whileInView={"onScreen"}
          viewport={{ once: true }}
          variants={slideInFromBottom({ delay: 0.4 })}
        >
          <form onSubmit={handleValidate} className="space-y-6">
            <div>
              <label
                htmlFor="certificateId"
                className="block text-base font-semibold text-neutral-800 dark:text-neutral-100 mb-3"
              >
                ID del Certificado
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="certificateId"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="Ej: CERT-2025-ABC123"
                  className="w-full px-6 py-4 pr-14 text-lg bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-[#00A1FF] focus:ring-4 focus:ring-[#00A1FF]/20 transition-all duration-300 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  disabled={isSearching}
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
                  <IconSearch size={24} />
                </div>
              </div>
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                El ID del certificado es único y fue proporcionado al momento de su emisión
              </p>
            </div>

            <button
              type="submit"
              disabled={!certificateId.trim() || isSearching}
              className="w-full px-8 py-4 bg-gradient-to-r from-[#00A1FF] to-[#0081CC] hover:from-[#0081CC] hover:to-[#0066A3] text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:from-[#00A1FF] disabled:hover:to-[#0081CC]"
            >
              {isSearching ? (
                <span className="flex items-center justify-center gap-3">
                  <svg
                    className="animate-spin h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Verificando en blockchain...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <IconShieldCheck size={24} />
                  Validar Certificado
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 rounded-xl border-2 border-blue-200 dark:border-blue-900/50">
            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2 text-lg">
              <IconCertificate size={24} />
              ¿Cómo funciona la validación?
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-none">
              <li className="flex items-start gap-2">
                <span className="text-[#00A1FF] mt-1">✓</span>
                <span>Ingresa el ID único del certificado que deseas validar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00A1FF] mt-1">✓</span>
                <span>El sistema consultará la blockchain de Stacks en tiempo real</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00A1FF] mt-1">✓</span>
                <span>Verás toda la información del certificado y su estado de validez</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00A1FF] mt-1">✓</span>
                <span>La validación es instantánea, segura y completamente transparente</span>
              </li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          className="mt-8 text-center"
          initial={"offScreen"}
          whileInView={"onScreen"}
          viewport={{ once: true }}
          variants={slideInFromBottom({ delay: 0.6 })}
        >
          <p className="text-base text-neutral-600 dark:text-neutral-400">
            ¿No tienes un certificado?{" "}
            <a
              href="/explorer"
              className="text-[#00A1FF] hover:text-[#0081CC] hover:underline font-semibold transition-colors"
            >
              Explora certificados públicos →
            </a>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
