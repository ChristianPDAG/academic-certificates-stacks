"use client";
import Image from "next/image";
import Link from "next/link";
import { IconMail } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-background border-t border-white/10">
      <div className="container mx-auto max-w-7xl px-4 py-16 md:py-20 lg:py-24">
        {/* GRID CENTRADO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 items-start text-center lg:text-left">
          {/* Col 1: brand */}
          <div className="mx-auto lg:mx-0 max-w-xs">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/logos/logo.png"
                alt="logo"
                width={120}
                height={36}
                className="h-auto w-[120px]"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              {t("footer.copyright")}
            </p>
          </div>

          {/* Col 2: enlaces */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-foreground">{t("footer.links")}</h2>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-base text-muted-foreground hover:text-primary transition"
                >
                  {t("navbar.home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/explorer"
                  className="text-base text-muted-foreground hover:text-primary transition"
                >
                  {t("navbar.explorer")}
                </Link>
              </li>
              <li>
                <Link
                  href="/validator"
                  className="text-base text-muted-foreground hover:text-primary transition"
                >
                  {t("navbar.validator")}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-base text-muted-foreground hover:text-primary transition"
                >
                  {t("navbar.blog")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: legal */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-foreground">{t("footer.legal")}</h2>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/terminos"
                  className="text-base text-muted-foreground hover:text-primary transition"
                >
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidad"
                  className="text-base text-muted-foreground hover:text-primary transition"
                >
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-base text-muted-foreground hover:text-primary transition"
                >
                  {t("footer.cookies")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: contacto */}
          <div className="mx-auto lg:mx-0">
            <h2 className="mb-4 text-xl font-bold text-foreground">{t("footer.contact")}</h2>
            <ul className="space-y-3">
              <li className="inline-flex lg:flex items-center gap-2 text-base">
                <IconMail size={22} className="text-foreground" />
                <span className="text-foreground">certifikurs@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
