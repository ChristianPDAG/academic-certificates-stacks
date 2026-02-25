"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { IconMenu2 } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LogoutButton } from "@/components/auth/logout-button";
import { Navigation } from "@/components/navigation/navigation-fixed";
import LanguageSelector from "@/components/LanguageSelector";
import { createClient } from "@/lib/supabase/client";

export function FloatingNavClient() {
  const { t } = useTranslation();
  const { scrollYProgress } = useScroll();

  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Supabase (si lo reactivas)
    const supabase = createClient();
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data?.user?.email ?? null);
      setUserRole((data?.user?.user_metadata?.role as string) ?? null);
      setIsLoading(false);
    };
    getUser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setUserEmail(session?.user?.email ?? null);
        setUserRole((session?.user?.user_metadata?.role as string) ?? null);
      } else if (event === "SIGNED_OUT") {
        setUserEmail(null);
        setUserRole(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current !== "number") return;

    const prev = scrollYProgress.getPrevious() ?? 0;
    const direction = current - prev;

    // “scrolled” si baja un poco
    setScrolled(current > 0.05);

    // visible: muestra arriba, oculta cuando bajas, vuelve cuando subes
    if (current < 0.05) {
      setVisible(true);
    } else {
      setVisible(direction < 0); // si sube (direction negativo) mostrar
    }
  });

  const user = userEmail ? { email: userEmail, role: userRole } : null;

  return (
    <header
      className={`fixed inset-x-0 top-3 z-50 mx-auto w-[calc(100%-2rem)] max-w-6xl rounded-2xl border shadow-sm transition-all duration-300 ease-in-out
        ${
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-3 pointer-events-none"
        }
        ${
          scrolled
            ? "bg-background/95 border-border backdrop-blur-md"
            : "bg-background/80 border-border/50 backdrop-blur-sm"
        }
      `}
      style={{
        WebkitBackdropFilter: "blur(8px) saturate(180%)",
        backdropFilter: "blur(8px) saturate(180%)",
      }}
    >
      <nav className="py-2.5 px-4 flex items-center justify-between">
        {/* Left: logo */}
        <div className="flex items-center gap-x-5">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logos/logo.png" alt="logo" width={50} height={30} />
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-x-2">
          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            {!isLoading && (
              <>
                <Navigation user={user} />
                <LanguageSelector />

                {user ? (
                  <LogoutButton />
                ) : (
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="secondary">
                      <Link href="/auth/sign-up-academy">
                        {t("navbar.academySignUp")}
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/auth/login">{t("navbar.login")}</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href="/auth/sign-up">{t("navbar.signUp")}</Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="flex lg:hidden">
            <Menu as="div" className="relative">
              <MenuButton className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-accent transition-colors focus:outline-none">
                <IconMenu2 className="stroke-foreground h-5 w-5" />
                <span className="sr-only">Menú</span>
              </MenuButton>

              <MenuItems
                transition
                anchor="bottom end"
                className="w-56 origin-top-right mt-3 rounded-lg z-[60] border border-border shadow-lg bg-background/95 backdrop-blur-md p-1 text-sm/6 transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
              >
                {/* Nav links */}
                {!isLoading && (
                  <div className="py-1">
                    <Navigation user={user} className="MenuItems" />
                  </div>
                )}

                <div className="my-1 h-px bg-border" />

                {/* Language */}
                <div className="py-1">
                  <MenuItem>
                    <div className="px-2 py-1.5">
                      <LanguageSelector />
                    </div>
                  </MenuItem>
                </div>

                <div className="my-1 h-px bg-border" />

                {/* Auth */}
                {!isLoading && (
                  <div className="py-1">
                    {user ? (
                      <MenuItem>
                        <LogoutButton className="w-full text-left px-2 py-1.5 text-sm/6 rounded hover:bg-accent transition-colors" />
                      </MenuItem>
                    ) : (
                      <>
                        <MenuItem>
                          <Link
                            href="/auth/sign-up-academy"
                            className="block px-2 py-1.5 rounded hover:bg-accent transition-colors"
                          >
                            {t("navbar.academySignUp")}
                          </Link>
                        </MenuItem>
                        <MenuItem>
                          <Link
                            href="/auth/login"
                            className="block px-2 py-1.5 rounded hover:bg-accent transition-colors"
                          >
                            {t("navbar.login")}
                          </Link>
                        </MenuItem>
                        <MenuItem>
                          <Link
                            href="/auth/sign-up"
                            className="block px-2 py-1.5 rounded hover:bg-accent transition-colors"
                          >
                            {t("navbar.signUp")}
                          </Link>
                        </MenuItem>
                      </>
                    )}
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
