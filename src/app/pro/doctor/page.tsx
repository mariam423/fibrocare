"use client";

/**
 * Doctor Hub.
 *
 * A native, social-feed-style hub rendered as one continuous centre
 * column (Facebook/LinkedIn pattern) — no boxed card grids:
 *
 *   Doctor view:
 *     1. Header  — "مركز الأطباء" / Doctor Hub.
 *     2. Composer — the "نشر مقال أو بحث" posting box as a compact
 *        composer bar at the top of the feed column; opens the full
 *        PostEditor. An AI-generated draft pre-fills it.
 *     3. AI publishing assistant — generates an article draft straight
 *        into the composer.
 *     4. Social feed — the doctor's manual posts, fluid full-width items
 *        with author headers and Like / Comment / Share.
 *     5. Research feed — the AI article library, rendered as feed posts.
 *     6. Editorial workspace — the doctor's own posts (any status).
 *     7. Disclaimer.
 *
 *   Public view (any signed-in user, not a doctor):
 *     1. Hero.
 *     2. Research feed (AI article library).
 *     3. Social feed (curated manual posts).
 *     4. Disclaimer.
 *
 * Each feed manages its own data (the library self-seeds; the social
 * feed fetches `/api/pro/posts`), so the page does not gate them.
 *
 * RTL notes:
 *  - The page relies on the document-level `dir` — no per-element
 *    overrides here.
 *  - All copy is sourced from translations.
 */

import React, { useState, useEffect, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Stethoscope02Icon } from "@hugeicons/core-free-icons";
import { RouteTransition } from "@/components/ui/RouteTransition";
import GlobalNavHeader from "@/components/layout/GlobalNavHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { WordReveal } from "@/components/ui/WordReveal";
import { Card, CardContent } from "@/components/ui/card";
import { AiPublishingAssistant } from "@/components/pro/AiPublishingAssistant";
import { FeedComposer } from "@/components/pro/FeedComposer";
import { DoctorSocialFeed } from "@/components/pro/DoctorSocialFeed";
import { DoctorOwnPosts, type DoctorOwnPost } from "@/components/pro/DoctorOwnPosts";
import { AiArticleLibrary, type AiArticle } from "@/components/pro/AiArticleLibrary";
import { useLanguage } from "@/context/LanguageContext";
import { useProFeature } from "@/hooks/useProFeature";
import { getMyDoctorPosts } from "@/app/pro/actions";
import { listPublishedArticles } from "@/app/pro/doctor-article-actions";

export default function DoctorHubPage() {
  const { t, locale } = useLanguage();
  const { role } = useProFeature();
  const isDoctor = role === "doctor";

  // Doctor-only state: a pending AI draft that pre-fills the composer.
  const [aiArticle, setAiArticle] = useState<{
    title: string;
    content: string;
    tags: string[];
    summary: string;
  } | null>(null);

  // Shared feeds (public + doctor both need them).
  const [aiArticles, setAiArticles] = useState<AiArticle[]>([]);
  const [myPosts, setMyPosts] = useState<DoctorOwnPost[]>([]);

  // Bumping this counter forces the fetch effect to re-run. The
  // composer's onSaved handler increments it so a fresh manual post
  // shows up in the doctor's editorial workspace without a reload.
  const [refreshTick, setRefreshTick] = React.useState(0);

  // Inline the parallel fetch so the `react-hooks/set-state-in-effect`
  // rule (which fires for any function call from useEffect that may
  // touch state) sees a plain `.then()` chain.
  useEffect(() => {
    let cancelled = false;
    const tasks: Array<Promise<unknown>> = [
      // The AI library mirrors the document locale — an Arabic-
      // locale reader sees the Arabic rendering of every curated
      // topic, an English-locale reader sees the English one. The
      // same topic is never rendered twice in the same locale.
      listPublishedArticles(12, locale === "ar" ? "ar" : "en"),
    ];
    if (isDoctor) {
      // Also fetch the doctor's own posts (any status) so the
      // editorial workspace shows drafts and rejected posts too.
      tasks.push(getMyDoctorPosts(24));
    }
    Promise.all(tasks)
      .then((results) => {
        if (cancelled) return;
        const [ai, mine] = results as [
          Awaited<ReturnType<typeof listPublishedArticles>>,
          Awaited<ReturnType<typeof getMyDoctorPosts>> | undefined,
        ];
        if (ai.success && Array.isArray(ai.data)) {
          setAiArticles(
            ai.data.map((item) => ({
              id: item.id,
              title: item.title,
              summary: item.summary,
              content: item.content,
              tags: item.tags,
              createdAt: item.createdAt,
              authorName: item.authorName,
              authorTitle: item.authorTitle,
              authorityLabel: item.authorityLabel,
              readingMinutes: item.readingMinutes,
              // Pass the language through so the card's `lang`
              // attribute and the dedup key both stay accurate.
              language: item.language,
            }))
          );
        }
        if (isDoctor && mine && mine.success && Array.isArray(mine.data)) {
          setMyPosts(mine.data);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Doctor hub feed refresh failed:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [isDoctor, refreshTick, locale]);

  // Re-run the fetch after a save so the new entry shows up in the
  // doctor's editorial workspace.
  const refreshFeeds = useCallback(() => {
    setRefreshTick((n) => n + 1);
  }, []);

  if (!isDoctor) {
    return (
      <RouteTransition>
        <GlobalNavHeader />
        <main className="container mx-auto max-w-3xl px-4 py-8 pt-[calc(env(safe-area-inset-top)+1.5rem)] space-y-6 sm:space-y-8 sm:py-12 sm:pt-[calc(env(safe-area-inset-top)+2rem)]">
          <ScrollReveal>
            <div className="text-center space-y-3">
              <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-3xl border border-emerald-500/20 shadow-xl shadow-emerald-950/15 ring-1 ring-emerald-500/10">
                <img
                  src="/images/الطبيب.jpg"
                  alt="Doctor Hub"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <HugeiconsIcon icon={Stethoscope02Icon} className="h-3 w-3" aria-hidden="true" />
                {t("pro.page.doctorHubBadge")}
              </span>
              <WordReveal
                as="h1"
                text={t("pro.page.doctorHubTitle")}
                className="text-balance text-2xl font-bold tracking-tight"
              />
              <p className="mx-auto max-w-xl text-pretty text-muted-foreground">
                {t("pro.page.doctorHubDesc")}
              </p>
            </div>
          </ScrollReveal>

          {/* Public feed: AI-generated research, then curated manual posts. */}
          <ScrollReveal delay={0.05}>
            <AiArticleLibrary initialArticles={aiArticles} />
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <DoctorSocialFeed />
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
              <CardContent className="py-4">
                <p className="text-xs text-muted-foreground italic">
                  {t("doctor.aiDisclaimer")}
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>
        </main>
      </RouteTransition>
    );
  }

  return (
    <RouteTransition>
      <GlobalNavHeader />
      <main className="container mx-auto max-w-3xl px-4 py-8 pt-[calc(env(safe-area-inset-top)+1.5rem)] space-y-6 sm:space-y-8 sm:py-12 sm:pt-[calc(env(safe-area-inset-top)+2rem)]">
        <ScrollReveal>
          <div className="flex flex-col items-start gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <HugeiconsIcon
                icon={Stethoscope02Icon}
                className="h-3 w-3"
                aria-hidden="true"
              />
              {t("pro.page.doctorHubBadge")}
            </span>
            <div className="min-w-0 space-y-1">
              <WordReveal
                as="h1"
                text={t("doctor.title")}
                className="text-balance text-2xl font-bold tracking-tight"
              />
              <p className="text-pretty text-muted-foreground">
                {t("doctor.subtitle")}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Composer: "نشر مقال أو بحث" at the top of the feed column. */}
        <ScrollReveal delay={0.05}>
          <FeedComposer
            initialData={
              aiArticle
                ? {
                    title: aiArticle.title,
                    content: aiArticle.content,
                    tags: aiArticle.tags.join(", "),
                  }
                : undefined
            }
            onSaved={() => {
              setAiArticle(null);
              // Reload the doctor's own posts so the new entry shows
              // up immediately in the editorial workspace.
              refreshFeeds();
            }}
          />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <AiPublishingAssistant
            onArticleGenerated={(article) => {
              setAiArticle(article);
            }}
          />
        </ScrollReveal>

        {/* Doctor's manual posts — fluid feed items. */}
        <ScrollReveal delay={0.15}>
          <DoctorSocialFeed />
        </ScrollReveal>

        {/* AI-generated research, rendered as feed posts. */}
        <ScrollReveal delay={0.18}>
          <AiArticleLibrary initialArticles={aiArticles} />
        </ScrollReveal>

        {/*
          The doctor's editorial workspace: every post they have
          authored, regardless of verified status, with an inline
          edit affordance.
        */}
        <ScrollReveal delay={0.2}>
          <div className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {t("doctor.ownPosts.title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("doctor.ownPosts.subtitle")}
              </p>
            </div>
            <DoctorOwnPosts
              posts={myPosts}
              onChanged={() => refreshFeeds()}
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground italic">
                {t("doctor.aiDisclaimer")}
              </p>
            </CardContent>
          </Card>
        </ScrollReveal>
      </main>
    </RouteTransition>
  );
}