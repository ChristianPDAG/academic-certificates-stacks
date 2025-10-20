import Footer from "@/components/navigation/Footer";
import FloatingNav from "@/components/navigation/Header";
import { Providers } from "./providers";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="es">
      <head />
      <body className="">
        <Providers>
          <FloatingNav />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
