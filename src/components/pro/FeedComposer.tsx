"use client";

/**
 * The Doctor Hub composer — a social-feed-style "What's on your mind?"
 * bar at the top of the feed column.
 *
 * Closed state: a compact bar (avatar + placeholder pill) that matches
 * the feed's native look.
 * Open state (or when an AI-generated draft is handed in via
 * `initialData`): the full `PostEditor`, next to the "نشر مقال أو بحث"
 * flow.
 *
 * The wrapper keeps the `doctor-manual-publishing` / `doctor-manual-toggle`
 * testids that the manual-publishing e2e interacts with, so the editor's
 * inputs (`doctor-post-title`, etc.) appear after the toggle is clicked.
 */

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit01Icon, Stethoscope02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { PostEditor } from "./PostEditor";

interface FeedComposerProps {
  /** Pre-filled editor values — typically an AI-generated draft. */
  initialData?: { title: string; content: string; tags: string };
  onSaved?: () => void;
}

export function FeedComposer({ initialData, onSaved }: FeedComposerProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const expanded = open || Boolean(initialData);

  if (expanded) {
    return (
      <div data-testid="doctor-manual-publishing">
        <PostEditor
          initialData={initialData}
          onSaved={() => {
            setOpen(false);
            onSaved?.();
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-emerald-500/15 bg-white/80 p-3 shadow-sm ring-1 ring-emerald-500/[0.06] backdrop-blur-xl"
      data-testid="doctor-manual-publishing"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 p-px">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-emerald-700 dark:bg-slate-800 dark:text-emerald-300">
            <HugeiconsIcon icon={Stethoscope02Icon} className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpen(true)}
          className="h-11 flex-1 justify-start rounded-full border border-border/70 bg-muted/40 px-4 text-sm font-normal text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
          data-testid="doctor-manual-toggle"
        >
          <HugeiconsIcon
            icon={PencilEdit01Icon}
            className="me-2 h-4 w-4 shrink-0 text-emerald-500"
            aria-hidden="true"
          />
          <span className="truncate">{t("doctor.composerPlaceholder")}</span>
        </Button>
      </div>
    </div>
  );
}