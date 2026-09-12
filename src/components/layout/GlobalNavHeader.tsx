"use client";

/**
 * GlobalNavHeader — the universal sticky navigation for every inner view.
 *
 * One header serves the whole authenticated app (dashboard, resources and
 * its sub-pages, pro portal and its sub-routes, profile, logs, toolkit,
 * reports) so a user is never trapped without a return path:
 *
 *  - Smart "Go Back" — router.back() when there is in-app history,
 *    falling back to a sensible parent (then /dashboard). Falls back to a
 *    plain Link when history is unknown (new tab / direct entry).
 *  - Breadcrumbs — Home › … › current page, reflecting the real route
 *    hierarchy (parameters render as their parent section).
 *  - Quick links — dashboard, doctor hub, consultations, profile; the
 *    overflow collapses into an accessible mobile menu.
 *  - Utilities — language toggle (with an accessible name) and theme
 *    toggle survive from AppHeader.
 *
 * Design: the Midnight Emerald glass treatment (blur, hairline border,
 * soft shadow) with a 3D glass stack — a translucent top highlight over a
 * gradient surface and a hairline bottom edge so the bar reads as a raised
 * glass slab. The sticky offset plus per-page safe-area padding keep
 * content clear of the bar (verified by e2e/responsive.spec.ts).
 *
 * RTL: logical properties + rtl: variants only — the back arrow mirrors
 * via rtl:scale-x-[-1]; breadcrumb separators use logical spacing.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  FlashIcon,
  HeartIcon,
  LanguageCircleIcon,
  Menu01Icon,
  Moon02Icon,
  ArrowUp01Icon,
  Sun02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useHealth } from "@/context/HealthContext";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Breadcrumb title registry                                           */
/* ------------------------------------------------------------------ */

/** Localized page title for every static inner route (breadcrumb leaf). */
const PAGE_TITLES: Record<string, TranslationKey> = {
  "/dashboard": "nav.dashboard",
  "/dashboard/consultations": "consultationsHub.title",
  "/profile": "profile.pageTitle",
  "/health-logs": "logs.pageTitle",
  "/toolkit": "toolkit.title",
  "/reports": "reports.pageTitle",
  "/resources": "resources.title",
  "/resources/about": "about.title",
  "/resources/diagnosis": "diagnosis.title",
  "/resources/treatment": "treatment.title",
  "/resources/nutrition": "nutrition.title",
  "/resources/exercises": "exercises.title",
  "/resources/faq": "faq.title",
  "/resources/community": "community.title",
  "/resources/cycle": "cycle.title",
  "/pro": "pro.page.title",
  "/pro/doctor": "nav.doctorHub",
  "/pro/consultations": "consultation.title",
  "/pro/consultations/new": "consultation.newConsultation",
};

/** Collapse dynamic parameters to their parent section. */
function crumbKeyFor(pathname: string): string | null {
  if (PAGE_TITLES[pathname]) return pathname;
  if (pathname.startsWith("/pro/consultations/")) return "/pro/consultations";
  return null;
}

const QUICK_LINKS: Array<{ href: string; labelKey: TranslationKey }> = [
  { href: "/dashboard", labelKey: "nav.dashboard" },
  { href: "/pro/doctor", labelKey: "nav.doctorHub" },
  { href: "/pro/consultations", labelKey: "nav.consultations" },
  { href: "/profile", labelKey: "nav.profile" },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface Crumb {
  href: string;
  label: string;
}

export default function GlobalNavHeader() {
  const { isDark, toggleDark } = useHealth();
  const { locale, setLocale, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  /** Close the mobile sheet on navigation (setState-during-render pattern
   *  from AppHeader — no effect, no flicker). */
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const crumbs = useMemo<Crumb[]>(() => {
    const segments = pathname.split("/").filter(Boolean);
    const chain: Crumb[] = [];
    for (let i = 0; i < segments.length; i += 1) {
      const href = `/${segments.slice(0, i + 1).join("/")}`;
      const key = crumbKeyFor(href);
      // Skip collapsed dynamic params (e.g. /pro/consultations/[id] →
      // its parent): the parent crumb was already added and becomes the
      // current, unlinked leaf. Pushing the collapsed href here would
      // duplicate the parent label with a wrong (param) URL.
      if (!key || key !== href) continue;
      chain.push({ href, label: t(PAGE_TITLES[key]) });
    }
    return chain;
  }, [pathname, t]);

  /** Sensible parent for history-less fallbacks (new tab / direct entry). */
  const fallbackHref = useMemo(() => {
    const leaf = crumbKeyFor(pathname) ?? pathname;
    if (leaf === "/dashboard") return "/dashboard";
    if (leaf.startsWith("/resources/") && leaf !== "/resources") return "/resources";
    if (leaf.startsWith("/pro/")) return "/pro";
    return "/dashboard";
  }, [pathname]);

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  const canGoBackInApp = typeof window !== "undefined" && window.history.length > 1;
  const isDashboardRoot = pathname === "/dashboard";
  /** Section roots get the desktop quick links; deep pages get breadcrumbs. */
  const isTopLevel = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.length <= 1;
  }, [pathname]);

  return (
    <header
      data-testid="global-nav-header"
      className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-emerald-500/10 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
    >
      {/* 3D glass stack: top specular highlight over a translucent slab */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20"
      />
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl">
        <div className="pt-[env(safe-area-inset-top)]">
          <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 max-w-6xl">
            {/* Brand */}
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
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

            {/* Desktop quick links on section roots (deep pages show the
                breadcrumb trail instead — both never render at once). */}
            {isTopLevel && (
              <nav
                aria-label={t("nav.primaryNav")}
                className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                {QUICK_LINKS.map((link) => (
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
                    {t(link.labelKey)}
                  </Link>
                ))}
              </nav>
            )}

            {/* Breadcrumbs (md+): Home › … › current */}
            {!isTopLevel && (
            <nav
              aria-label={t("nav.breadcrumb")}
              className="hidden min-w-0 md:flex items-center gap-1 text-sm"
            >
              {!isDashboardRoot && (
                <>
                  <Link
                    href="/dashboard"
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 font-medium text-slate-600 transition-colors hover:text-slate-900 hover:bg-muted dark:text-muted-foreground dark:hover:text-foreground"
                  >
                    <HugeiconsIcon icon={ArrowUp01Icon} className="h-3.5 w-3.5 rtl:rotate-90" aria-hidden="true" />
                    {t("nav.dashboard")}
                  </Link>
                  <span aria-hidden="true" className="text-slate-400 dark:text-slate-600">
                    {locale === "ar" ? "‹" : "/"}
                  </span>
                </>
              )}
              {crumbs.slice(0, -1).map((crumb) => (
                <span key={crumb.href} className="flex min-w-0 items-center gap-1">
                  <Link
                    href={crumb.href}
                    className="truncate rounded-lg px-2 py-1.5 font-medium text-slate-600 transition-colors hover:text-slate-900 hover:bg-muted dark:text-muted-foreground dark:hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                  <span aria-hidden="true" className="shrink-0 text-slate-400 dark:text-slate-600">
                    {locale === "ar" ? "‹" : "/"}
                  </span>
                </span>
              ))}
              {crumbs.length > 0 && (
                <span
                  aria-current="page"
                  className="truncate rounded-lg bg-primary/10 px-2 py-1.5 font-semibold text-primary"
                >
                  {crumbs[crumbs.length - 1].label}
                </span>
              )}
            </nav>
            )}

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {/* Smart Go Back — history-aware with a parent fallback */}
              {!isDashboardRoot && (
                canGoBackInApp ? (
                  <Button
                    onClick={goBack}
                    variant="ghost"
                    size="sm"
                    aria-label={t("nav.goBack")}
                    className="gap-1.5 rounded-full bg-muted px-2.5 text-sm font-medium text-slate-600 hover:bg-muted/80 hover:text-slate-900 dark:text-muted-foreground dark:hover:text-foreground"
                  >
                    <HugeiconsIcon
                      icon={ArrowLeft01Icon}
                      className="h-4 w-4 rtl:scale-x-[-1]"
                      aria-hidden="true"
                    />
                    <span className="hidden sm:inline">{t("nav.goBack")}</span>
                  </Button>
                ) : (
                  <Link
                    href={fallbackHref}
                    aria-label={t("nav.goBack")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-muted/80 hover:text-slate-900 dark:text-muted-foreground dark:hover:text-foreground"
                  >
                    <HugeiconsIcon
                      icon={locale === "ar" ? ArrowRight01Icon : ArrowLeft01Icon}
                      className="hidden h-4 w-4 rtl:block"
                      aria-hidden="true"
                    />
                    <HugeiconsIcon
                      icon={locale === "ar" ? ArrowLeft01Icon : ArrowRight01Icon}
                      className="h-4 w-4 rtl:hidden"
                      aria-hidden="true"
                    />
                    <span className="hidden sm:inline">{t("nav.goBack")}</span>
                  </Link>
                )
              )}

              <Button
                onClick={() => setLocale(locale === "en" ? "ar" : "en")}
                variant="ghost"
                size="sm"
                aria-label={locale === "en" ? t("nav.switchToArabic") : t("nav.switchToEnglish")}
                className="gap-1.5 rounded-full bg-muted text-xs font-medium hover:bg-muted/80"
              >
                <HugeiconsIcon icon={LanguageCircleIcon} className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{locale === "en" ? "عربي" : "EN"}</span>
              </Button>

              <Button
                onClick={toggleDark}
                variant="ghost"
                size="icon"
                aria-label={isDark ? t("header.themeLight") : t("header.themeDark")}
                className="rounded-full bg-muted hover:bg-muted/80"
              >
                {isDark ? (
                  <HugeiconsIcon icon={Sun02Icon} className="h-5 w-5 text-amber-400" aria-hidden="true" />
                ) : (
                  <HugeiconsIcon icon={Moon02Icon} className="h-5 w-5 text-slate-600" aria-hidden="true" />
                )}
              </Button>

              <NotificationBell />

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-muted hover:bg-muted/80 md:hidden"
                aria-label={t("nav.mainMenu")}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
              >
                <HugeiconsIcon
                  icon={mobileOpen ? Cancel01Icon : Menu01Icon}
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile quick links */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out md:hidden",
          mobileOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <nav
            aria-label={t("nav.mainMenu")}
            className="flex flex-col gap-1 bg-white/95 px-6 pb-3 pt-2 backdrop-blur-xl dark:bg-background/95 sm:px-8"
          >
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                aria-current={pathname === link.href ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                  pathname === link.href && "bg-primary/10 font-semibold text-primary"
                )}
              >
                {t(link.labelKey)}
              </Link>
            ))}
            <Link
              href="/pro"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-600/10 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
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
