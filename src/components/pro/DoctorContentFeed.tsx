"use client";

import React from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string;
  verifiedStatus: string;
  createdAt: Date | string;
  author: { id: string; name: string | null };
}

interface DoctorContentFeedProps {
  posts: Post[];
}

export function DoctorContentFeed({ posts }: DoctorContentFeedProps) {
  const { t } = useLanguage();

  const verifiedPosts = posts.filter((p) => p.verifiedStatus === "verified");
  const publishedPosts = verifiedPosts.length > 0 ? verifiedPosts : posts.filter((p) => p.verifiedStatus === "published");

  if (publishedPosts.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">{t("doctor.noPosts")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">{t("doctor.feedTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("doctor.feedSubtitle")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {publishedPosts.map((post, i) => (
          <ScrollReveal key={post.id} delay={i * 0.05}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium">
                    {post.author.name ?? "Doctor"}
                  </span>
                  {post.verifiedStatus === "verified" && (
                    <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600 font-medium dark:bg-emerald-950 dark:text-emerald-400">
                      {t("doctor.verified")}
                    </span>
                  )}
                </div>
                <CardTitle className="text-base leading-snug">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {post.content.slice(0, 200)}…
                </p>
                {post.tags && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.split(",").map((tag) => (
                      <span
                        key={tag.trim()}
                        className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
