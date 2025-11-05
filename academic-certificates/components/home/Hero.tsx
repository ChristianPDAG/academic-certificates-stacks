"use client";

import { memo, useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";

const slideInFromBottom = ({ delay = 0 }) => ({
  offScreen: {
    y: 50,
    opacity: 0,
  },
  onScreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      bounce: 0.4,
      duration: 0.8,
      delay,
    },
  },
});

const slideInFromLeft = ({ delay = 0 }) => ({
  offScreen: {
    x: -50,
    opacity: 0,
  },
  onScreen: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      bounce: 0.4,
      duration: 0.8,
      delay,
    },
  },
});

const Hero = memo(() => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    // Cargar video después del render inicial
    const timer = setTimeout(() => {
      setShouldLoadVideo(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (shouldLoadVideo && videoRef.current) {
      videoRef.current.load();
    }
  }, [shouldLoadVideo]);

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen relative w-full">
        {/* Fondo de respaldo mientras carga el video */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-gray-900 to-black" />

        {shouldLoadVideo && (
          <div className="absolute z-10 w-auto min-w-full max-w-none h-screen overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              poster="/img/hero-poster.jpg"
              onLoadedData={() => setVideoLoaded(true)}
              className={`w-auto min-w-full min-h-full max-w-none transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <source src="/videos/hero-video-3.mp4" type="video/mp4" />
            </video>
          </div>
        )}
        <div className="absolute h-screen w-screen bg-black-100/55 inset-0 z-10" />

        <section id="nosotros" className="container mx-auto max-w-7xl z-10">
          <div className="flex items-center w-full min-h-screen">
            <m.div
              className="flex flex-col lg:flex-row lg:items-center my-28 lg:my-20 z-10 gap-x-4"
              initial="offScreen"
              whileInView="onScreen"
              viewport={{ once: true, amount: 0.1, margin: "100px" }}
              transition={{ staggerChildren: 0.2 }}
            >
              <div className="w-full lg:w-1/2">
                <m.p
                  className="uppercase tracking-widest text-base text-blue-100 text-center lg:text-left"
                  variants={slideInFromBottom({ delay: 0 })}
                >
                  Certifikurs
                </m.p>
                <m.h1
                  className="text-white text-4xl lg:text-6xl text-center lg:text-left font-bold leading-tight tracking-wide my-2"
                  variants={slideInFromBottom({ delay: 0.1 })}
                >
                  El Fin de los Certificados Falsos <br />
                  <span className="text-[#00A1FF]">Confianza Instantánea</span>
                </m.h1>

                <m.p
                  className="md:tracking-wider text-base md:text-lg lg:text-2xl text-gray-100 text-center lg:text-left mb-4 lg:mb-0"
                  variants={slideInFromBottom({ delay: 0.2 })}
                >
                  Conectamos instituciones, estudiantes y empresas con una fuente única de la verdad. <b>Protege tu prestigio, demuestra tu valor, contrata con certeza.</b>
                </m.p>

                <m.a
                  href="#about"
                  className="hidden lg:inline"
                  variants={slideInFromBottom({ delay: 0.3 })}
                ></m.a>
                <>
                  <m.div
                    className="inline lg:hidden"
                    variants={slideInFromBottom({ delay: 0.3 })}
                  ></m.div>
                </>
              </div>
              <div className="hidden lg:block w-full lg:w-1/2">
                <m.div
                  variants={slideInFromLeft({ delay: 0.4 })}
                ></m.div>
              </div>
            </m.div>
          </div>
        </section>
      </div>
    </LazyMotion>
  );
});

Hero.displayName = 'Hero';

export default Hero;
