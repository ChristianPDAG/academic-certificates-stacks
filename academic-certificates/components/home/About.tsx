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
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();
  
  return (
    <section id="about" className="w-full relative">
      <div className="bg-[url('/img/bg-nodes-1.svg')] w-full h-full bg-cover bg-center absolute bottom-0 left-0 opacity-50 dark:opacity-20 -z-10" />

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
              <span className="text-[#00A1FF]">{t("home.about.features.title")}</span>
            </motion.h2>
            <motion.p
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromBottom({ delay: 0.4 })}
            >
              <strong>{t("home.about.features.description")}</strong>
            </motion.p>
          </div>
          <div className="w-full lg:w-1/2 flex justify-center">
            <motion.div
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromLeft({ delay: 0.8 })}
            >
              <PinContainer title={t("home.about.features.pinTitle")}>
                <div className="flex basis-full flex-col p-1 tracking-tight text-slate-100/50 sm:basis-1/2 w-[20rem] h-[12rem] lg:w-[24rem] lg:h-[15rem]">
                  <div className="flex flex-1 w-full rounded-lg mt-4 overflow-hidden">
                    <Image
                      src={"/img/1-image.png"}
                      alt="Tecnología "
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
              {t("home.about.verification.title")}{" "}
              <span className="text-[#00A1FF]">{t("home.about.verification.titleHighlight")} </span>
            </motion.h3>
            <motion.p
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromBottom({ delay: 0.4 })}
            >
              {t("home.about.verification.description")}
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
              {t("home.about.multiAcademy.title")}<span className="text-[#00A1FF]">{t("home.about.multiAcademy.titleHighlight")}</span>
            </motion.h3>
            <motion.p
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromBottom({ delay: 0.4 })}
            >
              {t("home.about.multiAcademy.description")}
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
              {t("home.about.ownership.title")} <span className="text-[#00A1FF]">{t("home.about.ownership.titleHighlight")}</span>
            </motion.h3>
            <motion.p
              initial={"offScreen"}
              whileInView={"onScreen"}
              viewport={{ once: true }}
              variants={slideInFromRight({ delay: 0.6 })}
              className="text-right lg:text-left lg:pl-8"
            >
              {t("home.about.ownership.description")}
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
