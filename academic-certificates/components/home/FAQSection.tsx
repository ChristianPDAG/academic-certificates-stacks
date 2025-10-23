"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { slideInFromBottom, slideInFromLeft } from "@/utils/motion";
import { IconQuestionMark, IconChevronDown, IconInfoCircle } from "@tabler/icons-react";
import Link from "next/link";

export default function FAQTeaser() {
  const items = [
    {
      q: "¿Qué es la Web 2 y la Web 3?",
      a: "Web 2 es la web tradicional con plataformas centralizadas. Web 3 añade propiedad y verificación en blockchain, permitiendo que los datos y activos sean tuyos.",
    },
    {
      q: "¿Qué es una wallet y qué es una dirección?",
      a: "La wallet es tu billetera cripto. Su dirección es como tu número de cuenta: sirve para recibir o identificar activos/acciones en la cadena.",
    },
    {
      q: "¿Necesito crear mi propia wallet para usar el sistema?",
      a: "No. Nuestro flujo te registra y asocia internamente la wallet; puedes usar el sistema sin instalar nada. Si luego quieres, conectas tu wallet personal.",
    },
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="relative w-full bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Fondo SIEMPRE visible, sin bloquear clics */}
              <div className="absolute inset-0 bg-[url('/img/bg-nodes-2.svg')] bg-cover bg-center opacity-10 dark:opacity-20" />

      {/* Contenido va ENCIMA del fondo */}
      <div className="relative z-10 container mx-auto max-w-7xl py-16 md:py-20 px-4 lg:px-0">
        <div className="relative z-10 flex flex-col lg:flex-row-reverse items-center gap-10">
          {/* Texto - derecha */}
          <div className="relative z-10 w-full lg:w-1/2 flex flex-col justify-center">
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-center lg:text-left"
              initial="offScreen"
              whileInView="onScreen"
              viewport={{ once: true, amount: 0.4 }}
              variants={slideInFromBottom({ delay: 0.1 })}
            >
              Preguntas <span className="text-sky-500 dark:text-sky-400">Frecuentes</span>
            </motion.h2>

            <motion.p
              className="text-base md:text-lg lg:text-xl text-neutral-600 dark:text-neutral-300 mb-8 text-center lg:text-left"
              initial="offScreen"
              whileInView="onScreen"
              viewport={{ once: true, amount: 0.4 }}
              variants={slideInFromBottom({ delay: 0.25 })}
            >
              Resuelve los conceptos clave de forma simple y conoce cómo funcionamos.
            </motion.p>

            <motion.div
              className="flex gap-4 justify-center lg:justify-start"
              initial="offScreen"
              whileInView="onScreen"
              viewport={{ once: true, amount: 0.4 }}
              variants={slideInFromBottom({ delay: 0.4 })}
            >
              <Link
                href="/faq"
                className="px-6 py-3 md:px-8 md:py-4 rounded-lg font-semibold text-white bg-sky-500 hover:bg-sky-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 border-2 border-sky-500 hover:border-sky-600 relative overflow-hidden group"
              >
                <span className="relative z-10">Ver Preguntas Frecuentes</span>
                <span className="absolute inset-0 bg-sky-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </Link>

            </motion.div>
          </div>

          {/* Mini acordeón - izquierda */}
          <div className="relative z-10 w-full lg:w-1/2 flex justify-center">
            <motion.div
              className="w-full max-w-xl space-y-4"
              initial="offScreen"
              whileInView="onScreen"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideInFromBottom({ delay: 0.5 })}
            >
              {items.map((item, idx) => {
                const open = openIdx === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border transition-colors ${
                      open
                        ? "bg-white/80 border-sky-300 shadow-lg dark:bg-neutral-900/70 dark:border-sky-800/60"
                        : "bg-white/70 border-neutral-200 dark:bg-neutral-900/60 dark:border-neutral-800"
                    }`}
                  >
                    <button
                      onClick={() => setOpenIdx(open ? null : idx)}
                      className={`w-full px-5 py-4 md:px-6 md:py-5 flex items-start justify-between gap-4 rounded-lg transition-colors ${
                        open ? "bg-sky-50/50 dark:bg-sky-900/10" : "hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                      }`}
                      aria-expanded={open}
                      aria-controls={`faq-mini-${idx}`}
                    >
                      <span className={`text-left text-base md:text-lg font-semibold ${open ? "text-sky-700 dark:text-sky-400" : ""}`}>
                        {item.q}
                      </span>
                      <IconChevronDown
                        className={`mt-1 shrink-0 transition-transform ${open ? "rotate-180 text-sky-500 dark:text-sky-400" : ""}`}
                        size={22}
                      />
                    </button>

                    <div
                      id={`faq-mini-${idx}`}
                      className={`px-5 md:px-6 pb-5 md:pb-6 text-neutral-700 dark:text-neutral-300 transition-[max-height,opacity] duration-300 ease-out ${
                        open ? "opacity-100" : "opacity-0 max-h-0 overflow-hidden"
                      }`}
                    >
                      <p className="text-sm md:text-base leading-relaxed">{item.a}</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href="/faq"
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/20 dark:hover:bg-sky-900/30 border border-sky-200 dark:border-sky-800/60 transition-all duration-200"
                        >
                          Ver todas las preguntas
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <IconInfoCircle size={16} />
                Más conceptos y guías paso a paso en la página de Preguntas Frecuentes.
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
