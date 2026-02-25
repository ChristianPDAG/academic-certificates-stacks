import type { Metadata } from "next";
import PublicExplorer from "@/components/public/public-explorer";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Explorer de Certificados | Certifikurs",
  description:
    "Explora certificados, academias y datos públicos en blockchain de Stacks con el explorer de Certifikurs.",
  path: "/explorer",
});

export default function ExplorerPage() {
    return <PublicExplorer />;
}
