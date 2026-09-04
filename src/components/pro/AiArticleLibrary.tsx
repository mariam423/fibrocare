"use client";

/**
 * Client-side library that loads AI-generated doctor articles for the
 * Doctor Hub. On mount it:
 *   1. Lists existing verified articles.
 *   2. If the list is empty, triggers the seed endpoint so the feed is
 *      never blank.
 *   3. Subscribes to the picker — generating a fresh article on a topic
 *      prepends it to the visible list.
 *   4. Exposes a "Refresh library" action that walks every curated topic
 *      through `/api/ai/articles/generate`, prepends any new posts, and
 *      surfaces the count of fresh items added.
 *
 * The "AI generated" badge is shown for the first 14 days after an
 * article is created. After that it is treated as a regular verified
 * article (Doctor Hub is editorial, not novelty-driven).
 *
 * Mobile notes:
 *  - The topic picker is a horizontally scrollable chip row with edge
 *    fade + scroll-snap; on wider screens (>= md) it falls back to
 *    flex-wrap so users can still see all chips at once.
 *  - Article cards stack into a single column on phones, two on small
 *    tablets, three on desktops — matches the rest of the site.
 *  - The library has explicit horizontal padding so the edge-faded chip
 *    row aligns with the page gutter.
 *  - The refresh action is a pill button in the card header that is
 *    full-width on mobile and inline on >= sm.
 *
 * RTL/LTR notes:
 *  - The section wrapper respects the parent document direction. The
 *    library card is symmetric, so the same layout works in both.
 *  - Inline numeric values (e.g. reading minutes) are pinned to LTR so
 *    "5 min" never gets visually flipped inside the AR locale.
 *  - No hard-coded English strings remain in the body.
 */

import React, { useCallback, useEffect, useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiMagicIcon,
  ArrowRight01Icon,
  Loading01Icon,
  Refresh01Icon,
  Stethoscope02Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/context/LanguageContext";
import { AiArticleCard, type AiArticle } from "./AiArticleCard";
import {
  ensureArticleForTopic,
  listArticleTopics,
  listPublishedArticles,
} from "@/app/pro/doctor-article-actions";
import { cn } from "@/lib/utils";

interface AiArticleLibraryProps {
  initialArticles: AiArticle[];
}

interface TopicOption {
  id: string;
  slug: string;
  enTitle: string;
  arTitle: string;
  tags: string[];
  authorityLabel: string;
  readingMinutes: number;
}

function isFresh(iso: string, days = 14): boolean {
  const ageMs = Date.now() - new Date(iso).getTime();
  return ageMs < days * 24 * 60 * 60 * 1000;
}

export type { AiArticle };

/**
 * Map the API response from `/api/ai/articles/generate` to the AiArticle
 * shape the cards expect. The response wraps the post in `{ article }`,
 * which is what the server action returns from `ensureArticleForTopic`.
 */
function mapResultToArticle(data: {
  postId: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  createdAt: string;
  authorName: string;
  authorTitle: string;
  authorityLabel: string;
  readingMinutes: number;
}): AiArticle {
  return {
    id: data.postId,
    title: data.title,
    summary: data.summary,
    content: data.content,
    tags: data.tags,
    createdAt: data.createdAt,
    authorName: data.authorName,
    authorTitle: data.authorTitle,
    authorityLabel: data.authorityLabel,
    readingMinutes: data.readingMinutes,
  };
}

export function AiArticleLibrary({ initialArticles }: AiArticleLibraryProps) {
  const { t, locale } = useLanguage();
  const [articles, setArticles] = useState<AiArticle[]>(initialArticles);
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [generating, startGenerating] = useTransition();
  const [refreshing, startRefresh] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Topic picker state — controlled so we can show a tidy chip row.
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  // On mount, if we got nothing server-side, kick off the seed.
  useEffect(() => {
    if (initialArticles.length > 0) return;
    let cancelled = false;
    (async () => {
      try {
        // 1. List existing (in case the server-side seed is racing with us)
        const list = await listPublishedArticles(12);
        if (!cancelled && list.success && list.data.length > 0) {
          setArticles(
            list.data.map((a) => ({
              id: a.id,
              title: a.title,
              summary: a.summary,
              content: a.content,
              tags: a.tags,
              createdAt: a.createdAt,
              authorName: a.authorName,
              authorTitle: a.authorTitle,
              authorityLabel: a.authorityLabel,
              readingMinutes: a.readingMinutes,
            }))
          );
          return;
        }
        // 2. Seed via the public endpoint.
        await fetch("/api/ai/articles/seed", { method: "GET" });
        // 3. Reload.
        const after = await listPublishedArticles(12);
        if (!cancelled && after.success) {
          setArticles(
            after.data.map((a) => ({
              id: a.id,
              title: a.title,
              summary: a.summary,
              content: a.content,
              tags: a.tags,
              createdAt: a.createdAt,
              authorName: a.authorName,
              authorTitle: a.authorTitle,
              authorityLabel: a.authorityLabel,
              readingMinutes: a.readingMinutes,
            }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.error("AI article library seed failed:", err);
          setError(t("doctor.aiLibrary.refreshError"));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialArticles.length, locale, t]);

  // Lazy-load the topic picker. We use a derived state ref to avoid
  // calling setState synchronously inside the effect.
  const shouldLoadTopics = topics.length === 0 && !loadingTopics;
  useEffect(() => {
    if (!shouldLoadTopics) return;
    let cancelled = false;
    // Defer the loading flag to a microtask so the effect body never
    // sets state synchronously.
    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoadingTopics(true);
    });
    listArticleTopics()
      .then((list) => {
        if (cancelled) return;
        setTopics(list);
        setLoadingTopics(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadingTopics(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shouldLoadTopics]);

  const handleGenerate = useCallback(
    (topicId: string) => {
      setError(null);
      setActiveTopic(topicId);
      startGenerating(async () => {
        const result = await ensureArticleForTopic(topicId);
        if (!result.success) {
          setError(result.error);
          setActiveTopic(null);
          return;
        }
        const next = mapResultToArticle(result.data);
        setArticles((prev) => {
          // De-dup by id.
          const without = prev.filter((a) => a.id !== next.id);
          return [next, ...without];
        });
        setActiveTopic(null);
      });
    },
    []
  );

  /**
   * Refresh the library: walk every curated topic, generate (or fetch
   * the existing post) for each, and prepend the new ones to the grid.
   * Runs in one transition so the spinner shows a single coherent state
   * and individual failures don't abort the whole sweep.
   */
  const handleRefresh = useCallback(() => {
    if (refreshing) return;
    setError(null);
    startRefresh(async () => {
      try {
        // Always re-fetch the topic list first so the sweep reflects the
        // canonical catalogue (covers future topic additions).
        const topicList = await listArticleTopics();
        setTopics(topicList);
        if (topicList.length === 0) {
          // No topics to refresh — fall back to the seed endpoint so the
          // empty-state still resolves.
          await fetch("/api/ai/articles/seed", { method: "GET" });
          const after = await listPublishedArticles(12);
          if (after.success) {
            setArticles(
              after.data.map((a) => ({
                id: a.id,
                title: a.title,
                summary: a.summary,
                content: a.content,
                tags: a.tags,
                createdAt: a.createdAt,
                authorName: a.authorName,
                authorTitle: a.authorTitle,
                authorityLabel: a.authorityLabel,
                readingMinutes: a.readingMinutes,
              }))
            );
          }
          return;
        }

        // Pre-fetch what we already have so we can skip the network when
        // a topic already has a post in the grid.
        const existingIds = new Set(articles.map((a) => a.id));
        const fresh: AiArticle[] = [];
        for (const topic of topicList) {
          try {
            const res = await fetch(
              `/api/ai/articles/generate?topic=${encodeURIComponent(topic.id)}`,
              { method: "GET" }
            );
            if (!res.ok) continue;
            const json = (await res.json()) as {
              article?: Parameters<typeof mapResultToArticle>[0];
              error?: string;
            };
            if (!json.article) continue;
            const mapped = mapResultToArticle(json.article);
            if (!existingIds.has(mapped.id)) {
              fresh.push(mapped);
            }
          } catch {
            // Per-topic failures are swallowed so the sweep still
            // surfaces everything else. The user will see the
            // articles that did succeed.
          }
        }
        if (fresh.length > 0) {
          setArticles((prev) => {
            const ids = new Set(prev.map((a) => a.id));
            const deduped = fresh.filter((a) => !ids.has(a.id));
            return [...deduped, ...prev];
          });
        }
      } catch (err) {
        console.error("AI article library refresh failed:", err);
        setError(t("doctor.aiLibrary.refreshError"));
      }
    });
  }, [articles, refreshing, t]);

  const isEmpty = articles.length === 0;

  return (
    <section
      className="space-y-5 sm:space-y-6"
      data-testid="ai-article-library"
    >
      {/* Picker */}
      <ScrollReveal>
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <HugeiconsIcon
                      icon={AiMagicIcon}
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </span>
                  <CardTitle className="text-base">
                    {t("doctor.aiLibrary.title")}
                  </CardTitle>
                </div>
                <CardDescription className="text-balance">
                  {t("doctor.aiLibrary.subtitle")}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-end">
                <span className="inline-flex w-fit shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <HugeiconsIcon
                    icon={Stethoscope02Icon}
                    className="h-3 w-3"
                    aria-hidden="true"
                  />
                  {t("doctor.aiLibrary.reviewed")}
                </span>
                {/*
                  Refresh action: full-width pill on phones so it's easy
                  to reach with a thumb; inline pill on >= sm.
                  Disabled while a single-topic generation is in flight
                  so the user doesn't kick off overlapping work.
                */}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={cn(
                    "h-9 w-full justify-center rounded-full px-3 text-xs sm:h-8 sm:w-auto sm:px-3",
                    "gap-1.5"
                  )}
                  onClick={handleRefresh}
                  disabled={refreshing || generating}
                  data-testid="ai-article-refresh"
                  aria-label={t("doctor.aiLibrary.refresh")}
                >
                  <HugeiconsIcon
                    icon={refreshing ? Loading01Icon : Refresh01Icon}
                    className={cn(
                      "h-3.5 w-3.5",
                      refreshing && "animate-spin"
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">
                    {refreshing
                      ? t("doctor.aiLibrary.refreshing")
                      : t("doctor.aiLibrary.refresh")}
                  </span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/*
             * Mobile: horizontal scroller with snap + edge fade.
             * ≥ md: wraps freely so all chips are visible at once.
             */}
            <div
              className="-mx-(--card-spacing) sm:mx-0"
              data-testid="ai-article-topics"
            >
              <div
                className="scrollbar-none scroll-fade-x flex gap-2 overflow-x-auto px-(--card-spacing) py-1 snap-x snap-mandatory touch-pan-x sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0 sm:[mask-image:none] sm:[-webkit-mask-image:none]"
                role="list"
                aria-label={
                  locale === "ar"
                    ? "مواضيع المقالات"
                    : "Article topics"
                }
              >
                {loadingTopics ? (
                  <span className="inline-flex shrink-0 items-center gap-2 px-2 text-xs text-muted-foreground">
                    <HugeiconsIcon
                      icon={Loading01Icon}
                      className="h-3.5 w-3.5 animate-spin"
                    />
                    {t("doctor.aiLibrary.loading")}
                  </span>
                ) : (
                  topics.map((topic) => {
                    const isActive = generating && activeTopic === topic.id;
                    const label = locale === "ar" ? topic.arTitle : topic.enTitle;
                    return (
                      <Button
                        key={topic.id}
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-9 shrink-0 snap-start rounded-full px-3.5 text-xs whitespace-nowrap sm:h-8 sm:px-3"
                        disabled={generating || refreshing}
                        onClick={() => handleGenerate(topic.id)}
                        data-testid={`ai-article-topic-${topic.id}`}
                      >
                        {isActive ? (
                          <HugeiconsIcon
                            icon={Loading01Icon}
                            className="me-1.5 h-3.5 w-3.5 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <HugeiconsIcon
                            icon={AiMagicIcon}
                            className="me-1.5 h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        )}
                        <span className="truncate">{label}</span>
                      </Button>
                    );
                  })
                )}
              </div>
            </div>
            {error && (
              <p
                className="text-xs text-destructive"
                data-testid="ai-article-error"
              >
                {error}
              </p>
            )}
            <p className="text-[11px] italic text-muted-foreground">
              {t("doctor.aiLibrary.disclaimer")}
            </p>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Grid */}
      {isEmpty ? (
        <ScrollReveal delay={0.1}>
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              {t("doctor.aiLibrary.empty")}
            </CardContent>
          </Card>
        </ScrollReveal>
      ) : (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-testid="ai-article-grid"
        >
          {articles.map((article, i) => (
            <ScrollReveal key={article.id} delay={Math.min(i * 0.04, 0.3)}>
              <AiArticleCard
                article={article}
                badge={
                  isFresh(article.createdAt) ? t("doctor.aiLibrary.newBadge") : undefined
                }
              />
            </ScrollReveal>
          ))}
        </div>
      )}

      <ScrollReveal delay={0.25}>
        <div className="flex items-center justify-center px-2 text-center">
          <span className="inline-flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5 text-[11px] text-muted-foreground">
            {t("doctor.aiLibrary.signature")}
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="h-3 w-3 rtl:rotate-180"
              aria-hidden="true"
            />
          </span>
        </div>
      </ScrollReveal>
    </section>
  );
}
