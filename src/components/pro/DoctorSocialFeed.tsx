"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SocialPostCard } from "./SocialPostCard";
import { FeedFilters } from "./FeedFilters";
import { useLanguage } from "@/context/LanguageContext";

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string;
  kind: string;
  mediaUrls: string[];
  author: { id: string; name: string };
  reactionsCount: number;
  commentsCount: number;
  createdAt?: string;
}

export function DoctorSocialFeed() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const kindParam = filter === "all" ? "" : `?kind=${filter}`;
      const res = await fetch(`/api/pro/posts${kindParam}`);
      const data = await res.json();

      // Enhance posts with counts for the social feed
      const enhancedPosts: Post[] = data.posts.map((p: {
        id: string;
        title: string;
        content: string;
        tags: string;
        kind: string;
        author: { id: string; name: string };
        _count?: { reactions: number; comments: number };
        mediaUrls?: string[];
        createdAt?: string;
      }) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        tags: p.tags,
        kind: p.kind,
        mediaUrls: p.mediaUrls || [],
        author: p.author,
        reactionsCount: p._count?.reactions || 0,
        commentsCount: p._count?.comments || 0,
        createdAt: p.createdAt,
      }));

      setPosts(enhancedPosts);
    } catch (e) {
      console.error("Failed to fetch feed:", e);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    // Defer to a microtask so the loading flag is not set
    // synchronously inside the effect body (react-hooks rule).
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      fetchPosts();
    });
    return () => {
      cancelled = true;
    };
  }, [fetchPosts]);

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/pro/posts/${postId}/like`, { method: "POST" });
      if (!res.ok) throw new Error("Like failed");

      // Refresh counts
      fetchPosts();
    } catch (e) {
      console.error("Like error:", e);
      throw e;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 px-4 py-14 text-center backdrop-blur-sm">
        <h3 className="text-base font-semibold text-foreground">
          {t("doctor.socialFeedTitle") ?? "Professional Feed"}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">{t("doctor.noPosts")}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {t("doctor.socialFeedTitle") ?? "Professional Feed"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("doctor.socialFeedSubtitle") ?? "Insights from the medical community"}
          </p>
        </div>
        <FeedFilters activeFilter={filter} onFilterChange={setFilter} />
      </div>

      <div className="space-y-5">
        {posts.map((post, i) => (
          <ScrollReveal key={post.id} delay={Math.min(i * 0.05, 0.3)}>
            <SocialPostCard
              post={post}
              onLike={handleLike}
            />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
