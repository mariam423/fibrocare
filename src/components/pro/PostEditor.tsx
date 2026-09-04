"use client";

import React, { useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { createDoctorPost } from "@/app/pro/actions";

interface PostEditorProps {
  initialData?: {
    title: string;
    content: string;
    tags: string;
  };
  onSaved?: () => void;
}

export function PostEditor({ initialData, onSaved }: PostEditorProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [tags, setTags] = useState(initialData?.tags ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePublish = () => {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await createDoctorPost({ title, content, tags });
      if (result.success) {
        setSuccess(true);
        setTitle("");
        setContent("");
        setTags("");
        onSaved?.();
      } else {
        setError(result.error ?? "Failed to publish.");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? t("doctor.editPost") : t("doctor.newPost")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("doctor.postTitle")}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder={t("doctor.postTitlePlaceholder")}
            disabled={isPending}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("doctor.postContent")}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder={t("doctor.postContentPlaceholder")}
            disabled={isPending}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t("doctor.postTags")}</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder={t("doctor.postTagsPlaceholder")}
            disabled={isPending}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && (
          <p className="text-sm text-emerald-600">{t("doctor.postSubmitted")}</p>
        )}
        <div className="flex gap-3">
          <Button onClick={handlePublish} disabled={isPending || !title.trim() || !content.trim()}>
            {isPending ? (
              <HugeiconsIcon icon={Loading01Icon} className="me-2 h-4 w-4 animate-spin" />
            ) : null}
            {t("doctor.publish")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
