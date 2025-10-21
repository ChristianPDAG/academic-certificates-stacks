"use client";


import { motion } from "framer-motion";
import { slideInFromBottom, slideInFromLeft } from "@/utils/motion";

const Hero = () => {


  return (
    <div className="min-h-screen relative w-full">
      <div className="absolute z-10 w-auto min-w-full max-w-none h-screen overflow-hidden">
        <video
          autoPlay
          loop
          muted
          className="w-auto min-w-full min-h-full max-w-none"
        >
          <source src="/videos/hero-video-3.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="absolute h-screen w-screen bg-black-100/55 inset-0 z-10" />

      <section id="nosotros" className="container mx-auto max-w-7xl z-10">
        <div className="flex items-center w-full min-h-screen">
          <div className="flex flex-col lg:flex-row lg:items-center my-28 lg:my-20 z-10 gap-x-4">
            <div className="w-full lg:w-1/2">
              <motion.p
                className="uppercase tracking-widest text-base text-blue-100 text-center lg:text-left"
                initial={"offScreen"}
                whileInView={"onScreen"}
                viewport={{ once: true }}
                variants={slideInFromBottom({ delay: 0.2 })}
              >
                Certifikurs
              </motion.p>
              <motion.h1
                className="text-white text-4xl lg:text-6xl text-center lg:text-left font-bold leading-tight tracking-wide my-2"
                initial={"offScreen"}
                whileInView={"onScreen"}
                viewport={{ once: true }}
                variants={slideInFromBottom({ delay: 0.4 })}
              >
                Blockchain Course Validation <br />
                <span className="text-[#00A1FF]">potenciado por la AI</span>
              </motion.h1>

              <motion.p
                className="md:tracking-wider text-base md:text-lg lg:text-2xl text-gray-100 text-center lg:text-left mb-4 lg:mb-0"
                initial={"offScreen"}
                whileInView={"onScreen"}
                viewport={{ once: true }}
                variants={slideInFromBottom({ delay: 0.6 })}
              >
                ¡Bienvenido a un nuevo inicio, donde la innovación el blockchain y la
                inteligencia artificial se unen para transformar el futuro!
              </motion.p>

              <motion.a
                href="#about"
                className="hidden lg:inline"
                initial={"offScreen"}
                whileInView={"onScreen"}
                viewport={{ once: true }}
                variants={slideInFromBottom({ delay: 0.8 })}
              ></motion.a>
              <>
                <motion.div
                  className="inline lg:hidden"
                  initial={"offScreen"}
                  whileInView={"onScreen"}
                  viewport={{ once: true }}
                  variants={slideInFromBottom({ delay: 0.8 })}
                ></motion.div>
              </>
            </div>
            <div className="hidden lg:block w-full lg:w-1/2">
              <motion.div
                initial={"offScreen"}
                whileInView={"onScreen"}
                viewport={{ once: true }}
                variants={slideInFromLeft({ delay: 1 })}
              ></motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
