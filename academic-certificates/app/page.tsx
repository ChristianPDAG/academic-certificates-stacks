import Hero from "@/components/home/Hero";
import Validator from "@/components/home/Validator";
import Advantages from "@/components/home/Advantages";
import { Metadata, Viewport } from "next";
import About from "@/components/home/About";
import FAQSection from "@/components/home/FAQSection";

export const metadata: Metadata = {
  title: "Certifikurs — Validación de cursos en blockchain | ",
  description:
    "Certifikurs: valida y almacena certificados académicos en la blockchain de Stacks. Plataforma de  potenciada por IA para emitir, verificar y gestionar certificados de forma segura.",
  openGraph: {
    title: "Certifikurs — Validación de cursos en blockchain",
    description:
      "Valida certificados académicos con Certifikurs: emisión en la blockchain de Stacks y verificación instantánea. Plataforma desarrollada por .",
    url: "https://certifikurs.vercel.app",
    siteName: "",
    images: [
      {
        url: "https://certifikurs.vercel.app/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Certifikurs by ",
      },
    ],

    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Certifikurs — Validación de cursos en blockchain",
    description:
      "Certifikurs: valida y gestiona certificados académicos en la blockchain de Stacks. Plataforma de  potenciada por IA.",
    creator: "@Certifikurs",
    images: [
      {
        url: "https://certifikurs.vercel.app/tc-banner.jpg",
        width: 1200,
        height: 675,
        alt: "Certifikurs by ",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};
export default function Home() {
  return (
    <main className="relative flex dark:bg-black-100 justify-center items-center flex-col overflow-hidden mx-auto z-0">
      <Hero />
      <Validator />
      <FAQSection />
      <Advantages />
      <About />
    </main>
  );
}
