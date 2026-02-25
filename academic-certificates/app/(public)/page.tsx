import dynamic from 'next/dynamic';
import Hero from "@/components/home/Hero";
import { Metadata, Viewport } from "next";
import Blog from "@/components/Blog";
import { buildPageMetadata } from "@/lib/seo";
// Lazy load de componentes que están fuera del viewport inicial
const Validator = dynamic(() => import("@/components/home/Validator"), {
  loading: () => <div className="min-h-screen" />,
  ssr: true,
});

const Advantages = dynamic(() => import("@/components/home/Advantages"), {
  loading: () => <div className="min-h-screen" />,
  ssr: true,
});

const About = dynamic(() => import("@/components/home/About"), {
  loading: () => <div className="min-h-screen" />,
  ssr: true,
});

const FAQSection = dynamic(() => import("@/components/home/FAQSection"), {
  loading: () => <div className="min-h-screen" />,
  ssr: true,
});

export const metadata: Metadata = buildPageMetadata({
  title: "Inicio | Certifikurs",
  description:
    "Certifikurs permite emitir, validar y explorar certificados académicos en la blockchain de Stacks con verificación segura y transparente.",
  path: "/",
});

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
      <Blog />
      <Advantages />
      <About />
    </main>
  );
}
