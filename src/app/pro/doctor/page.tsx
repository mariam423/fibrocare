"use client";

/**
 * Doctor Hub.
 *
 * Two surfaces:
 *   1. Public (any signed-in user, not a doctor): the AI article
 *      library, the curated manual feed, and the disclaimer.
 *   2. Doctor (verified doctor role): the AI library + the manual
 *      publishing composer + the doctor's own editorial posts
 *      (pending, verified, rejected) + the disclaimer.
 *
 * Mobile notes:
 *  - The hero, AI library, and composer are stacked on phones and
 *    become inline rows at >= sm.
 *  - The composer button is a full-width pill on mobile so it's easy
 *    to reach with a thumb.
 *
 * RTL notes:
 *  - The page relies on the document-level `dir` (set in
 *    `src/app/layout.tsx`) — no per-element overrides here.
 *  - All copy is sourced from translations; no hard-coded English
 *    strings remain in the JSX.
 *  - Inline numeric values (e.g. dates) are rendered with the locale
 *    formatter so digits stay native in both languages.
 */

import React, { useState, useEffect, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DocumentAttachmentIcon,
  Loading01Icon,
  PencilEdit01Icon,
  Stethoscope02Icon,
} from "@hugeicons/core-free-icons";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { WordReveal } from "@/components/ui/WordReveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiPublishingAssistant } from "@/components/pro/AiPublishingAssistant";
import { PostEditor } from "@/components/pro/PostEditor";
import { DoctorContentFeed } from "@/components/pro/DoctorContentFeed";
import { DoctorOwnPosts, type DoctorOwnPost } from "@/components/pro/DoctorOwnPosts";
import { AiArticleLibrary, type AiArticle } from "@/components/pro/AiArticleLibrary";
import { useLanguage } from "@/context/LanguageContext";
import { useProFeature } from "@/hooks/useProFeature";
import { getDoctorPosts, getMyDoctorPosts } from "@/app/pro/actions";
import { listPublishedArticles } from "@/app/pro/doctor-article-actions";

export default function DoctorHubPage() {
  const { t } = useLanguage();
  const { role } = useProFeature();
  const isDoctor = role === "doctor";

  // Doctor-only state.
  const [showEditor, setShowEditor] = useState(false);
  const [aiArticle, setAiArticle] = useState<{
    title: string;
    content: string;
    tags: string[];
    summary: string;
  } | null>(null);

  // Shared feeds (public + doctor both need them).
  const [posts, setPosts] = useState<DoctorOwnPost[]>([]);
  const [aiArticles, setAiArticles] = useState<AiArticle[]>([]);
  const [myPosts, setMyPosts] = useState<DoctorOwnPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingAi, setLoadingAi] = useState(true);

  // Bumping this counter forces the feed effect to re-run. The
  // PostEditor's onSaved handler increments it so a fresh manual
  // post shows up in the doctor's editorial workspace without a
  // full page reload.
  const [refreshTick, setRefreshTick] = React.useState(0);

  // Inline the parallel fetch so the `react-hooks/set-state-in-effect`
  // rule (which fires for any function call from useEffect that may
  // touch state) sees a plain `.then()` chain.
  useEffect(() => {
    let cancelled = false;
    const tasks: Array<Promise<unknown>> = [
      getDoctorPosts({ status: "verified", limit: 12 }),
      listPublishedArticles(12),
    ];
    if (isDoctor) {
      // Also fetch the doctor's own posts (any status) so the
      // editorial workspace shows drafts and rejected posts too.
      tasks.push(getMyDoctorPosts(24));
    }
    Promise.all(tasks)
      .then((results) => {
        if (cancelled) return;
        const [verified, ai, mine] = results as [
          Awaited<ReturnType<typeof getDoctorPosts>>,
          Awaited<ReturnType<typeof listPublishedArticles>>,
          Awaited<ReturnType<typeof getMyDoctorPosts>> | undefined,
        ];
        if (verified.success && Array.isArray(verified.data)) {
          setPosts(verified.data);
        }
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
            }))
          );
        }
        if (isDoctor && mine && mine.success && Array.isArray(mine.data)) {
          setMyPosts(mine.data);
        }
        setLoadingPosts(false);
        setLoadingAi(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Doctor hub feed refresh failed:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [isDoctor, refreshTick]);

  // Re-run the fetch after a save so the new entry shows up in the
  // doctor's editorial workspace.
  const refreshFeeds = useCallback(() => {
    setRefreshTick((n) => n + 1);
  }, []);

  if (!isDoctor) {
    return (
      <RouteTransition>
        <main className="container mx-auto max-w-5xl px-4 py-8 space-y-6 sm:space-y-8 sm:py-12">
          <ScrollReveal>
            <div className="text-center space-y-3">
              <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-3xl border border-emerald-500/20 shadow-xl shadow-emerald-950/15 ring-1 ring-emerald-500/10 sm:h-36 sm:w-36">
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

          {/* Public feed: AI-generated articles library, plus the manual feed. */}
          <ScrollReveal delay={0.05}>
            <AiArticleLibrary initialArticles={aiArticles} />
          </ScrollReveal>

          {loadingPosts || loadingAi ? (
            <div className="flex items-center justify-center py-12">
              <HugeiconsIcon
                icon={Loading01Icon}
                className="h-6 w-6 animate-spin text-muted-foreground"
              />
            </div>
          ) : null}

          {posts.length > 0 ? (
            <ScrollReveal delay={0.15}>
              <DoctorContentFeed posts={posts} />
            </ScrollReveal>
          ) : null}

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
      <main className="container mx-auto max-w-5xl px-4 py-8 space-y-6 sm:space-y-8 sm:py-12">
        <ScrollReveal>
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-start">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-3xl border border-emerald-500/20 shadow-lg shadow-emerald-950/15 ring-1 ring-emerald-500/10 sm:h-24 sm:w-24">
              <img
                src="/images/الطبيب.jpg"
                alt="Doctor Hub"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 space-y-1">
              <WordReveal
                as="h1"
                text={t("doctor.dashboardTitle")}
                className="text-balance text-2xl font-bold tracking-tight"
              />
              <p className="text-pretty text-muted-foreground">
                {t("doctor.dashboardSubtitle")}
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <AiArticleLibrary initialArticles={aiArticles} />
        </ScrollReveal>

        {/*
          Manual publishing section. Always shows the headline + the
          primary CTA, so a doctor can publish without first scrolling
          through the AI assistant. The editor toggles inline below.
        */}
        <ScrollReveal delay={0.1}>
          <Card data-testid="doctor-manual-publishing">
            <CardContent className="space-y-4 py-5">
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0 space-y-1">
                  <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
                    <HugeiconsIcon
                      icon={PencilEdit01Icon}
                      className="h-4 w-4 text-primary"
                      aria-hidden="true"
                    />
                    {t("doctor.manualPublishing.title")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("doctor.manualPublishing.subtitle")}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setShowEditor((open) => !open);
                    // Manual flow starts blank — discard any pending
                    // AI draft context.
                    setAiArticle(null);
                  }}
                  variant={showEditor ? "outline" : "default"}
                  className="h-10 w-full justify-center rounded-full px-4 text-sm sm:h-9 sm:w-auto sm:px-4"
                  data-testid="doctor-manual-toggle"
                >
                  <HugeiconsIcon
                    icon={DocumentAttachmentIcon}
                    className="me-2 h-4 w-4"
                    aria-hidden="true"
                  />
                  {showEditor
                    ? t("doctor.manualPublishing.closeEditor")
                    : t("doctor.manualPublishing.openEditor")}
                </Button>
              </div>
              {showEditor && (
                <div className="pt-1">
                  <PostEditor
                    // Pre-fill from the AI assistant if it just
                    // produced a draft; otherwise start blank.
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
                      setShowEditor(false);
                      setAiArticle(null);
                      // Reload the doctor's own posts so the new
                      // entry shows up immediately in the editorial
                      // workspace below.
                      refreshFeeds();
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <AiPublishingAssistant
            onArticleGenerated={(article) => {
              setAiArticle(article);
              setShowEditor(true);
            }}
          />
        </ScrollReveal>

        {/*
          The doctor's editorial workspace: every post they have
          authored, regardless of verified status, with an inline
          edit affordance. Verified posts flow to the public feed
          via `DoctorContentFeed` below.
        */}
        <ScrollReveal delay={0.18}>
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

        {posts.length > 0 ? (
          <ScrollReveal delay={0.2}>
            <DoctorContentFeed posts={posts} />
          </ScrollReveal>
        ) : null}

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
