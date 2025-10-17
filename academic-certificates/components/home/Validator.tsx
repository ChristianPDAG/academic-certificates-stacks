"use client";

import { motion } from "framer-motion";
import { slideInFromBottom, slideInFromLeft } from "@/utils/motion";
import { IconCertificate, IconShieldCheck } from "@tabler/icons-react";
import Link from "next/link";

const Validator = () => {
  return (
    <section className="relative w-full">
      <div className="bg-[url('/img/bg-waves-3.svg')] w-full h-full bg-cover bg-center absolute top-0 left-0 opacity-15 dark:opacity-15 -z-10" />

      <div className="container mx-auto max-w-7xl z-10 py-20 px-4 lg:px-0">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <motion.h2
              className="text-5xl lg:text-6xl font-bold mb-6 text-center lg:text-left"
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromBottom({ delay: 0.2 })}
            >
              Valida tu <span className="text-[#00A1FF]">Certificado</span>
            </motion.h2>
            <motion.p
              className="text-lg lg:text-2xl text-neutral-600 dark:text-neutral-300 mb-8 text-center lg:text-left"
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromBottom({ delay: 0.4 })}
            >
              Verifica la autenticidad de cualquier certificado emitido en nuestra plataforma. 
              Solo necesitas el ID del certificado para consultar toda su información en la blockchain.
            </motion.p>
            <motion.div
              className="flex gap-4 justify-center lg:justify-start"
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromBottom({ delay: 0.6 })}
            >
              <Link
                href="/validator"
                className="px-8 py-4 bg-[#00A1FF] hover:bg-[#0081CC] text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Validar Certificado
              </Link>
              <Link
                href="/explorer"
                className="px-8 py-4 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 font-semibold rounded-lg transition-all duration-300"
              >
                Explorar
              </Link>
            </motion.div>
          </div>

          <div className="w-full lg:w-1/2 flex justify-center">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromLeft({ delay: 0.8 })}
            >
              <div className="flex flex-col items-center p-8 bg-white/20 dark:bg-black-200/20 backdrop-blur-sm rounded-xl border border-neutral-300 dark:border-neutral-800 hover:border-[#00A1FF] transition-all duration-300">
                <IconShieldCheck size={60} color="#00A1FF" className="mb-4" />
                <h3 className="text-xl font-bold mb-2 text-neutral-800 dark:text-neutral-100">
                  Verificación Inmutable
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                  Los datos se almacenan de forma permanente en la blockchain
                </p>
              </div>

              <div className="flex flex-col items-center p-8 bg-white/20 dark:bg-black-200/20 backdrop-blur-sm rounded-xl border border-neutral-300 dark:border-neutral-800 hover:border-[#00A1FF] transition-all duration-300">
                <IconCertificate size={60} color="#00A1FF" className="mb-4" />
                <h3 className="text-xl font-bold mb-2 text-neutral-800 dark:text-neutral-100">
                  Acceso Público
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                  Cualquier persona puede verificar la autenticidad
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
