"use client";

import { I18nProvider } from "@/components/I18nProvider";
import { ThemeProvider } from "next-themes";


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" enableSystem={false} defaultTheme="light">
      <I18nProvider>
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}
