"use client";

import React, { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DocumentAttachmentIcon,
  Loading01Icon,
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
import { AiArticleLibrary, type AiArticle } from "@/components/pro/AiArticleLibrary";
import { useLanguage } from "@/context/LanguageContext";
import { useProFeature } from "@/hooks/useProFeature";
import { getDoctorPosts } from "@/app/pro/actions";
import { listPublishedArticles } from "@/app/pro/doctor-article-actions";

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string;
  verifiedStatus: string;
  createdAt: Date | string;
  author: { id: string; name: string | null };
}

export default function DoctorHubPage() {
  const { t } = useLanguage();
  const { role } = useProFeature();
  const isDoctor = role === "doctor";
  const [showEditor, setShowEditor] = useState(false);
  const [aiArticle, setAiArticle] = useState<{
    title: string;
    content: string;
    tags: string[];
    summary: string;
  } | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [aiArticles, setAiArticles] = useState<AiArticle[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingAi, setLoadingAi] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getDoctorPosts({ status: "verified", limit: 12 }),
      listPublishedArticles(12),
    ]).then(([p, a]) => {
      if (cancelled) return;
      if (p.success) setPosts(p.data ?? []);
      if (a.success) {
        setAiArticles(
          a.data.map((item) => ({
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
      setLoadingPosts(false);
      setLoadingAi(false);
    });
    return () => {
      cancelled = true;
    };
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

        <ScrollReveal delay={0.1}>
          <AiPublishingAssistant
            onArticleGenerated={(article) => {
              setAiArticle(article);
              setShowEditor(true);
            }}
          />
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          {showEditor && aiArticle && (
            <PostEditor
              initialData={{
                title: aiArticle.title,
                content: aiArticle.content,
                tags: aiArticle.tags.join(", "),
              }}
              onSaved={() => {
                setShowEditor(false);
                setAiArticle(null);
              }}
            />
          )}
          {!showEditor && (
            <Button onClick={() => setShowEditor(true)} variant="outline">
              <HugeiconsIcon icon={DocumentAttachmentIcon} className="me-2 h-4 w-4" />
              {t("doctor.newPost")}
            </Button>
          )}
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
