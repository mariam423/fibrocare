"use client";

/**
 * A single post in the Doctor Hub social feed.
 *
 * Rendered as a native, fluid feed item (LinkedIn/Facebook style) rather
 * than a boxed grid card:
 *  - A modern author header: circular avatar, verified badge, name,
 *    "Verified" label and a relative timestamp ("5m", "3h", "2d").
 *  - A small kind chip (article / research / status).
 *  - Full-width title + body that flow naturally instead of being pinned
 *    to a fixed card height.
 *  - Media renders edge-to-edge (single image spans the whole width).
 *  - An even, three-button action bar: Like / Comment / Share (hugeicons),
 *    each taking the same share of the row.
 *
 * RTL/LTR notes:
 *  - Direction flows from the document locale, matching the rest of the
 *    hub. The action bar uses logical properties so it mirrors cleanly.
 *  - Relative-time labels come from `Intl.RelativeTimeFormat` in the
 *    active locale, so no hard-coded English strings remain.
 */

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  HeartIcon,
  Message01Icon,
  Share01Icon,
  BadgeCheckIcon,
  Stethoscope02Icon,
} from "@hugeicons/core-free-icons";
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
    createdAt?: string;
    isLiked?: boolean;
  };
  onLike?: (postId: string, currentlyLiked: boolean) => Promise<void>;
}

/** "5m ago" / "3h ago" / "2d ago", falling back to a short date. */
function timeAgo(iso: string | undefined, locale: string): string {
  try {
    if (!iso) return "";
    const date = new Date(iso);
    const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
    const rtf = new Intl.RelativeTimeFormat(locale === "ar" ? "ar" : "en", {
      numeric: "auto",
    });
    if (minutes < 1) return rtf.format(0, "minute");
    if (minutes < 60) return rtf.format(-minutes, "minute");
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return rtf.format(-hours, "hour");
    const days = Math.floor(hours / 24);
    if (days < 7) return rtf.format(-days, "day");
    return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return "";
  }
}

export function SocialPostCard({ post, onLike }: SocialPostCardProps) {
  const { t, locale } = useLanguage();
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(post.reactionsCount);

  const handleLike = async () => {
    if (!onLike) return;

    // Optimistic update
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : prev - 1));

    try {
      await onLike(post.id, nextLiked);
    } catch {
      // Rollback
      setLiked(!nextLiked);
      setLikesCount((prev) => (!nextLiked ? prev + 1 : prev - 1));
    }
  };

  const kindLabels: Record<string, string> = {
    article: t("doctor.kind.article"),
    research: t("doctor.kind.research"),
    status: t("doctor.kind.status"),
  };

  const when = timeAgo(post.createdAt, locale);
  const media = post.mediaUrls?.filter(Boolean) ?? [];

  return (
    <article
      data-testid="doctor-social-post"
      className="overflow-hidden rounded-2xl border border-emerald-500/15 bg-white/80 shadow-[0_2px_8px_rgba(4,47,46,0.05)] ring-1 ring-emerald-500/[0.06] backdrop-blur-xl transition-shadow hover:shadow-[0_10px_28px_-10px_rgba(4,47,46,0.18)] dark:bg-slate-900/70 dark:ring-white/[0.04]"
    >
      {/* Author header */}
      <header className="p-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 p-px">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-base font-bold text-emerald-700 dark:bg-slate-800 dark:text-emerald-300">
                {post.author.name?.[0] ?? "D"}
              </div>
            </div>
            <span className="absolute -bottom-0.5 -end-0.5 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-white shadow-sm">
              <HugeiconsIcon
                icon={BadgeCheckIcon}
                className="h-3 w-3"
                aria-hidden="true"
              />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-bold text-foreground">
                {post.author.name}
              </span>
              <HugeiconsIcon
                icon={BadgeCheckIcon}
                className="h-3.5 w-3.5 shrink-0 text-emerald-500"
                aria-hidden="true"
              />
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="truncate">{t("doctor.verified")}</span>
              {when && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="shrink-0">{when}</span>
                </>
              )}
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
            <HugeiconsIcon
              icon={Stethoscope02Icon}
              className="h-3 w-3"
              aria-hidden="true"
            />
            {kindLabels[post.kind] ?? post.kind}
          </span>
        </div>
      </header>

      {/* Body */}
      <div className="px-4 pb-4">
        {post.title && (
          <h3 className="text-base font-semibold leading-snug text-foreground">
            {post.title}
          </h3>
        )}
        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
          {post.content}
        </p>

        {media.length > 0 && (
          <div
            className={cn(
              "mt-3 overflow-hidden rounded-xl ring-1 ring-border/60",
              media.length === 1 ? "grid" : "grid grid-cols-2 gap-1.5"
            )}
          >
            {media.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt=""
                className={cn(
                  "w-full object-cover",
                  media.length === 1 ? "max-h-80 w-full" : "h-32 sm:h-40"
                )}
              />
            ))}
          </div>
        )}

        {post.tags && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
              .map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                >
                  #{tag}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="border-t border-border/50 px-2">
        <div className="flex items-stretch">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={cn(
              "h-11 flex-1 gap-1.5 rounded-none text-xs font-medium transition-colors hover:bg-emerald-500/10",
              liked ? "text-rose-500 hover:text-rose-600" : "text-muted-foreground"
            )}
            aria-pressed={liked}
          >
            <HugeiconsIcon
              icon={HeartIcon}
              className={cn("h-4 w-4", liked && "fill-current")}
              aria-hidden="true"
            />
            <span>{t("doctor.feed.like")}</span>
            {likesCount > 0 && <span className="tabular-nums">{likesCount}</span>}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-11 flex-1 gap-1.5 rounded-none text-xs font-medium text-muted-foreground transition-colors hover:bg-emerald-500/10"
          >
            <HugeiconsIcon icon={Message01Icon} className="h-4 w-4" aria-hidden="true" />
            <span>{t("doctor.feed.comment")}</span>
            {post.commentsCount > 0 && (
              <span className="tabular-nums">{post.commentsCount}</span>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-11 flex-1 gap-1.5 rounded-none text-xs font-medium text-muted-foreground transition-colors hover:bg-emerald-500/10"
          >
            <HugeiconsIcon icon={Share01Icon} className="h-4 w-4" aria-hidden="true" />
            <span>{t("doctor.feed.share")}</span>
          </Button>
        </div>
      </div>
    </article>
  );
}