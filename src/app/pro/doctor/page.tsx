"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { DocumentAttachmentIcon, Loading01Icon, Stethoscope02Icon } from "@hugeicons/core-free-icons";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { WordReveal } from "@/components/ui/WordReveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiPublishingAssistant } from "@/components/pro/AiPublishingAssistant";
import { PostEditor } from "@/components/pro/PostEditor";
import { DoctorContentFeed } from "@/components/pro/DoctorContentFeed";
import { useLanguage } from "@/context/LanguageContext";
import { useProFeature } from "@/hooks/useProFeature";
import { getDoctorPosts } from "@/app/pro/actions";

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
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    getDoctorPosts({ status: "verified", limit: 12 }).then((r) => {
      setPosts(r.success ? (r.data ?? []) : []);
      setLoadingPosts(false);
    });
  }, []);

  if (!isDoctor) {
    return (
      <RouteTransition>
        <main className="container mx-auto max-w-5xl px-4 py-12 space-y-8">
          <ScrollReveal>
            <div className="text-center space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <HugeiconsIcon icon={Stethoscope02Icon} className="h-3 w-3" aria-hidden="true" />
                {t("pro.page.doctorHubBadge")}
              </span>
              <WordReveal
                as="h1"
                text={t("pro.page.doctorHubTitle")}
                className="text-2xl font-bold tracking-tight"
              />
              <p className="mx-auto max-w-xl text-muted-foreground">
                {t("pro.page.doctorHubDesc")}
              </p>
            </div>
          </ScrollReveal>

          {loadingPosts ? (
            <div className="flex items-center justify-center py-16">
              <HugeiconsIcon icon={Loading01Icon} className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length > 0 ? (
            <ScrollReveal delay={0.1}>
              <DoctorContentFeed posts={posts} />
            </ScrollReveal>
          ) : (
            <ScrollReveal delay={0.1}>
              <Card>
                <CardContent className="py-12 text-center">
                  <HugeiconsIcon icon={Stethoscope02Icon} className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">{t("doctor.noPosts")}</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          )}

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
      <main className="container mx-auto max-w-5xl px-4 py-12 space-y-8">
        <ScrollReveal>
          <div className="space-y-1">
            <WordReveal
              as="h1"
              text={t("doctor.dashboardTitle")}
              className="text-2xl font-bold tracking-tight"
            />
            <p className="text-muted-foreground">{t("doctor.dashboardSubtitle")}</p>
          </div>
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
