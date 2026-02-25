"use client";

import type { ReactNode } from "react";

export function AuthPageShell({
  children,
  maxWidth = "max-w-sm",
}: {
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <main className="relative min-h-screen w-full bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="absolute inset-0 bg-[url('/img/bg-nodes-2.svg')] bg-cover bg-center opacity-10 dark:opacity-20" />
      <section className="relative z-10 container mx-auto max-w-7xl px-4 lg:px-0 pt-12 md:pt-16 mt-20 pb-16 md:pb-20">
        <div className={`mx-auto w-full ${maxWidth}`}>
          {children}
        </div>
      </section>
    </main>
  );
}
