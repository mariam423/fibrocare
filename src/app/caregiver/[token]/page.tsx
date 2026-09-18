import { getCaregiverForecast } from "@/app/actions";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { LeafIcon, AlarmClockIcon, Moon02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { LOCALE_COOKIE, parseLocale } from "@/lib/locale";
import { translations, type Locale, type TranslationKey } from "@/lib/translations";

export const dynamic = "force-dynamic";

/**
 * Share links carry personal health context — they must never be indexed,
 * archived, or turned into rich previews. `noindex` keeps them out of
 * search results; `nofollow` stops crawlers from following the link any
 * further; `noarchive` asks search engines not to store a copy.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  other: {
    "googlebot": "noindex, nofollow, noarchive",
  },
};

const LEVEL_STYLE: Record<
  "high" | "moderate" | "low",
  { ring: string; badge: string; labelKey: TranslationKey }
> = {
  high: {
    ring: "border-amber-400/50 bg-amber-50/60 dark:bg-amber-950/20",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30",
    labelKey: "caregiver.level.high",
  },
  moderate: {
    ring: "border-teal-300/60 bg-teal-50/40 dark:bg-teal-950/15",
    badge: "bg-teal-500/15 text-teal-700 dark:text-teal-300 ring-1 ring-teal-500/30",
    labelKey: "caregiver.level.moderate",
  },
  low: {
    ring: "border-emerald-300/50 bg-emerald-50/40 dark:bg-emerald-950/15",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30",
    labelKey: "caregiver.level.low",
  },
};

/**
 * Read-only caregiver / partner share page (Point 15). Rendered without an
 * app shell — whoever holds the token sees a minimal forecast card only.
 * Data is scoped server-side to the token holder; no auth session required.
 * Labeled strings come from the UI locale cookie (defaults to English),
 * matching how the root layout resolves lang/dir on the server.
 */
export default async function CaregiverPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const locale: Locale = parseLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const C = translations[locale];
  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    let text: string = C[key] ?? translations.en[key] ?? key;
    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.replace(`{${name}}`, value);
      }
    }
    return text;
  };

  const result = await getCaregiverForecast(token);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-10">
      {!result.success || !result.forecast ? (
        <Card className="w-full max-w-sm border-border/60 bg-muted/30">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <HugeiconsIcon icon={Moon02Icon} className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground/80">
              {result.error ?? t("caregiver.linkInactive")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={cn(
            "w-full max-w-sm overflow-hidden backdrop-blur-md",
            LEVEL_STYLE[result.forecast.level].ring
          )}
        >
          <CardHeader className="pb-2">
            <span className="inline-flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <HugeiconsIcon icon={LeafIcon} className="h-3.5 w-3.5" aria-hidden="true" />
              FibroCare · {t("caregiver.badge")}
            </span>
            <CardTitle className="text-lg font-semibold">{t("caregiver.title", { name: result.forecast.patientName })}</CardTitle>
            <CardDescription className="text-sm">{t("caregiver.readOnly")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold",
                LEVEL_STYLE[result.forecast.level].badge
              )}
            >
              {t(LEVEL_STYLE[result.forecast.level].labelKey)}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("caregiver.daysToPeriod")}
                </p>
                <p className="mt-0.5 flex items-center gap-1 font-semibold tabular-nums">
                  <HugeiconsIcon icon={AlarmClockIcon} className="h-4 w-4" aria-hidden="true" />
                  {result.forecast.daysUntilPeriod}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("caregiver.cyclePhase")}</p>
                <p className="mt-0.5 font-semibold capitalize">
                  {t(LEVEL_TEXT[result.forecast.phase?.toUpperCase() as keyof typeof LEVEL_TEXT] ?? ("caregiver.unknown"))}
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              {t("caregiver.insight")}
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

const LEVEL_TEXT: Record<string, TranslationKey> = {
  MENSTRUAL: "health.phase.menstrual",
  FOLLICULAR: "health.phase.follicular",
  OVULATORY: "health.phase.ovulatory",
  LUTEAL: "health.phase.luteal",
  UNKNOWN: "caregiver.unknown",
};