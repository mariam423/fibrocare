"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  HeartIcon,
  ArrowLeft01Icon,
  Menu01Icon,
  Cancel01Icon,
  Moon02Icon,
  Sun02Icon,
  LanguageCircleIcon,
  FlashIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useHealth } from "@/context/HealthContext";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  backHref?: string;
  backLabel?: string;
}

export default function AppHeader({ backHref, backLabel }: AppHeaderProps) {
  const { isDark, toggleDark } = useHealth();
  const { locale, setLocale, t } = useLanguage();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const NAV_LINKS = [
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/pro/doctor", label: t("nav.doctorHub") },
    { href: "/pro/consultations", label: t("nav.consultations") },
    { href: "/profile", label: t("nav.profile") },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/60 dark:border-emerald-500/10 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 sm:px-8 lg:px-12 max-w-6xl">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
            <HugeiconsIcon
              icon={HeartIcon}
              className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
          </div>
          <Link
            href="/dashboard"
            className="text-xl font-semibold tracking-tight text-slate-900 dark:text-foreground whitespace-nowrap"
          >
            FibroCare
          </Link>
        </div>

        {backHref ? (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setLocale(locale === "en" ? "ar" : "en")}
              variant="ghost"
              size="sm"
              className="rounded-full bg-muted hover:bg-muted/80 text-xs font-medium gap-1.5"
            >
              <HugeiconsIcon
                icon={LanguageCircleIcon}
                className="h-4 w-4"
                aria-hidden="true"
              />
              {locale === "en" ? "عربي" : "EN"}
            </Button>
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-muted-foreground transition-colors hover:text-slate-900 dark:hover:text-foreground hover:bg-muted"
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                className="h-4 w-4 rtl:scale-x-[-1]"
                aria-hidden="true"
              />
              {backLabel ?? t("nav.backToDashboard")}
            </Link>
          </div>
        ) : (
          <>
            <nav
              className="hidden md:flex items-center gap-1 text-base font-medium text-slate-600 dark:text-slate-300"
              aria-label="Primary"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center rounded-lg px-3 py-2 transition-colors hover:text-slate-900 dark:hover:text-foreground hover:bg-muted",
                    pathname === link.href &&
                      "bg-primary/10 text-primary font-semibold"
                  )}
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              {/* FibroCare Pro */}
              <Link
                href="/pro"
                className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-600/30 dark:border-emerald-400/40 bg-emerald-600/10 dark:bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 transition-colors hover:bg-emerald-600/20 dark:hover:bg-emerald-500/25"
              >
                <HugeiconsIcon icon={FlashIcon} className="h-3.5 w-3.5" aria-hidden="true" />
                {t("nav.upgradePro")}
              </Link>

              <NotificationBell />

              <Button
                onClick={() => setLocale(locale === "en" ? "ar" : "en")}
                variant="ghost"
                size="icon"
                className="rounded-full bg-muted hover:bg-muted/80"
              >
                <HugeiconsIcon
                  icon={LanguageCircleIcon}
                  className="h-5 w-5 text-slate-500 dark:text-muted-foreground"
                  aria-hidden="true"
                />
              </Button>

              <Button
                onClick={toggleDark}
                variant="ghost"
                size="icon"
                className="rounded-full bg-muted hover:bg-muted/80"
              >
                {isDark ? (
                  <HugeiconsIcon
                    icon={Sun02Icon}
                    className="h-5 w-5 text-amber-400"
                    aria-hidden="true"
                  />
                ) : (
                  <HugeiconsIcon
                    icon={Moon02Icon}
                    className="h-5 w-5 text-slate-600"
                    aria-hidden="true"
                  />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-muted hover:bg-muted/80 md:hidden"
                onClick={() => setMobileOpen((v) => !v)}
              >
                <HugeiconsIcon
                  icon={mobileOpen ? Cancel01Icon : Menu01Icon}
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out md:hidden",
          mobileOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <nav
            className="flex flex-col gap-1 px-6 pb-3 pt-2 sm:px-8 lg:px-12 bg-white/95 dark:bg-background/95 backdrop-blur-xl"
            aria-label="Mobile"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                  pathname === link.href &&
                    "bg-primary/10 text-primary font-semibold"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/pro"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-emerald-700 dark:text-emerald-300 transition-colors hover:bg-emerald-600/10 dark:hover:bg-emerald-500/10"
            >
              <HugeiconsIcon icon={FlashIcon} className="h-4 w-4" aria-hidden="true" />
              {t("nav.upgradePro")}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
