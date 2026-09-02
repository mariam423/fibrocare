"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useHealth } from "@/context/HealthContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useWeather } from "@/hooks/useWeather";
import { buildResourceFeed, type ResourceFeedCategory } from "@/lib/resources/feed";
import type { LocalizedResource } from "./ResourceCard";

interface FeedResponseItem {
  resourceId: string;
  category: string;
  effort: "low" | "medium";
  reason: string;
}

interface PersonalizedResourceFeedProps {
  category: ResourceFeedCategory;
  resources: LocalizedResource[];
}

export function PersonalizedResourceFeed({
  category,
  resources,
}: PersonalizedResourceFeedProps) {
  const { t, locale } = useLanguage();
  const { currentPainLevel } = useHealth();
  const weather = useWeather();
  const [spoons] = useLocalStorage<number>("fibrocare:spoons", 6);
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [items, setItems] = useState<FeedResponseItem[]>([]);
  const [source, setSource] = useState<"ai" | "fallback">("fallback");
  const [loading, setLoading] = useState(true);

  const fallbackItems = useMemo(
    () =>
      buildResourceFeed({
        painLevel: currentPainLevel,
        energyRemaining: spoons,
        weatherTriggers: weather.triggers,
        category,
        refreshSeed,
      }),
    [category, currentPainLevel, refreshSeed, spoons, weather.triggers]
  );

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          painLevel: currentPainLevel,
          energyRemaining: spoons,
          category,
          refreshSeed,
          weather: weather.weather,
          locale,
        }),
      });
      if (!response.ok) throw new Error("Resource feed request failed");
      const data = (await response.json()) as {
        feed?: FeedResponseItem[];
        source?: "ai" | "fallback";
      };
      if (!Array.isArray(data.feed) || data.feed.length === 0) throw new Error("Empty feed");
      setItems(data.feed);
      setSource(data.source === "ai" ? "ai" : "fallback");
    } catch {
      setItems(fallbackItems);
      setSource("fallback");
    } finally {
      setLoading(false);
    }
  }, [category, currentPainLevel, fallbackItems, locale, refreshSeed, spoons, weather.weather]);

  useEffect(() => {
    // The fetch synchronizes this panel with the authenticated API and may
    // update loading/results state after the response resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadFeed();
  }, [loadFeed]);

  const resourcesById = useMemo(
    () => new Map(resources.map((resource) => [resource.id, resource])),
    [resources]
  );
  const visibleItems = (loading && items.length === 0 ? fallbackItems : items).flatMap((item) => {
    const resource = resourcesById.get(item.resourceId);
    return resource ? [{ ...item, resource }] : [];
  });

  return (
    <section
      aria-labelledby="personalized-feed-title"
      className="w-full rounded-2xl border border-emerald-500/20 bg-white/70 shadow-lg shadow-emerald-950/20 backdrop-blur-xl dark:bg-slate-900/60"
    >
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 id="personalized-feed-title" className="flex items-center gap-2 text-base font-semibold text-foreground">
            <HugeiconsIcon icon={SparklesIcon} className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            {t("resources.feed.title")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("resources.feed.subtitle")}</p>
        </div>
        <Button
          type="button"
          onClick={() => setRefreshSeed((seed) => seed + 1)}
          disabled={loading}
          variant="outline"
          className="shrink-0 rounded-xl border-emerald-500/20 bg-white/70 dark:bg-slate-900/60"
          aria-label={t("resources.feed.refresh")}
        >
          <HugeiconsIcon icon={RefreshIcon} className={loading ? "me-2 h-4 w-4 animate-spin" : "me-2 h-4 w-4"} aria-hidden="true" />
          {loading ? t("resources.feed.refreshing") : t("resources.feed.refresh")}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2 px-5 pb-5 sm:grid-cols-3" aria-live="polite">
        {visibleItems.map(({ resource, reason }) => (
          <article key={resource.id} className="min-w-0 rounded-xl border border-border/60 bg-muted/30 p-3">
            <div className="flex items-start gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {resource.icon}
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-foreground">{resource.title}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{reason}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="px-5 pb-4 text-[11px] text-muted-foreground">
        {source === "ai" ? t("resources.feed.live") : t("resources.feed.offline")}
      </p>
    </section>
  );
}
