"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Message02Icon,
  HeartIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

interface CommunityPost {
  id: string;
  author: string;
  content: string;
  type: "story" | "tip" | "support";
  timestamp: string;
  likes: number;
}

const SAMPLE_POSTS: CommunityPost[] = [
  {
    id: "1",
    author: "Sarah M.",
    content: "After being diagnosed, I felt alone. This community helped me realize I'm not the only one fighting this battle. Gentle yoga has been a game-changer for my morning stiffness.",
    type: "story",
    timestamp: "2 hours ago",
    likes: 24,
  },
  {
    id: "2",
    author: "Ahmed K.",
    content: "Tip: Keep a heating pad near your bed. Waking up with stiff muscles? Apply heat for 15 minutes before getting up. It makes a huge difference in my mornings.",
    type: "tip",
    timestamp: "5 hours ago",
    likes: 18,
  },
  {
    id: "3",
    author: "Maria L.",
    content: "To anyone having a flare-up today: You are stronger than you think. This too shall pass. Be gentle with yourself. 💜",
    type: "support",
    timestamp: "1 day ago",
    likes: 42,
  },
];

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
  const { t } = useLanguage();
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState<CommunityPost[]>(SAMPLE_POSTS);

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post: CommunityPost = {
      id: String(Date.now()),
      author: "You",
      content: newPost,
      type: "story",
      timestamp: "Just now",
      likes: 0,
    };
    setPosts([post, ...posts]);
    setNewPost("");
  };

  const handleLike = (id: string) => {
    setPosts(
      posts.map((p) =>
        p.id === id ? { ...p, likes: p.likes + 1 } : p
      )
    );
  };

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

      {/* Post Input */}
      <DepthCard tilt={2} delay={0.05}>
              <SpotlightCard className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-sm shadow-depth-sm transition-all duration-300 dark:border-white/10 dark:bg-background/40 dark:backdrop-blur-xl dark:hover:border-emerald-400/30 dark:hover:shadow-[0_0_24px_rgba(16,185,129,0.16)]">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <HugeiconsIcon
                  icon={UserCircleIcon}
                  className="h-6 w-6 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <div className="flex-1 space-y-3">
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
                    className="rounded-xl px-4 py-2 text-sm font-medium"
                  >
                    {t("community.postButton")}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </SpotlightCard>
      </DepthCard>

      {/* Posts List */}
      <div className="space-y-3">
        {posts.map((post, index) => (
          <ScrollReveal key={post.id} delay={index * 0.05}>
            <DepthCard tilt={2} delay={index * 0.05}>
        <SpotlightCard className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-sm shadow-depth-sm transition-all duration-300 dark:border-white/10 dark:bg-background/40 dark:backdrop-blur-xl dark:hover:border-emerald-400/30 dark:hover:shadow-[0_0_24px_rgba(16,185,129,0.16)]">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {post.author.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {post.author}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {post.timestamp}
                          </p>
                        </div>
                      </div>
                      <PostTypeBadge type={post.type} />
                    </div>

                    {/* Content */}
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {post.content}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-1 border-t border-border/50">
                      <button
                        type="button"
                        onClick={() => handleLike(post.id)}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        aria-label={`Like (${post.likes})`}
                      >
                        <HugeiconsIcon
                          icon={HeartIcon}
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        <span>{post.likes}</span>
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        aria-label="Reply"
                      >
                        <HugeiconsIcon
                          icon={Message02Icon}
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </SpotlightCard>
            </DepthCard>
          </ScrollReveal>
        ))}
      </div>

      {/* Empty State */}
      {posts.length === 0 && (
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
