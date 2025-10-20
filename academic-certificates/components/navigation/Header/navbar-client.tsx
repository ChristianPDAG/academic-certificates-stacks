"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { IconMenu2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";

import { LogoutButton } from "@/components/auth/logout-button"; // ← Debe ser client-safe
import { Navigation } from "@/components/navigation/navigation-fixed"; // tu menú de usuario


type Props = {
  userEmail: string | null;
  hasEnvVars: boolean;
};

export function FloatingNavClient({ userEmail, hasEnvVars }: Props) {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current !== "number") return;
    const direction = current - (scrollYProgress.getPrevious() ?? 0);
    if (scrollYProgress.get() < 0.05) setVisible(true);
    else setVisible(direction < 0);
  });

  return (
    <header
      className={`container mx-auto max-w-7xl px-4 fixed top-3 inset-x-0 z-40 rounded-lg border border-black/10 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] bg-white/90 dark:bg-[#111928]/50 transition-all ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none"
      }`}
      style={{
        backdropFilter: "blur(8px) saturate(180%)",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.125)",
      }}
    >
      <nav className="py-2.5 flex justify-between items-center">
        <div className="flex items-center gap-x-5">
          <Link href="/" className="w-[100px]">
            <Image src="/logos/logo.png" alt="logo" width={50} height={30} />
          </Link>
        </div>

        <div className="flex items-center gap-x-2">
          {/* Theme switcher siempre visible */}
        

          {/* Bloque auth */}
          { userEmail ? (
            // Usuario logeado
            <div className="hidden lg:flex items-center gap-4">
              <Navigation user={{ email: userEmail }} />
              <LogoutButton />
            </div>
          ) : (
            // No logeado
            <div className="hidden lg:flex items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/sign-up">Sign up</Link>
              </Button>
            </div>
          )}

          {/* Menú móvil */}
          <div className="flex lg:hidden">
            <Menu as="div">
              <MenuButton className="items-center text-sm/6 font-semibold focus:outline-none">
                <IconMenu2 className="stroke-neutral-900 dark:stroke-neutral-200" />
                <span className="sr-only">Menú</span>
              </MenuButton>
              <MenuItems
                transition
                anchor="bottom end"
                className="w-56 origin-top-right mt-5 rounded-xl z-50 border border-black/10 shadow bg-white/80 dark:bg-[#111928]/70 p-1 text-sm/6 transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
                style={{
                  backdropFilter: "blur(10px) saturate(180%)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.125)",
                }}
              >


                <div className="my-1 h-px bg-black/10" />

                {!hasEnvVars ? (
                  <div className="px-3 py-2">
                    <EnvVarWarning />
                  </div>
                ) : userEmail ? (
                  <div className="px-3 py-1.5 flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
                      {userEmail}
                    </span>
                    <LogoutButton />
                  </div>
                ) : (
                  <div className="px-3 py-1.5 flex gap-2">
                    <Button asChild size="sm" variant="outline" className="w-full">
                      <Link href="/auth/login">Sign in</Link>
                    </Button>
                    <Button asChild size="sm" className="w-full">
                      <Link href="/auth/sign-up">Sign up</Link>
                    </Button>
                  </div>
                )}
              </MenuItems>
            </Menu>
          </div>

            <ThemeSwitcher />
        </div>
      </nav>
    </header>
  );
}
