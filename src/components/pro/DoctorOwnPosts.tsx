"use client";

/**
 * Lists the signed-in doctor's own posts (any verified status). The
 * "AI articles" library and the public Doctor Hub only surface verified
 * posts; this view is the doctor's editorial workspace, so they need to
 * see their pending drafts and rejected posts too.
 *
 * Mobile notes:
 *  - Each post card stacks vertically on phones; on >= sm the meta row
 *    (status badge + date) sits inline with the title.
 *  - Tag chips wrap to a new line on narrow screens so the body summary
 *    is never pushed off the edge.
 *
 * RTL notes:
 *  - The meta row uses logical margin (`ms-2`) so it stays on the
 *    correct side in both directions.
 *  - No hard-coded English strings remain.
 */

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Loading01Icon,
  PencilEdit01Icon,
  Time01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { PostEditor } from "./PostEditor";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/translations";

export interface DoctorOwnPost {
  id: string;
  title: string;
  content: string;
  tags: string;
  verifiedStatus: string;
  createdAt: Date | string;
  author: { id: string; name: string | null };
}

interface DoctorOwnPostsProps {
  posts: DoctorOwnPost[];
  onChanged?: () => void;
}

const STATUS_KEYS: Record<string, TranslationKey> = {
  verified: "doctor.verified",
  published: "doctor.verified",
  pending: "doctor.pending",
  rejected: "doctor.rejected",
};

const STATUS_TONE: Record<string, string> = {
  verified: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  published: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  rejected: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

function formatDate(iso: Date | string, locale: "en" | "ar"): string {
  try {
    const d = typeof iso === "string" ? new Date(iso) : iso;
    return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return typeof iso === "string" ? iso.slice(0, 10) : "";
  }
}

export function DoctorOwnPosts({ posts, onChanged }: DoctorOwnPostsProps) {
  const { t, locale } = useLanguage();
  const [editing, setEditing] = useState<DoctorOwnPost | null>(null);

  if (posts.length === 0 && !editing) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          {t("doctor.noPosts")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-testid="doctor-own-posts">
      {editing && (
        <PostEditor
          initialData={{
            title: editing.title,
            content: editing.content,
            tags: editing.tags,
          }}
          onSaved={() => {
            setEditing(null);
            onChanged?.();
          }}
        />
      )}

      {posts.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {posts.map((post) => {
            const statusKey = STATUS_KEYS[post.verifiedStatus] ?? "doctor.pending";
            const tone = STATUS_TONE[post.verifiedStatus] ?? STATUS_TONE.pending;
            const date = formatDate(post.createdAt, locale === "ar" ? "ar" : "en");
            return (
              <Card key={post.id} className="h-full">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-muted-foreground">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                        tone
                      )}
                      data-testid="doctor-own-status"
                    >
                      {post.verifiedStatus === "verified" || post.verifiedStatus === "published" ? (
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          className="h-3 w-3"
                          aria-hidden="true"
                        />
                      ) : post.verifiedStatus === "rejected" ? (
                        <HugeiconsIcon
                          icon={Loading01Icon}
                          className="h-3 w-3"
                          aria-hidden="true"
                        />
                      ) : (
                        <HugeiconsIcon
                          icon={Time01Icon}
                          className="h-3 w-3"
                          aria-hidden="true"
                        />
                      )}
                      {t(statusKey)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{date}</span>
                  </div>
                  <CardTitle className="text-base leading-snug">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.content.slice(0, 200)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {post.tags && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {post.tags
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                        .map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 w-full justify-center rounded-full text-xs sm:h-8 sm:w-auto sm:px-3"
                    onClick={() => setEditing(post)}
                    data-testid="doctor-own-edit"
                  >
                    <HugeiconsIcon
                      icon={PencilEdit01Icon}
                      className="me-1.5 h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                    {t("doctor.editPost")}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
