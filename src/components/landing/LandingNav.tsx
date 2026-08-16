"use client";

import * as React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  HeartIcon,
  Menu01Icon,
  Cancel01Icon,
  ArrowUpRight01Icon,
  Sun02Icon,
  Moon02Icon,
  LanguageCircleIcon,
} from "@hugeicons/core-free-icons";

import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { useHealth } from "@/context/HealthContext";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export function LandingNav() {
  const [open, setOpen] = React.useState(false);
  const { isDark, toggleDark } = useHealth();
  const { locale, setLocale, t } = useLanguage();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const NAV_LINKS = [
    { href: "#how", label: t("landing.nav.how") },
    { href: "#features", label: t("landing.nav.features") },
    { href: "#stories", label: t("landing.nav.stories") },
    { href: "#faq", label: t("landing.nav.faq") },
  ];

  return (
    <header className="sticky top-3 z-50 px-3 sm:px-4">
      <div className="mx-auto w-full max-w-7xl rounded-full surface-crisp hover-lift px-4 py-2.5 sm:px-5 sm:py-3">
        <div className="flex w-full items-center justify-between gap-3 sm:gap-4">
          {/* FIXED: شلت truncate واستبدلتها بـ whitespace-nowrap + min-w-0 */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-0"
          >
            <span className="icon-badge h-8 w-8 shrink-0 rounded-full text-sm">
              <HugeiconsIcon icon={HeartIcon} className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="whitespace-nowrap text-lg font-semibold tracking-tight text-foreground">
              FibroCare
            </span>
          </Link>

          <nav
            className="hidden items-center gap-6 md:flex lg:gap-8"
            aria-label="Primary"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 rounded-full py-1">
            {isAuthenticated ? (
              <Button
                size="sm"
                nativeButton={false}
                className="hidden rounded-full sm:inline-flex"
                render={<Link href="/dashboard" />}
              >
                {t("nav.dashboard")}
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  className="hidden rounded-full sm:inline-flex"
                  render={<Link href="/login" />}
                >
                  {t("landing.signIn")}
                </Button>
                <Button
                  size="sm"
                  nativeButton={false}
                  className="hidden rounded-full md:inline-flex"
                  render={<Link href="/signup" />}
                >
                  {t("landing.start")}
                </Button>
              </>
            )}
            <Button
              onClick={() => setLocale(locale === "en" ? "ar" : "en")}
              variant="ghost"
              size="icon"
              className="rounded-full bg-muted hover:bg-muted/80"
              aria-label={
                locale === "en" ? t("nav.switchToArabic") : t("nav.switchToEnglish")
              }
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
              aria-label={isDark ? t("header.themeLight") : t("header.themeDark")}
            >
              {isDark ? (
                <HugeiconsIcon icon={Sun02Icon} className="h-5 w-5 text-primary" aria-hidden="true" />
              ) : (
                <HugeiconsIcon icon={Moon02Icon} className="h-5 w-5 text-primary" aria-hidden="true" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full md:hidden"
              aria-label={open ? t("landing.closeMenu") : t("landing.openMenu")}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <HugeiconsIcon
                icon={open ? Cancel01Icon : Menu01Icon}
                className="h-5 w-5"
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-out md:hidden",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="overflow-hidden">
            <nav
              className="flex flex-col gap-1 px-1 pb-3 pt-2"
              aria-label="Mobile"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    className="ms-auto h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </a>
              ))}
              {isAuthenticated ? (
                <Button
                  size="lg"
                  nativeButton={false}
                  className="mt-1 w-full rounded-xl"
                  render={<Link href="/dashboard" onClick={() => setOpen(false)} />}
                >
                  {t("nav.dashboard")}
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    nativeButton={false}
                    className="mt-1 w-full rounded-xl"
                    render={<Link href="/signup" onClick={() => setOpen(false)} />}
                  >
                    {t("landing.start")}
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    nativeButton={false}
                    className="mt-1 w-full rounded-xl"
                    render={<Link href="/login" onClick={() => setOpen(false)} />}
                  >
                    {t("landing.signIn")}
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}