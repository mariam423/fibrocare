"use client";

/**
 * Client-side library that loads AI-generated doctor articles for the
 * Doctor Hub. On mount it:
 *   1. Lists existing verified articles.
 *   2. If the list is empty, triggers the seed endpoint so the feed is
 *      never blank.
 *   3. Subscribes to the picker — generating a fresh article on a topic
 *      prepends it to the visible list.
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
 */

import React, { useCallback, useEffect, useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiMagicIcon,
  ArrowRight01Icon,
  Loading01Icon,
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

export function AiArticleLibrary({ initialArticles }: AiArticleLibraryProps) {
  const { t, locale } = useLanguage();
  const [articles, setArticles] = useState<AiArticle[]>(initialArticles);
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [generating, startGenerating] = useTransition();
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
          setError(locale === "ar"
            ? "تعذر تحميل المقالات الآن. حاول تحديث الصفحة."
            : "Could not load articles right now. Try refreshing.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialArticles.length, locale]);

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
        const next: AiArticle = {
          id: result.data.postId,
          title: result.data.title,
          summary: result.data.summary,
          content: result.data.content,
          tags: result.data.tags,
          createdAt: result.data.createdAt,
          authorName: result.data.authorName,
          authorTitle: result.data.authorTitle,
          authorityLabel: result.data.authorityLabel,
          readingMinutes: result.data.readingMinutes,
        };
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

  const isEmpty = articles.length === 0;
  const isRtl = locale === "ar";

  return (
    <section
      className="space-y-5 sm:space-y-6"
      data-testid="ai-article-library"
      dir={isRtl ? "rtl" : "ltr"}
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
              <span className="inline-flex w-fit shrink-0 items-center gap-1 self-start rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 sm:self-auto">
                <HugeiconsIcon
                  icon={Stethoscope02Icon}
                  className="h-3 w-3"
                  aria-hidden="true"
                />
                {t("doctor.aiLibrary.reviewed")}
              </span>
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
                        disabled={generating}
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
