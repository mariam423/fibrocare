"use client";

/**
 * Anonymized Community Insights: regional weather ↔ flare sensitivity trend
 * (modeled aggregate, region-level only) + community-voted coping
 * leaderboard. No personal data — deterministic engine output.
 */

import React, { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Globe02Icon, Award02Icon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { useLanguage } from "@/context/LanguageContext";
import { getRegionalTrend, getCopingLeaderboard } from "@/lib/community/engine";

const REGIONS = ["London", "Cairo", "Riyadh", "New York", "Berlin"] as const;

const BAROMETRIC_KEYS = {
  falling: "communityInsights.barometric.falling",
  steady: "communityInsights.barometric.steady",
  rising: "communityInsights.barometric.rising",
} as const;

export function CommunityInsightsCard() {
  const { t } = useLanguage();
  const [region, setRegion] = useState<string>("London");

  const trend = useMemo(() => getRegionalTrend(region), [region]);
  const leaderboard = useMemo(() => getCopingLeaderboard(), []);

  return (
    <DepthCard tilt={3}>
      <Card className="h-full shadow-depth-sm backdrop-blur-xl border border-emerald-500/20 bg-white/70 dark:bg-slate-900/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Globe02Icon} className="h-5 w-5 text-primary" aria-hidden="true" />
            {t("communityInsights.title")}
          </CardTitle>
          <CardDescription>{t("communityInsights.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            aria-label={t("communityInsights.region")}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Regional trend */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
            <p className="text-sm">
              {t("communityInsights.trendLead", {
                pct: trend.flareSensitivityPct,
                region,
              })}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("communityInsights.dominantTrigger")}: {t(trend.dominantTrigger)} ·{" "}
              {t(BAROMETRIC_KEYS[trend.barometricTrend])} ·{" "}
              {t("communityInsights.reportingUsers", { count: trend.reportingUsers })}
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background" role="img" aria-label={`${trend.flareSensitivityPct}%`}>
              <div
                className="h-full rounded-full bg-primary/70 transition-all duration-700"
                style={{ width: `${trend.flareSensitivityPct}%` }}
              />
            </div>
          </div>

          {/* Coping leaderboard */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <HugeiconsIcon icon={Award02Icon} className="h-4 w-4 text-primary" aria-hidden="true" />
              {t("communityInsights.leaderboard")}
            </p>
            <ol className="space-y-1.5">
              {leaderboard.slice(0, 5).map((s) => (
                <li
                  key={s.strategyKey}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-sm"
                >
                  <span>
                    <span className="me-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      {s.rank}
                    </span>
                    {t(s.strategyKey)}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {/* <bdi> isolates numbers + percentages so punctuation never
                        flips/reverses when the page direction is RTL (Arabic). */}
                    <bdi>{s.successPct}%</bdi> · <bdi>{t("communityInsights.votes", { count: s.votes })}</bdi>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <p className="text-xs text-muted-foreground">{t("communityInsights.disclaimer")}</p>
        </CardContent>
      </Card>
    </DepthCard>
  );
}
