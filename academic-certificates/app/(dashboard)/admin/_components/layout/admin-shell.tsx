"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ThemeSwitcher } from "@/components/theme-switcher";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  const navItems = [
    {
      href: "/admin",
      label: t("admin.shell.overview"),
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/admin/academies",
      label: t("admin.shell.academies"),
      icon: Building2,
      exact: false,
    },
  ];

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
      <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
        <div className="border-b border-slate-200 bg-sky-50 p-6 dark:border-slate-800 dark:bg-sky-500/10">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-500/20">
            <ShieldCheck className="h-6 w-6 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-sky-700 dark:text-sky-400">Certifikurs</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t("admin.shell.consoleTitle")}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {t("admin.shell.consoleDescription")}
          </p>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium ${
                  isActive
                    ? "border-sky-200 bg-sky-50 text-sky-700 shadow-sm dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300"
                    : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-100 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800/80"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-slate-200 p-4 dark:border-slate-800">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/70 dark:hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            <span>{t("admin.shell.logout")}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end gap-2">
                        <ThemeSwitcher side="left" />
            <LanguageSelector />

          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
