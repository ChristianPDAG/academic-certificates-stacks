import type { Metadata } from "next";

import ValidatorComponent from "@/components/public/ValidatorComponent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Validador de Certificados | Certifikurs",
  description:
    "Verifica la autenticidad de certificados académicos emitidos en blockchain. Ingresa un ID o txid y valida en segundos con Certifikurs.",
  path: "/validator",
});

export default function ValidatorPage() {
  return <ValidatorComponent />;
}
