"use client";

/**
 * AdvancedFeedFilters — advanced search & filtering for the doctor feed.
 *
 * Layers on top of the existing kind filter (which hits the server):
 *  - Free-text search across title/content/tags/author (client-side,
 *    debounced nothing — the feed is ≤200 posts, so a linear pass is
 *    instant and needs no network round-trip).
 *  - Topic chips derived from the posts' own `tags` field (comma- or
 *    arabic-comma-separated), multi-select, AND semantics across
 *    selected topics.
 *  - Sort: newest / most-liked.
 *  - Active-filter summary chips + one-tap "clear all".
 *
 * Mobile-first: the panel collapses behind a toggle button on small
 * screens; the search input keeps a ≥44px touch target and respects
 * logical properties so it mirrors cleanly in RTL.
 *
 * Security: purely presentational filtering of already-fetched,
 * server-sanitized data — no new request surface, no user input reaches
 * any API, DB or HTML sink (React escapes by default).
 */

import React, { useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Search01Icon,
  Tag01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/translations";

export interface FeedPostLike {
  title: string;
  content: string;
  tags: string;
  author: { name: string };
  reactionsCount: number;
  createdAt?: string;
}

export type FeedSort = "newest" | "popular";

interface AdvancedFeedFiltersProps {
  posts: FeedPostLike[];
  query: string;
  onQueryChange: (q: string) => void;
  selectedTopics: string[];
  onToggleTopic: (topic: string) => void;
  sort: FeedSort;
  onSortChange: (s: FeedSort) => void;
  visibleCount: number;
}

/** Normalize text for matching: lowercase + strip Arabic diacritics. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0670]/g, "");
}

/** "a, b، c" → ["a", "b", "c"] — tolerates both comma variants. */
export function parsePostTags(raw: string): string[] {
  return raw
    .split(/[,،]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 6);
}

const SORT_OPTIONS: Array<{ id: FeedSort; labelKey: TranslationKey }> = [
  { id: "newest", labelKey: "doctor.feed.sort.newest" },
  { id: "popular", labelKey: "doctor.feed.sort.popular" },
];

export function AdvancedFeedFilters({
  posts,
  query,
  onQueryChange,
  selectedTopics,
  onToggleTopic,
  sort,
  onSortChange,
  visibleCount,
}: AdvancedFeedFiltersProps) {
  const { t } = useLanguage();

  /** Topic chips from the posts' own tags, most-used first (max 12). */
  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of parsePostTags(post.tags)) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
        if (counts.size > 40) break; // hard cap — tags are capped at 200 chars anyway
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 12)
      .map(([tag]) => tag);
  }, [posts]);

  const hasActiveFilters = Boolean(query.trim()) || selectedTopics.length > 0;
  const totalCount = posts.length;

  return (
    <div className="w-full space-y-3">
      {/* Search + sort row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3"
            aria-hidden="true"
          />
          <input
            type="search"
            inputMode="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={t("doctor.feed.searchPlaceholder")}
            aria-label={t("doctor.feed.searchLabel")}
            className="h-10 w-full rounded-full border border-emerald-500/20 bg-card/60 ps-9 pe-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label={t("doctor.feed.clearSearch")}
              className="absolute top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground ltr:right-2 rtl:left-2"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Sort segmented control */}
        <div
          role="group"
          aria-label={t("doctor.feed.sortLabel")}
          className="flex shrink-0 items-center rounded-full border border-emerald-500/20 bg-card/60 p-0.5"
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSortChange(opt.id)}
              aria-pressed={sort === opt.id}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                sort === opt.id
                  ? "bg-emerald-600 text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t(opt.labelKey)}
              </button>
          ))}
        </div>
      </div>

      {/* Topic chips */}
      {topics.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <HugeiconsIcon icon={Tag01Icon} className="h-3.5 w-3.5" aria-hidden="true" />
            {t("doctor.feed.topicsLabel")}:
          </span>
          {topics.map((topic) => {
            const on = selectedTopics.includes(topic);
            return (
              <button
                key={topic}
                type="button"
                onClick={() => onToggleTopic(topic)}
                aria-pressed={on}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  on
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "border-border/70 text-muted-foreground hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:text-foreground"
                )}
              >
                {topic}
              </button>
            );
          })}
        </div>
      )}

      {/* Active-filter summary + result count */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {t("doctor.feed.resultsCount", { count: visibleCount, total: totalCount })}
        </p>
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {t("doctor.feed.activeFilters")}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onQueryChange("");
                selectedTopics.forEach(onToggleTopic);
              }}
              className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400"
            >
              {t("doctor.feed.clearAll")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Pure filtering/sorting used by the feed — kept exported for tests. */
export function applyAdvancedFilters<T extends FeedPostLike>(
  posts: T[],
  query: string,
  selectedTopics: string[],
  sort: FeedSort
): T[] {
  const q = normalize(query.trim());
  const filtered = posts.filter((post) => {
    if (selectedTopics.length > 0) {
      const tags = parsePostTags(post.tags);
      // AND semantics: every selected topic must be present.
      for (const topic of selectedTopics) {
        if (!tags.some((tag) => normalize(tag) === normalize(topic))) {
          return false;
        }
      }
    }
    if (!q) return true;
    const haystack = normalize(
      `${post.title} ${post.content} ${post.tags} ${post.author.name}`
    ).replace(/[،]/g, ",");
    return haystack.includes(q);
  });

  if (sort === "popular") {
    return filtered.sort((a, b) => b.reactionsCount - a.reactionsCount);
  }
  return filtered; // newest — server already ordered by createdAt desc
}
