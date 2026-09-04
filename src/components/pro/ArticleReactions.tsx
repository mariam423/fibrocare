"use client";

/**
 * Reaction bar (like + helpful) for a single AI-generated Doctor Hub
 * article.
 *
 * The component is fully client-side and renders optimistically: when
 * the user clicks a reaction, the local count and "I reacted" state
 * flip immediately, then the server action `toggleArticleReaction` is
 * called. If the server call fails, the optimistic state is rolled
 * back and a localized error is shown. The signed-in state and
 * initial counts are passed in by the parent (a Server Component
 * that called `getArticleReactions`).
 *
 * The reactions are intentionally a small, low-friction signal —
 * a long-form comment field would invite moderation work that's
 * out of scope for this milestone. Both buttons are toggles, so
 * the same UI works for "I liked this" and "I unliked it".
 *
 * Mobile notes:
 *  - The two buttons are siblings on every viewport; on narrow
 *    screens they sit on a single row inside the card footer /
 *    dialog body.
 *  - Tap targets are 36px high (h-9) so they comfortably clear the
 *    32px accessibility threshold.
 *
 * RTL notes:
 *  - The bar uses `inline-flex` and inherits the document direction
 *    so the button order flips automatically under `dir="rtl"`.
 *  - The numeric badge inside each button is `tabular-nums` + `dir="ltr"`
 *    so "12" never gets visually reversed in the AR locale.
 */

import React, { useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ThumbsUpIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { toggleArticleReaction } from "@/app/pro/article-reaction-actions";

interface ArticleReactionsProps {
  postId: string;
  /** True when the user is signed in. When false, both buttons are
   *  disabled and the component renders read-only. */
  signedIn: boolean;
  initialLikes: number;
  initialHelpful: number;
  initialLiked: boolean;
  initialHelpfulChecked: boolean;
  /** Optional compact variant for the card footer; the dialog uses
   *  the default (with "Helpful" label). */
  variant?: "default" | "compact";
}

export function ArticleReactions({
  postId,
  signedIn,
  initialLikes,
  initialHelpful,
  initialLiked,
  initialHelpfulChecked,
  variant = "default",
}: ArticleReactionsProps) {
  const { t } = useLanguage();
  const [likes, setLikes] = useState(initialLikes);
  const [helpful, setHelpful] = useState(initialHelpful);
  const [liked, setLiked] = useState(initialLiked);
  const [helpfulChecked, setHelpfulChecked] = useState(initialHelpfulChecked);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (kind: "like" | "helpful") => {
    if (!signedIn || isPending) return;
    setError(null);
    // Optimistic update.
    if (kind === "like") {
      setLiked((prev) => !prev);
      setLikes((prev) => (liked ? Math.max(0, prev - 1) : prev + 1));
    } else {
      setHelpfulChecked((prev) => !prev);
      setHelpful((prev) => (helpfulChecked ? Math.max(0, prev - 1) : prev + 1));
    }
    startTransition(async () => {
      const result = await toggleArticleReaction(postId, kind);
      if (!result.success) {
        // Roll back the optimistic change.
        if (kind === "like") {
          setLiked((prev) => !prev);
          setLikes((prev) => (liked ? prev + 1 : Math.max(0, prev - 1)));
        } else {
          setHelpfulChecked((prev) => !prev);
          setHelpful((prev) => (helpfulChecked ? prev + 1 : Math.max(0, prev - 1)));
        }
        setError(result.error);
      }
    });
  };

  const compact = variant === "compact";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        compact ? "text-[11px]" : "text-xs"
      )}
      data-testid="article-reactions"
    >
      <button
        type="button"
        onClick={() => handleToggle("like")}
        disabled={!signedIn || isPending}
        aria-pressed={liked}
        aria-label={t("doctor.reactions.like")}
        data-testid="article-reaction-like"
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          liked
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border bg-background text-muted-foreground hover:bg-muted",
          (!signedIn || isPending) && "cursor-not-allowed opacity-60"
        )}
      >
        <HugeiconsIcon
          icon={ThumbsUpIcon}
          className={cn("h-3.5 w-3.5", liked && "fill-current")}
          aria-hidden="true"
        />
        <span className="whitespace-nowrap">
          {t("doctor.reactions.like")}
        </span>
        <span
          dir="ltr"
          className="ms-1 inline-flex min-w-4 justify-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
        >
          {likes}
        </span>
      </button>
      <button
        type="button"
        onClick={() => handleToggle("helpful")}
        disabled={!signedIn || isPending}
        aria-pressed={helpfulChecked}
        aria-label={t("doctor.reactions.helpful")}
        data-testid="article-reaction-helpful"
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
          helpfulChecked
            ? "border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            : "border-border bg-background text-muted-foreground hover:bg-muted",
          (!signedIn || isPending) && "cursor-not-allowed opacity-60"
        )}
      >
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          className="h-3.5 w-3.5"
          aria-hidden="true"
        />
        <span className="whitespace-nowrap">
          {t("doctor.reactions.helpful")}
        </span>
        <span
          dir="ltr"
          className="ms-1 inline-flex min-w-4 justify-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
        >
          {helpful}
        </span>
      </button>
      {!signedIn && (
        <span
          className="text-[10px] italic text-muted-foreground"
          data-testid="article-reactions-signin-hint"
        >
          {t("doctor.reactions.signInHint")}
        </span>
      )}
      {error && (
        <span
          className="text-[11px] text-destructive"
          data-testid="article-reactions-error"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
}
