"use client";

/**
 * GlobalNavHeader — the universal sticky navigation for every inner view.
 *
 * One header serves the whole authenticated app (dashboard, resources and
 * its sub-pages, pro portal and its sub-routes, profile, logs, toolkit,
 * reports) so a user is never trapped without a return path:
 *
 *  - Brand — logo + wordmark (wordmark collapses to the mark on very
 *    narrow screens so it never collides with the action cluster).
 *  - Core links — the essential sections (Dashboard, Clinical Hub, Diet &
 *    Triggers, Profile) render inline on lg+ when the route is a section
 *    root; the current page is marked with aria-current. The same links
 *    live in the responsive menu for smaller screens.
 *  - Breadcrumbs — on sub-pages the inline links step aside and a
 *    "Home › … › current page" trail takes the same slot, reflecting the
 *    real route hierarchy (dynamic parameters render as their parent
 *    section). The trail truncates its middle links so it never overlaps
 *    the brand or the action cluster.
 *  - Actions — smart "Go back" (router.back() when there is in-app
 *    history, otherwise a sensible parent), language toggle (with an
 *    accessible name), theme toggle, the notification bell, and the
 *    hamburger menu (below lg) that hosts the core links plus the
 *    Upgrade-Pro call to action.
 *
 * Direction: the header pins its own dir (ltr/rtl) straight from the
 * language context, so the brand always sits at the inline start and the
 * actions at the inline end — left/right in English, mirrored in Arabic —
 * regardless of where the header is mounted. Everything inside uses
 * logical properties and rtl: variants: the back arrow mirrors via
 * rtl:scale-x-[-1]; breadcrumb separators use logical spacing.
 *
 * Design: the Midnight Emerald glass treatment (blur, hairline border,
 * soft shadow) with a 3D glass stack — a translucent top highlight over a
 * gradient surface and a hairline bottom edge so the bar reads as a raised
 * glass slab.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Cancel01Icon,
  FlashIcon,
  HeartIcon,
  LanguageCircleIcon,
  Menu01Icon,
  Moon02Icon,
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
  "/clinical": "nav.clinical",
  "/fog-shield": "fog.title",
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
  "/diet": "nav.diet",
};

/** Collapse dynamic parameters to their parent section. */
function crumbKeyFor(pathname: string): string | null {
  if (PAGE_TITLES[pathname]) return pathname;
  if (pathname.startsWith("/pro/consultations/")) return "/pro/consultations";
  return null;
}

/** The essential sections every header menu exposes — kept short so the
 *  desktop strip and the responsive sheet stay clean and uncluttered. */
const CORE_LINKS: Array<{ href: string; labelKey: TranslationKey }> = [
  { href: "/dashboard", labelKey: "nav.dashboard" },
  { href: "/clinical", labelKey: "nav.clinical" },
  { href: "/diet", labelKey: "nav.diet" },
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
  const { locale, setLocale, t, dir } = useLanguage();
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

  /** Home › … › current trail. /dashboard/* routes already begin with a
   *  dashboard crumb, so the redundant entry is dropped — the home
   *  shortcut renders once. */
  const trail = useMemo<Crumb[]>(() => {
    const home: Crumb = { href: "/dashboard", label: t("nav.dashboard") };
    return [home, ...crumbs.filter((crumb) => crumb.href !== "/dashboard")];
  }, [crumbs, t]);

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
  /** Section roots get the desktop core links; sub-pages get the
   *  breadcrumb trail instead — the two never render at once. */
  const isTopLevel = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.length <= 1;
  }, [pathname]);

  return (
    <header
      data-testid="global-nav-header"
      dir={dir}
      className="sticky top-0 z-50 relative w-full bg-white/85 backdrop-blur-xl border-b border-slate-200/60 dark:bg-slate-900/85 dark:border-emerald-500/10"
    >
      {/* 3D glass stack: top specular highlight over a translucent slab */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20"
      />
      <div>
        <div className="pt-[env(safe-area-inset-top)]">
          <div className="container mx-auto flex h-14 items-center justify-between gap-x-3 px-3 sm:px-6 lg:px-8 max-w-7xl">
            {/* Brand — sits at the inline start (left in LTR, right in RTL). */}
            <div className="flex shrink-0 items-center gap-2.5">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                aria-label={t("nav.dashboard")}
                className="flex items-center gap-2.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                  <HugeiconsIcon
                    icon={HeartIcon}
                    className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                </div>
                <span className="hidden text-xl font-semibold tracking-tight whitespace-nowrap text-slate-900 dark:text-foreground min-[420px]:inline">
                  FibroCare
                </span>
              </Link>
            </div>

            {/* Center slot — desktop core links on section roots, the
                breadcrumb trail on sub-pages. flex-1 min-w-0 keeps the
                slot from ever colliding with brand or actions. */}
            <div className="flex min-w-0 flex-1 items-center justify-center">
              {isTopLevel ? (
                <nav
                  aria-label={t("nav.primaryNav")}
                  className="hidden min-w-0 items-center gap-1 text-sm font-medium lg:flex"
                >
                  {CORE_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "inline-flex items-center whitespace-nowrap rounded-lg px-2.5 py-2 transition-colors hover:bg-muted hover:text-slate-900 dark:hover:text-foreground",
                        pathname === link.href &&
                          "bg-primary/10 text-primary font-semibold"
                      )}
                      aria-current={pathname === link.href ? "page" : undefined}
                    >
                      {t(link.labelKey)}
                    </Link>
                  ))}
                </nav>
              ) : (
                <nav
                  aria-label={t("nav.breadcrumb")}
                  className="hidden min-w-0 items-center whitespace-nowrap text-sm sm:flex"
                >
                  {trail.map((crumb, index) => {
                    const isLast = index === trail.length - 1;
                    return (
                      <span key={crumb.href} className="flex min-w-0 items-center">
                        {index > 0 && (
                          <span
                            aria-hidden="true"
                            className="shrink-0 px-1.5 text-slate-400 dark:text-slate-600"
                          >
                            {locale === "ar" ? "‹" : "/"}
                          </span>
                        )}
                        {isLast ? (
                          <span
                            aria-current="page"
                            className="truncate shrink-0 rounded-lg bg-primary/10 px-2 py-1.5 font-semibold text-primary max-w-[14rem]"
                          >
                            {crumb.label}
                          </span>
                        ) : (
                          <Link
                            href={crumb.href}
                            className="truncate min-w-0 rounded-lg px-2 py-1.5 font-medium text-slate-600 transition-colors hover:bg-muted hover:text-slate-900 dark:text-muted-foreground dark:hover:text-foreground"
                          >
                            {crumb.label}
                          </Link>
                        )}
                      </span>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Actions — sit at the inline end (right in LTR, left in RTL). */}
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
                      icon={ArrowLeft01Icon}
                      className="h-4 w-4 rtl:scale-x-[-1]"
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
                className="rounded-full bg-muted hover:bg-muted/80 lg:hidden"
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

      {/* Responsive menu (below lg) — the same essential links as the
          desktop strip, plus the Upgrade-Pro call to action. */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out lg:hidden",
          mobileOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <nav
            aria-label={t("nav.mainMenu")}
            className="flex flex-col gap-1 bg-white/95 px-3 pb-3 pt-2 backdrop-blur-xl dark:bg-background/95 sm:px-6"
          >
            {CORE_LINKS.map((link) => (
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