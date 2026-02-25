import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} | Certificados académicos en blockchain`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Emite, valida y explora certificados académicos en blockchain con Certifikurs.",
  keywords: [
    "certificados académicos",
    "blockchain",
    "Stacks",
    "validación de certificados",
    "verificación de certificados",
    "Certifikurs",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vercel.com" />
      </head>
      <body className="">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
