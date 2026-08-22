"use client";

import { useEffect, useState } from "react";
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
import { PricingModal } from "@/components/pricing/PricingModal";
import { Button } from "@/components/ui/button";
import { AiStatusBadge } from "@/components/ai/AiStatusBadge";
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
  const [pricingOpen, setPricingOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const NAV_LINKS = [
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/toolkit", label: t("nav.toolkit") },
    { href: "/health-logs", label: t("nav.healthLogs") },
    { href: "/profile", label: t("nav.profile") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 sm:px-8 lg:px-12 max-w-6xl">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
            <HugeiconsIcon
              icon={HeartIcon}
              className="h-5 w-5 text-emerald-400"
              aria-hidden="true"
            />
          </div>
          <Link
            href="/dashboard"
            className="text-xl font-semibold tracking-tight text-foreground whitespace-nowrap"
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
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
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
              className="hidden md:flex items-center gap-1 text-base font-medium text-muted-foreground"
              aria-label="Primary"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center rounded-lg px-3 py-2 transition-colors hover:text-foreground hover:bg-muted",
                    pathname === link.href &&
                      "bg-primary/10 text-primary font-semibold"
                  )}
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline-flex">
                <AiStatusBadge />
              </span>

              {/* FibroCare Pro */}
              <button
                type="button"
                onClick={() => setPricingOpen(true)}
                className="hidden sm:inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-haspopup="dialog"
              >
                <HugeiconsIcon icon={FlashIcon} className="h-3.5 w-3.5" aria-hidden="true" />
                {t("pricing.pro.badge")}
              </button>
              <PricingModal
                open={pricingOpen}
                onClose={() => setPricingOpen(false)}
                checkoutUrl={process.env.NEXT_PUBLIC_CHECKOUT_URL}
              />

              <Button
                onClick={() => setLocale(locale === "en" ? "ar" : "en")}
                variant="ghost"
                size="icon"
                className="rounded-full bg-muted hover:bg-muted/80"
              >
                <HugeiconsIcon
                  icon={LanguageCircleIcon}
                  className="h-5 w-5 text-muted-foreground"
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
                    className="h-5 w-5 text-primary"
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
            className="flex flex-col gap-1 px-6 pb-3 pt-2 sm:px-8 lg:px-12 bg-background/95 backdrop-blur-xl"
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
          </nav>
        </div>
      </div>
    </header>
  );
}