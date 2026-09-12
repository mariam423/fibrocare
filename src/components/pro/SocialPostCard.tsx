"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { HeartIcon, MessageSquareIcon, ShareIcon, VerifiedIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

interface SocialPostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    tags: string;
    kind: string;
    mediaUrls?: string[];
    author: {
      id: string;
      name: string;
    };
    reactionsCount: number;
    commentsCount: number;
    isLiked?: boolean;
  };
  onLike?: (postId: string, currentlyLiked: boolean) => Promise<void>;
}

export function SocialPostCard({ post, onLike }: SocialPostCardProps) {
  const { t } = useLanguage();
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(post.reactionsCount);

  const handleLike = async () => {
    if (!onLike) return;

    // Optimistic update
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount(prev => nextLiked ? prev + 1 : prev - 1);

    try {
      await onLike(post.id, liked);
    } catch (e) {
      // Rollback
      setLiked(!nextLiked);
      setLikesCount(prev => !nextLiked ? prev + 1 : prev - 1);
    }
  };

  const kindLabels: Record<string, string> = {
    article: t("doctor.kind.article"),
    research: t("doctor.kind.research"),
    status: t("doctor.kind.status"),
  };

  return (
    <Card className="group relative overflow-hidden border-emerald-500/20 bg-white/70 shadow-sm ring-1 ring-emerald-500/10 backdrop-blur-xl transition-all hover:shadow-md dark:bg-slate-900/70">
      {/* Category Badge */}
      <div className="absolute right-0 top-0 flex h-8 items-center bg-emerald-500/10 px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
        {kindLabels[post.kind] ?? post.kind}
      </div>

      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          {/* Doctor Profile */}
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-lg font-semibold text-emerald-700 dark:bg-slate-800 dark:text-emerald-300">
                {post.author.name?.[0] ?? "D"}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5 text-emerald-500 shadow-sm dark:bg-slate-800">
              <HugeiconsIcon icon={VerifiedIcon} className="h-3 w-3" />
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{post.author.name}</span>
              <span className="text-[11px] text-muted-foreground">• Verified Specialist</span>
            </div>

            <h3 className="text-base font-semibold leading-tight text-foreground/90">
              {post.title}
            </h3>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {post.content}
            </p>

            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {post.mediaUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="Post media"
                    className="h-32 w-full rounded-lg object-cover ring-1 ring-border"
                  />
                ))}
              </div>
            )}

            {post.tags && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {post.tags.split(",").map((tag) => (
                  <span
                    key={tag.trim()}
                    className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-emerald-500/10 pt-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                "h-8 px-2 text-xs transition-colors hover:bg-emerald-500/10",
                liked ? "text-rose-500 hover:text-rose-600" : "text-muted-foreground"
              )}
            >
              <HugeiconsIcon
                icon={HeartIcon}
                className={cn("me-1.5 h-4 w-4", liked && "fill-current")}
              />
              {likesCount}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground hover:bg-emerald-500/10"
            >
              <HugeiconsIcon icon={MessageSquareIcon} className="me-1.5 h-4 w-4" />
              {post.commentsCount}
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground hover:bg-emerald-500/10">
            <HugeiconsIcon icon={ShareIcon} className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
