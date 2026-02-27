import type { Metadata } from "next";
import FAQPageContent from "@/components/public/faq-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Preguntas Frecuentes",
  description:
    "Resuelve dudas sobre emisión, validación y verificación de certificados académicos en blockchain con Certifikurs.",
  path: "/faq",
});

export default function FAQPage() {
  return <FAQPageContent />;
}
