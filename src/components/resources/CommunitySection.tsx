"use client";

import React, { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Message02Icon,
  HeartIcon,
  UserCircleIcon,
  LanguageCircleIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { AiTakeawayBanner } from "@/components/resources/AiTakeawayBanner";
import { BdiText } from "@/components/resources/BdiText";
import { useLanguage } from "@/context/LanguageContext";
import { translations, type Locale, type TranslationKey } from "@/lib/translations";
import { PAGE_TAKEAWAYS, groundingTakeaway } from "@/lib/resources/engine";
import { cn } from "@/lib/utils";

interface CommunityPost {
  id: string;
  author: string;
  content: string;
  type: "story" | "tip" | "support";
  timestamp: string;
  likes: number;
}

/**
 * Sample posts render through translation keys so toggling locale re-words
 * every card. They live in a module constant (ids/authors/likes are static)
 * and the localized content/timestamp are derived at render time.
 */
const SAMPLE_POSTS: Omit<CommunityPost, "content" | "timestamp">[] = [
  {
    id: "1",
    author: "Sarah M.",
    type: "story",
    likes: 24,
  },
  {
    id: "2",
    author: "Ahmed K.",
    type: "tip",
    likes: 18,
  },
  {
    id: "3",
    author: "Maria L.",
    type: "support",
    likes: 42,
  },
];

const SAMPLE_CONTENT_KEYS: TranslationKey[] = [
  "community.samplePost.1.content",
  "community.samplePost.2.content",
  "community.samplePost.3.content",
];

const SAMPLE_TIME_KEYS: TranslationKey[] = [
  "community.samplePost.1.time",
  "community.samplePost.2.time",
  "community.samplePost.3.time",
];

/** Sample post ids — likes for these live in `sampleLikes` state. */
const SAMPLE_IDS = new Set(SAMPLE_POSTS.map((p) => p.id));

type PostFilter = "all" | CommunityPost["type"];

function PostTypeBadge({ type }: { type: CommunityPost["type"] }) {
  const { t } = useLanguage();
  const config = {
    story: { label: t("community.stories"), color: "bg-primary/10 text-primary" },
    tip: { label: t("community.tips"), color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
    support: { label: t("community.support"), color: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400" },
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config[type].color
      )}
    >
      {config[type].label}
    </span>
  );
}

export function CommunitySection() {
  const { t, locale } = useLanguage();
  const [newPost, setNewPost] = useState("");
  const [newPostType, setNewPostType] = useState<CommunityPost["type"]>("story");
  // User-generated posts only. Sample posts are derived at render time so
  // they re-localize instantly on locale toggle; their likes live here.
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [sampleLikes, setSampleLikes] = useState<Record<string, number>>(() =>
    Object.fromEntries(SAMPLE_POSTS.map((p) => [p.id, p.likes]))
  );
  const [filter, setFilter] = useState<PostFilter>("all");
  // Per-post bilingual toggle: sample posts carry both locales in the
  // translation dictionary, so toggling swaps curated content EN ↔ AR.
  // User-written posts can't be translated offline and skip the button.
  const [translated, setTranslated] = useState<Record<string, boolean>>({});

  const otherLocale: Locale = locale === "ar" ? "en" : "ar";

  const takeaway = useMemo(
    () => ({
      bullets: PAGE_TAKEAWAYS.community.bullets,
      chunk: groundingTakeaway("community"),
    }),
    []
  );

  // Sample feed, localized on every render (locale toggle re-words it).
  const samplePosts: CommunityPost[] = SAMPLE_POSTS.map((p, i) => {
    const isTranslated = translated[p.id];
    return {
      ...p,
      content: isTranslated
        ? translations[otherLocale][SAMPLE_CONTENT_KEYS[i]]
        : t(SAMPLE_CONTENT_KEYS[i]),
      timestamp: isTranslated
        ? translations[otherLocale][SAMPLE_TIME_KEYS[i]]
        : t(SAMPLE_TIME_KEYS[i]),
      likes: sampleLikes[p.id] ?? 0,
    };
  });

  const allPosts: CommunityPost[] = [...userPosts, ...samplePosts];
  const visiblePosts =
    filter === "all" ? allPosts : allPosts.filter((p) => p.type === filter);

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post: CommunityPost = {
      id: String(Date.now()),
      author: t("community.you"),
      content: newPost,
      type: newPostType,
      timestamp: t("community.justNow"),
      likes: 0,
    };
    setUserPosts([post, ...userPosts]);
    setNewPost("");
    setNewPostType("story");
  };

  const handleLike = (id: string) => {
    if (SAMPLE_IDS.has(id)) {
      setSampleLikes((likes) => ({ ...likes, [id]: (likes[id] ?? 0) + 1 }));
      return;
    }
    setUserPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  const toggleTranslate = (id: string) => {
    setTranslated((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const FILTERS: Array<{ id: PostFilter; labelKey: TranslationKey }> = [
    { id: "all", labelKey: "community.filter.all" },
    { id: "story", labelKey: "community.stories" },
    { id: "tip", labelKey: "community.tips" },
    { id: "support", labelKey: "community.support" },
  ];

  return (
    <ScrollReveal as="section" className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <HugeiconsIcon icon={Message02Icon} className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {t("community.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("community.subtitle")}
          </p>
        </div>
      </div>

      <AiTakeawayBanner bullets={takeaway.bullets} chunk={takeaway.chunk} />

      {/* Post Input */}
      <DepthCard tilt={2} delay={0.05}>
        <SpotlightCard className="rounded-2xl border border-emerald-500/20 bg-white/70 shadow-lg shadow-emerald-950/20 backdrop-blur-xl transition-all duration-200 hover:scale-[1.01] hover:border-emerald-400/40 hover:shadow-emerald-950/30 dark:bg-slate-900/60">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <HugeiconsIcon
                  icon={UserCircleIcon}
                  className="h-6 w-6 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <div className="flex-1 space-y-3">
                {/* Category tags */}
                <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={t("community.filter.aria")}>
                  {([
                    { id: "story" as const, labelKey: "community.stories" as TranslationKey },
                    { id: "tip" as const, labelKey: "community.tips" as TranslationKey },
                    { id: "support" as const, labelKey: "community.support" as TranslationKey },
                  ]).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      role="radio"
                      aria-checked={newPostType === cat.id}
                      onClick={() => setNewPostType(cat.id)}
                      className={cn(
                        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                        newPostType === cat.id
                          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 shadow-sm shadow-emerald-500/10 dark:text-emerald-300"
                          : "border-border bg-card/60 text-muted-foreground hover:border-emerald-400/30 hover:text-foreground"
                      )}
                    >
                      {t(cat.labelKey)}
                    </button>
                  ))}
                </div>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder={t("community.writePlaceholder")}
                  className="w-full rounded-xl border border-border bg-card/60 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary outline-none transition-all duration-300 resize-none"
                  rows={3}
                  aria-label={t("community.writePlaceholder")}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handlePost}
                    disabled={!newPost.trim()}
                    className="rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {t("community.postButton")}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </SpotlightCard>
      </DepthCard>

      {/* Category filter chips */}
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label={t("community.filter.aria")}
      >
        {FILTERS.map((option) => {
          const active = filter === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(option.id)}
              className={cn(
                "inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 shadow-sm shadow-emerald-500/10 dark:text-emerald-300"
                  : "border-border bg-card/60 text-muted-foreground hover:border-emerald-400/30 hover:text-foreground"
              )}
            >
              {t(option.labelKey)}
            </button>
          );
        })}
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        {visiblePosts.map((post, index) => (
          <ScrollReveal key={post.id} delay={index * 0.05}>
            <DepthCard tilt={2} delay={index * 0.05}>
              <SpotlightCard className="rounded-2xl border border-emerald-500/20 bg-white/70 shadow-lg shadow-emerald-950/20 backdrop-blur-xl transition-all duration-200 hover:scale-[1.01] hover:border-emerald-400/40 hover:shadow-emerald-950/30 dark:bg-slate-900/60">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          <bdi>{post.author.charAt(0)}</bdi>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            <bdi>{post.author}</bdi>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <bdi>{post.timestamp}</bdi>
                          </p>
                        </div>
                      </div>
                      <PostTypeBadge type={post.type} />
                    </div>

                    {/* Content */}
                    <div className="text-sm text-foreground/90 leading-relaxed">
                      <BdiText text={post.content} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-1 border-t border-border/50">
                      <button
                        type="button"
                        onClick={() => handleLike(post.id)}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        aria-label={t("community.likeAria", { count: post.likes })}
                      >
                        <HugeiconsIcon
                          icon={HeartIcon}
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        <bdi>{post.likes}</bdi>
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        aria-label={t("community.reply")}
                      >
                        <HugeiconsIcon
                          icon={Message02Icon}
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        <span>{t("community.reply")}</span>
                      </button>
                      {SAMPLE_IDS.has(post.id) && (
                        <button
                          type="button"
                          onClick={() => toggleTranslate(post.id)}
                          className="ms-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                          aria-label={
                            translated[post.id]
                              ? t("community.translated")
                              : t("community.translate")
                          }
                          aria-pressed={translated[post.id]}
                        >
                          <HugeiconsIcon
                            icon={LanguageCircleIcon}
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          <span>
                            {translated[post.id]
                              ? t("community.translated")
                              : t("community.translate")}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </SpotlightCard>
            </DepthCard>
          </ScrollReveal>
        ))}
      </div>

      {/* Empty State */}
      {visiblePosts.length === 0 && (
        <Card className="border-none shadow-depth-sm">
          <CardContent className="py-12 text-center">
            <HugeiconsIcon
              icon={Message02Icon}
              className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4"
              aria-hidden="true"
            />
            <p className="text-muted-foreground">{t("community.noStories")}</p>
          </CardContent>
        </Card>
      )}
    </ScrollReveal>
  );
}
