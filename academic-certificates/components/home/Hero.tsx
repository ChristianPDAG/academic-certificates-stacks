"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { slideInFromBottom, slideInFromLeft } from "@/utils/motion";

const Hero = memo(() => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // Precargar el video de manera optimizada
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  return (
    <div className="min-h-screen relative w-full">
      <div className="absolute z-10 w-auto min-w-full max-w-none h-screen overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/img/hero-poster.jpg"
          onLoadedData={() => setVideoLoaded(true)}
          className={`w-auto min-w-full min-h-full max-w-none transition-opacity duration-500 ${videoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <source src="/videos/hero-video-3.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="absolute h-screen w-screen bg-black-100/55 inset-0 z-10" />

      <section id="nosotros" className="container mx-auto max-w-7xl z-10">
        <div className="flex items-center w-full min-h-screen">
          <motion.div
            className="flex flex-col lg:flex-row lg:items-center my-28 lg:my-20 z-10 gap-x-4"
            initial="offScreen"
            whileInView="onScreen"
            viewport={{ once: true, amount: 0.1, margin: "100px" }}
            transition={{ staggerChildren: 0.2 }}
          >
            <div className="w-full lg:w-1/2">
              <motion.p
                className="uppercase tracking-widest text-base text-blue-100 text-center lg:text-left"
                variants={slideInFromBottom({ delay: 0 })}
              >
                Certifikurs
              </motion.p>
              <motion.h1
                className="text-white text-4xl lg:text-6xl text-center lg:text-left font-bold leading-tight tracking-wide my-2"
                variants={slideInFromBottom({ delay: 0.1 })}
              >
                El Fin de los Certificados Falsos <br />
                <span className="text-[#00A1FF]">Confianza Instantánea</span>
              </motion.h1>

              <motion.p
                className="md:tracking-wider text-base md:text-lg lg:text-2xl text-gray-100 text-center lg:text-left mb-4 lg:mb-0"
                variants={slideInFromBottom({ delay: 0.2 })}
              >
                Conectamos instituciones, estudiantes y empresas con una fuente única de la verdad. <b>Protege tu prestigio, demuestra tu valor, contrata con certeza.</b>
              </motion.p>

              <motion.a
                href="#about"
                className="hidden lg:inline"
                variants={slideInFromBottom({ delay: 0.3 })}
              ></motion.a>
              <>
                <motion.div
                  className="inline lg:hidden"
                  variants={slideInFromBottom({ delay: 0.3 })}
                ></motion.div>
              </>
            </div>
            <div className="hidden lg:block w-full lg:w-1/2">
              <motion.div
                variants={slideInFromLeft({ delay: 0.4 })}
              ></motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
});

Hero.displayName = 'Hero';

export default Hero;
