"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { slideInFromBottom, slideInFromLeft } from "@/utils/motion";

type FAQ = { q: string; a: string };

export default function FAQPage() {
  const [faqs] = useState<FAQ[]>([
    { q: "¿Qué es la Web 2?", a: "Es la web actual dominada por plataformas centralizadas (apps, redes sociales, servidores de empresas) donde confías en un intermediario." },
    { q: "¿Qué es la Web 3?", a: "Una evolución que agrega blockchain para verificar y registrar acciones/activos sin depender de un tercero. Aporta propiedad, trazabilidad y pruebas públicas." },
    { q: "¿Por qué a veces seguimos usando Web 2 si existe Web 3?", a: "Porque hay casos donde lo centralizado es más simple o rápido de usar, y en otros la verificación pública de Web 3 es clave. Combinamos ambos según convenga." },
    { q: "¿Qué es una wallet?", a: "Tu billetera cripto. Gestiona claves y firmas para demostrar que una acción te pertenece. Piensa en ella como tu identidad/llavero en blockchain." },
    { q: "¿Qué es una dirección de wallet?", a: "Es como tu número de cuenta. Sirve para recibir o ubicar tus operaciones en la red. No revela tus claves privadas." },
    { q: "¿Necesito crear mi wallet para usar el sistema?", a: "No. Te registras normalmente y nosotros asociamos internamente una wallet. Puedes usar funciones básicas sin instalar nada. Luego, si quieres, conectas tu wallet personal." },
    { q: "¿Por qué usamos la blockchain de Stacks?", a: "Porque es económica, estable y se integra con Bitcoin. Nos permite anclar datos de forma confiable para certificados y verificación pública." },
    { q: "¿Qué es un ID de transacción (TXID)?", a: "Es el identificador único de una operación en la blockchain. Con él se consulta estado, bloque y detalles para confirmar autenticidad." },
    { q: "¿La verificación es pública?", a: "Sí. Cualquiera puede revisar el TXID en un explorador de bloques y confirmar que el certificado existe y fue emitido correctamente." },
    { q: "¿Qué ocurre si el contrato no coincide con el esperado?", a: "Se indica que la transacción no pertenece al contrato de certificados, evitando falsos positivos." },
    { q: "¿Por qué somos descentralizados?", a: "Para que la verificación no dependa solo de nosotros: la evidencia vive en la cadena. Aun así, ofrecemos una UX simple estilo Web 2." },
  ]);

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <main className="relative min-h-screen w-full bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Fondo igual al teaser: no bloquea clics */}
      <div className="absolute inset-0 bg-[url('/img/bg-nodes-2.svg')] bg-cover bg-center opacity-10 dark:opacity-20" />

      {/* Header con mismo estilo de tipografía/animación */}
      <section className="relative z-10 container mx-auto max-w-7xl px-4 lg:px-0 pt-12 md:pt-16 mt-20">
        <motion.div
          className="text-center mb-8 md:mb-12"
          initial="offScreen"
          whileInView="onScreen"
          viewport={{ once: true, amount: 0.4 }}
          variants={slideInFromBottom({ delay: 0.1 })}
        >

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">Preguntas <span className="text-sky-500 dark:text-sky-400">Frecuentes</span></h1>
          <p className="mt-3 max-w-2xl mx-auto text-neutral-600 dark:text-neutral-300">
            Conceptos clave explicados de forma simple: Web 2 / Web 3, wallets, direcciones y TXID.
          </p>
        </motion.div>
      </section>

      {/* Grid 1/2/3 columnas con tarjetas/accordeón idéntico al teaser */}
      <section className="relative z-10 container mx-auto max-w-7xl px-4 lg:px-0 pb-16 md:pb-20">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="offScreen"
          whileInView="onScreen"
          viewport={{ once: true, amount: 0.3 }}
          variants={slideInFromLeft({ delay: 0.2 })}
        >
          {faqs.map((item, idx) => {
            const open = openIdx === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-colors h-full ${open
                    ? "bg-white/80 border-sky-300 shadow-lg dark:bg-neutral-900/70 dark:border-sky-800/60"
                    : "bg-white/70 border-neutral-200 dark:bg-neutral-900/60 dark:border-neutral-800"
                  }`}
              >
                <button
                  onClick={() => setOpenIdx(open ? null : idx)}
                  className={`w-full px-5 py-4 md:px-6 md:py-5 flex items-start justify-between gap-4 rounded-lg transition-colors ${open ? "bg-sky-50/50 dark:bg-sky-900/10" : "hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                    }`}
                  aria-expanded={open}
                >
                  <span className={`text-left text-base md:text-lg font-semibold ${open ? "text-sky-700 dark:text-sky-400" : ""}`}>
                    {item.q}
                  </span>
                  <svg width="22" height="22" viewBox="0 0 24 24" className={`mt-1 transition-transform ${open ? "rotate-180" : ""}`}>
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <div
                  className={`px-5 md:px-6 pb-5 md:pb-6 text-neutral-700 dark:text-neutral-300 transition-[max-height,opacity] duration-300 ease-out ${open ? "opacity-100" : "opacity-0 max-h-0 overflow-hidden"
                    }`}
                >
                  <p className="text-sm md:text-base leading-relaxed">{item.a}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </section>
    </main>
  );
}
