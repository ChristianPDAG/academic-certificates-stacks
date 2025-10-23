"use client";

import { motion } from "framer-motion";
import { slideInFromBottom, slideInFromLeft } from "@/utils/motion";
import { IconCertificate, IconShieldCheck } from "@tabler/icons-react";
import Link from "next/link";

const Validator = () => {
  return (
    <section className="relative w-full bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Fondo decorativo con opacidad diferente por tema (que sí se ve en ambos) */}
        <div className="absolute inset-0 bg-[url('/img/bg-waves-3.svg')] bg-cover bg-center opacity-10 dark:opacity-20" />

      <div className="container mx-auto max-w-7xl py-16 md:py-20 px-4 lg:px-0">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          {/* Texto */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-center lg:text-left"
              initial="offScreen"
              whileInView="onScreen"
              viewport={{ once: true, amount: 0.4 }}
              variants={slideInFromBottom({ delay: 0.1 })}
            >
              Valida tu{" "}
              <span className="text-sky-500 dark:text-sky-400">Certificado</span>
            </motion.h2>

            <motion.p
              className="text-base md:text-lg lg:text-xl text-neutral-600 dark:text-neutral-300 mb-8 text-center lg:text-left"
              initial="offScreen"
              whileInView="onScreen"
              viewport={{ once: true, amount: 0.4 }}
              variants={slideInFromBottom({ delay: 0.25 })}
            >
              Verifica la autenticidad de cualquier certificado emitido en nuestra
              plataforma. Solo necesitas el ID del certificado para consultar toda
              su información en la blockchain.
            </motion.p>

            <motion.div
              className="flex gap-4 justify-center lg:justify-start"
              initial="offScreen"
              whileInView="onScreen"
              viewport={{ once: true, amount: 0.4 }}
              variants={slideInFromBottom({ delay: 0.4 })}
            >
              <Link
                href="/validator"
                className="px-6 py-3 md:px-8 md:py-4 rounded-lg font-semibold text-white bg-sky-500 hover:bg-sky-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 border-2 border-sky-500 hover:border-sky-600 relative overflow-hidden group"
              >
                <span className="relative z-10">Validar Certificado</span>
                <span className="absolute inset-0 bg-sky-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              </Link>
              <Link
                href="/explorer"
                className="px-6 py-3 md:px-8 md:py-4 rounded-lg font-semibold bg-neutral-200 text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 transition-all duration-300 border-2 border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 relative overflow-hidden group"
              >
                <span className="relative z-10">Explorar</span>
                <span className="absolute inset-0 bg-sky-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              </Link>
            </motion.div>
          </div>

          {/* Tarjetas */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
              initial="offScreen"
              whileInView="onScreen"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideInFromLeft({ delay: 0.5 })}
            >
              {/* Card 1 */}
              <div className="flex flex-col items-center p-6 md:p-8 rounded-xl border backdrop-blur-sm
                              bg-white/70 border-neutral-200 hover:border-sky-400
                              dark:bg-neutral-900/60 dark:border-neutral-800 dark:hover:border-sky-500
                              transition-colors">
                {/* Tabler usa currentColor si no pasas 'color' */}
                <IconShieldCheck size={60} className="mb-4 text-sky-500 dark:text-sky-400" />
                <h3 className="text-lg md:text-xl font-bold mb-2">
                  Verificación Inmutable
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                  Los datos se almacenan de forma permanente en la blockchain.
                </p>
              </div>

              {/* Card 2 */}
              <div className="flex flex-col items-center p-6 md:p-8 rounded-xl border backdrop-blur-sm
                              bg-white/70 border-neutral-200 hover:border-sky-400
                              dark:bg-neutral-900/60 dark:border-neutral-800 dark:hover:border-sky-500
                              transition-colors">
                <IconCertificate size={60} className="mb-4 text-sky-500 dark:text-sky-400" />
                <h3 className="text-lg md:text-xl font-bold mb-2">
                  Acceso Público
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                  Cualquier persona puede verificar la autenticidad.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Validator;
