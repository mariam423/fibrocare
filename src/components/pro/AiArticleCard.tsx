"use client";

/**
 * Card representation of a single AI-generated doctor article.
 *
 * Designed for the public Doctor Hub feed:
 *  - Compact, pixel-perfect spacing matches the rest of the site (uses
 *    the shared `Card` primitive, so hover lift and shadow are consistent
 *    with ResourceCard, DoctorContentFeed, etc.).
 *  - Shows the doctor signature, authority label, reading time, tags,
 *    and a short summary.
 *  - "Read article" opens a clean Markdown dialog with the full body.
 *
 * Mobile notes:
 *  - The footer (author + Read button) is allowed to wrap below the
 *    summary on narrow screens so the button is always reachable.
 *  - The dialog is full-screen on phones (`sm:` is the breakpoint where
 *    it becomes a centered modal) and respects iOS safe-area insets.
 *  - Markdown prose in the dialog uses larger leading on small screens
 *    for comfortable thumb-scrolling.
 */

import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  Stethoscope02Icon,
  BookOpen01Icon,
  CheckmarkBadge01Icon,
} from "@hugeicons/core-free-icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export interface AiArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  createdAt: string;
  authorName: string;
  authorTitle: string;
  authorityLabel: string;
  readingMinutes: number;
}

interface AiArticleCardProps {
  article: AiArticle;
  /** A short locale-specific label shown above the title (e.g. "New"). */
  badge?: string;
}

function formatDate(iso: string, locale: "en" | "ar"): string {
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toISOString().slice(0, 10);
  }
}

export function AiArticleCard({ article, badge }: AiArticleCardProps) {
  const { t, locale } = useLanguage();
  const [open, setOpen] = useState(false);

  const date = useMemo(
    () => formatDate(article.createdAt, locale === "ar" ? "ar" : "en"),
    [article.createdAt, locale]
  );

  // Tags minus the internal slug that we keep for de-duping.
  const visibleTags = useMemo(
    () => article.tags.filter((t) => !t.includes("-")),
    [article.tags]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Card
        size="sm"
        data-testid="ai-article-card"
        className="flex h-full flex-col"
      >
        <CardHeader>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            {badge && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary"
                data-testid="ai-article-badge"
              >
                <HugeiconsIcon
                  icon={CheckmarkBadge01Icon}
                  className="h-3 w-3"
                  aria-hidden="true"
                />
                {badge}
              </span>
            )}
            <span
              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              data-testid="ai-article-authority"
            >
              <HugeiconsIcon
                icon={Stethoscope02Icon}
                className="h-3 w-3"
                aria-hidden="true"
              />
              <span className="truncate">{article.authorityLabel}</span>
            </span>
            <span
              className="inline-flex shrink-0 items-center gap-1"
              data-testid="ai-article-reading"
            >
              <HugeiconsIcon
                icon={Clock01Icon}
                className="h-3 w-3"
                aria-hidden="true"
              />
              {/*
                Pin the number+unit to LTR so Arabic digits and the
                unit abbreviation keep the correct visual order inside
                the AR locale (the parent flows RTL).
              */}
              <span dir="ltr" className="tabular-nums">
                {article.readingMinutes} {t("doctor.aiLibrary.minutesShort")}
              </span>
            </span>
          </div>
          <CardTitle
            className="text-base leading-snug"
            data-testid="ai-article-title"
          >
            {article.title}
          </CardTitle>
          <CardDescription
            className="line-clamp-3"
            data-testid="ai-article-summary"
          >
            {article.summary}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3">
          {visibleTags.length > 0 && (
            <div
              className="flex flex-wrap gap-1.5"
              data-testid="ai-article-tags"
            >
              {visibleTags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {/*
            Footer: author + date on the left, "Read article" on the right.
            On narrow screens the row wraps so the button drops below the
            author line — keeps the touch target a comfortable 36px and
            stops the author text from being squeezed off the edge.
          */}
          <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
            <div
              className="min-w-0 text-[11px] text-muted-foreground"
              data-testid="ai-article-author"
            >
              <span className="font-medium text-foreground/80">
                {article.authorName}
              </span>
              <span className="mx-1">·</span>
              <span>{date}</span>
            </div>
            <DialogTrigger
              render={
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 w-full shrink-0 justify-center rounded-full px-4 text-xs sm:h-8 sm:w-auto sm:px-3"
                  data-testid="ai-article-read"
                />
              }
            >
              <HugeiconsIcon
                icon={BookOpen01Icon}
                className="me-1.5 h-3.5 w-3.5"
                aria-hidden="true"
              />
              {t("doctor.aiLibrary.read")}
            </DialogTrigger>
          </div>
        </CardContent>
      </Card>

      {/*
        Dialog: full-screen on mobile, centered modal on >= sm.
        max-h / max-w are inherited from the shared DialogContent
        primitive; we override width + height here and add iOS safe
        area insets for the body container.
      */}
      <DialogContent
        className={cn(
          // Mobile: full-screen sheet pinned to the top, with safe-area
          // padding so the close button and body clear the iOS home bar.
          "inset-0 top-0 left-0 max-h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 rounded-none p-0",
          "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[88vh] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:p-4"
        )}
      >
        <DialogHeader className="gap-3 border-b border-border px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] sm:border-0 sm:px-0 sm:pt-0">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <HugeiconsIcon
                icon={Stethoscope02Icon}
                className="h-3 w-3"
                aria-hidden="true"
              />
              <span className="truncate">{article.authorityLabel}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <HugeiconsIcon
                icon={Clock01Icon}
                className="h-3 w-3"
                aria-hidden="true"
              />
              {/*
                LTR pin keeps the number+unit visually ordered inside
                the AR locale; the parent dialog flows RTL.
              */}
              <span dir="ltr" className="tabular-nums">
                {article.readingMinutes} {t("doctor.aiLibrary.minutesShort")}
              </span>
            </span>
          </div>
          <DialogTitle className="text-lg leading-snug sm:text-xl">
            {article.title}
          </DialogTitle>
          <DialogDescription
            className={cn(
              "text-xs text-muted-foreground",
              "flex flex-wrap items-center gap-x-2 gap-y-1"
            )}
          >
            <span className="font-medium text-foreground/80">
              {article.authorName}
            </span>
            <span aria-hidden="true">·</span>
            <span>{article.authorTitle}</span>
            <span aria-hidden="true">·</span>
            <span>{date}</span>
          </DialogDescription>
        </DialogHeader>
        <div
          className="prose prose-base dark:prose-invert max-w-none px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-[15px] leading-7 sm:prose-sm sm:px-0 sm:pb-0 sm:text-sm sm:leading-relaxed"
          data-testid="ai-article-body"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content}
          </ReactMarkdown>
        </div>
      </DialogContent>
    </Dialog>
  );
}
