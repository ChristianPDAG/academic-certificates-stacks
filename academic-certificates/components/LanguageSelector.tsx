"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { IconGlobe, IconChevronDown } from "@tabler/icons-react";

type Pos = { top: number; left: number; width: number };

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<Pos>({ top: 0, left: 0, width: 0 });

  const languages = [
    { code: "en", name: t("languages.english"), flag: "🇺🇸" },
    { code: "es", name: t("languages.spanish"), flag: "🇪🇸" },
  ];

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
    window.dispatchEvent(new Event("languageChanged"));
  };

  // Mark mounted for portal
  useEffect(() => setMounted(true), []);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const onDown = (e: MouseEvent) => {
      const root = rootRef.current;
      if (root && !root.contains(e.target as Node)) setIsOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isOpen]);

  // Reposition when open + on resize/scroll
  const computePos = () => {
    const btn = buttonRef.current;
    if (!btn) return;

    const r = btn.getBoundingClientRect();

    const panelW = 176; // w-44 = 11rem = 176px
    const gap = 8; // mt-2

    const top = r.bottom + gap;

    // "end" alignment by default (right aligned to button)
    const idealLeft = r.right - panelW;

    const left = clamp(idealLeft, 8, window.innerWidth - panelW - 8);

    setPos({ top, left, width: r.width });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    computePos();

    const onResize = () => computePos();
    const onScroll = () => computePos();

    window.addEventListener("resize", onResize);
    // capture true para recalcular incluso si hay scroll dentro de contenedores
    window.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((v) => !v);
        }}
        className="flex items-center gap-2 px-3 py-2 bg-background/50 border border-border rounded-lg hover:bg-accent transition-all text-foreground font-medium h-9 min-w-[44px]"
        aria-label={t("languages.selectLanguage")}
      >
        <IconGlobe className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline text-sm shrink-0">
          {currentLanguage.flag}
        </span>
        <IconChevronDown
          className={`h-3 w-3 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {mounted && isOpen &&
        createPortal(
          <div
            // overlay “invisible” para capturar clicks fuera sin afectar layout
            className="fixed inset-0 z-[60]"
            onMouseDown={() => setIsOpen(false)}
          >
            <div
              className="fixed w-44 bg-background border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
              style={{ top: pos.top, left: pos.left }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="py-1">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      changeLanguage(language.code);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-3 ${
                      i18n.language === language.code
                        ? "text-primary font-semibold bg-accent/50"
                        : "text-foreground font-medium"
                    }`}
                  >
                    <span className="text-base">{language.flag}</span>
                    <span className="flex-1">{language.name}</span>
                    {i18n.language === language.code && (
                      <span className="text-primary font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default LanguageSelector;