"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SocialPostCard } from "./SocialPostCard";
import { FeedFilters } from "./FeedFilters";
import {
  AdvancedFeedFilters,
  applyAdvancedFilters,
  type FeedSort,
} from "./AdvancedFeedFilters";
import { useLanguage } from "@/context/LanguageContext";

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string;
  kind: string;
  mediaUrls: string[];
  author: { id: string; name: string };
  verifiedStatus: string;
  reactionsCount: number;
  commentsCount: number;
  createdAt?: string;
}

export function DoctorSocialFeed() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Advanced filter state (client-side layer on top of the kind filter).
  const [query, setQuery] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sort, setSort] = useState<FeedSort>("newest");

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
        verifiedStatus?: string;
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
        verifiedStatus: p.verifiedStatus ?? "verified",
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

  const toggleTopic = useCallback((topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((tp) => tp !== topic) : [...prev, topic]
    );
  }, []);

  /** Client-side search / topic / sort pass over the fetched posts. */
  const visiblePosts = useMemo(
    () => applyAdvancedFilters(posts, query, selectedTopics, sort),
    [posts, query, selectedTopics, sort]
  );

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

      {/* Advanced search / topics / sort — pure client-side pass. */}
      <div className="mb-5">
        <AdvancedFeedFilters
          posts={posts}
          query={query}
          onQueryChange={setQuery}
          selectedTopics={selectedTopics}
          onToggleTopic={toggleTopic}
          sort={sort}
          onSortChange={setSort}
          visibleCount={visiblePosts.length}
        />
      </div>

      {visiblePosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 px-4 py-12 text-center backdrop-blur-sm">
          <p className="text-sm font-medium text-foreground">
            {t("doctor.feed.noResults")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("doctor.feed.noResultsHint")}
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedTopics([]);
            }}
            className="mt-4 rounded-full border border-emerald-500/40 px-4 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-500/10 dark:text-emerald-300"
          >
            {t("doctor.feed.clearAll")}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {visiblePosts.map((post, i) => (
            <ScrollReveal key={post.id} delay={Math.min(i * 0.05, 0.3)}>
              <SocialPostCard
                post={post}
                onLike={handleLike}
              />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
