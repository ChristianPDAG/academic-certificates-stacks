"use client";

import React from "react";
import Image from "next/image";
import { PinContainer } from "@/components/ui/3dPin";
import { motion } from "framer-motion";
import {
  slideInFromBottom,
  slideInFromLeft,
  slideInFromRight,
} from "@/utils/motion";

const About = () => {
  return (
    <section id="about" className="w-full relative">
      <div className="bg-[url('/bg-nodes-1.svg')] w-full h-full bg-cover bg-center absolute bottom-0 left-0 opacity-50 dark:opacity-20 -z-10" />

      <div className="py-20 container mx-auto max-w-7xl z-10">
        <div className="flex flex-col lg:flex-row py-12 z-10">
          <div className="w-full lg:w-1/2 text-lg lg:text-2xl mb-4 flex flex-col justify-center">
            <motion.h2
              className="text-6xl font-bold mb-4"
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromBottom({ delay: 0.2 })}
            >
              <span className="text-[#00A1FF]">Características del Sistema</span>
            </motion.h2>
            <motion.p
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromBottom({ delay: 0.4 })}
            >
              <strong>Seguridad Blockchain</strong> los certificados se almacenan de forma inmutable en la blockchain de Stacks
            </motion.p>
          </div>
          <div className="w-full lg:w-1/2 flex justify-center">
            <motion.div
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromLeft({ delay: 0.8 })}
            >
              <PinContainer title="Tecnología Blockchain e Inteligencia Artificial">
                <div className="flex basis-full flex-col p-1 tracking-tight text-slate-100/50 sm:basis-1/2 w-[20rem] h-[12rem] lg:w-[24rem] lg:h-[15rem]">
                  <div className="flex flex-1 w-full rounded-lg mt-4 overflow-hidden">
                    <Image
                      src={"/img/1-image.png"}
                      alt="Tecnología Oval Campus"
                      fill
                    />
                  </div>
                </div>
              </PinContainer>
            </motion.div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row py-12 z-10">
          <div className="w-full lg:w-1/2 flex items-center justify-center z-10">
            <motion.div
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromRight({ delay: 0.8 })}
            >
              <Image
                src={"/img/aliance.png"}
                alt="Ilustración de bombilla"
                width={380}
                height={380}
              />
            </motion.div>
          </div>
          <div className="w-full lg:w-1/2 text-lg lg:text-2xl flex flex-col justify-center z-10">
            <motion.h3
              className="text-5xl font-bold mb-4"
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromBottom({ delay: 0.2 })}
            >
              Verificación{" "}
              <span className="text-[#00A1FF]">Instantánea </span>
            </motion.h3>
            <motion.p
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromBottom({ delay: 0.4 })}
            >
              Cualquier persona puede verificar la autenticidad de un certificado.
            </motion.p>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row py-12">
          <div className="w-full lg:w-1/2 text-lg lg:text-2xl flex flex-col justify-center z-10">
            <motion.h3
              className="text-5xl font-bold mb-4"
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromBottom({ delay: 0.2 })}
            >
              Multi-<span className="text-[#00A1FF]">Academia</span>
            </motion.h3>
            <motion.p
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromBottom({ delay: 0.4 })}
            >
              Múltiples instituciones pueden emitir certificados en el mismo sistema.
            </motion.p>
          </div>
          <div className="w-full lg:w-1/2 flex justify-center items-center z-10">
            <motion.div
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromLeft({ delay: 0.8 })}
            >
              <Image
                src={"/img/bg-nodes-2.svg"}
                alt="Vista de aplicación web"
                width={400}
                height={400}
              />
            </motion.div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row py-12">
          <div className="w-full lg:w-1/2 flex justify-center items-center z-10">
            <motion.div
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromLeft({ delay: 0.2 })}
            >
              <Image
                src={'/img/bg-nodes-1.svg'}
                alt="Wallet del estudiante"
                width={380}
                height={380}
              />
            </motion.div>
          </div>
          <div className="w-full lg:w-1/2 text-lg lg:text-2xl flex flex-col justify-center z-10">
            <motion.h3
              className="text-5xl font-bold mb-4 text-right lg:text-left lg:pl-8"
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromRight({ delay: 0.4 })}
            >
              Propiedad del <span className="text-[#00A1FF]">Estudiante</span>
            </motion.h3>
            <motion.p
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromRight({ delay: 0.6 })}
              className="text-right lg:text-left lg:pl-8"
            >
              Los certificados se almacenan directamente en el wallet del estudiante.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
