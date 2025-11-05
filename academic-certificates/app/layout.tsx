import Footer from "@/components/navigation/Footer";
import FloatingNav from "@/components/navigation/Header";
import { Providers } from "./providers";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  metadataBase: new URL('https://certifikurs.vercel.app'),
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
          <FloatingNav />
          {children}
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
