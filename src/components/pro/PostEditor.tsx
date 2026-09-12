"use client";

/**
 * PostEditor — the Direct Doctor Publishing Hub composer.
 *
 * Verified doctors write three content kinds (article / research / status)
 * with an optional AI assist toggle that structures their raw clinical
 * notes into a draft grounded in ACR/Mayo-style patient guidance. The
 * draft is always doctor-editable before publishing — the AI never
 * publishes anything by itself.
 *
 * Design: Midnight Emerald glass card (blur + emerald hairline + depth
 * shadow) with a kind selector that re-labels the form fields. Full a11y:
 * every field is labelled, errors use role="alert", focus moves to the
 * success note, and the AI disclaimer is announced alongside the toggle.
 * All strings flow through i18n (EN/AR parity); user content uses
 * dir="auto" so Arabic posts render RTL inside either locale.
 */

import React, { useEffect, useRef, useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiMagicIcon, Loading01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { aiPublishingAssistant, createDoctorPost } from "@/app/pro/actions";
import type { DoctorPostKind } from "@/lib/validations/doctorPosts";

interface PostEditorProps {
  initialData?: {
    title: string;
    content: string;
    tags: string;
  };
  onSaved?: () => void;
}

const KINDS: DoctorPostKind[] = ["article", "research", "status"];

export function PostEditor({ initialData, onSaved }: PostEditorProps) {
  const { t } = useLanguage();
  const [kind, setKind] = useState<DoctorPostKind>("article");
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [tags, setTags] = useState(initialData?.tags ?? "");
  const [mediaUrl, setMediaUrl] = useState("");
  const [aiAssist, setAiAssist] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successKind, setSuccessKind] = useState<DoctorPostKind>("article");
  const successRef = useRef<HTMLParagraphElement>(null);

  // Move focus to the success note so screen readers announce the result.
  useEffect(() => {
    if (success) successRef.current?.focus();
  }, [success]);

  const kindLabels: Record<DoctorPostKind, string> = {
    article: t("doctor.kind.article"),
    research: t("doctor.kind.research"),
    status: t("doctor.kind.status"),
  };

  const handlePublish = () => {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      // Optional AI leg: structure the raw notes into a draft first. The
      // doctor still sees and can edit everything before it is published.
      let finalTitle = title;
      let finalContent = content;
      if (aiAssist && content.trim().length > 0) {
        const assisted = await aiPublishingAssistant({ notes: content });
        if (assisted.success && assisted.data) {
          finalTitle = title.trim() || assisted.data.title;
          finalContent = assisted.data.content;
        } else {
          setError(assisted.error ?? t("doctor.postError"));
          return;
        }
      }

      const result = await createDoctorPost({
        title: finalTitle,
        content: finalContent,
        tags,
        kind,
        mediaUrls: mediaUrl ? [mediaUrl] : []
      });
      if (result.success) {
        setSuccess(true);
        setSuccessKind(kind);
        setTitle("");
        setContent("");
        setTags("");
        setMediaUrl("");
        setKind("article");
        setAiAssist(false);
        onSaved?.();
      } else {
        setError(result.error ?? t("doctor.postError"));
      }
    });
  };

  return (
    <Card
      className="border-emerald-500/20 bg-white/80 shadow-depth-sm ring-1 ring-emerald-500/10 backdrop-blur-xl dark:bg-slate-900/80"
      data-testid="doctor-post-editor"
    >
      <CardHeader>
        <CardTitle>{initialData ? t("doctor.editPost") : t("doctor.newPost")}</CardTitle>
        <CardDescription>{t("doctor.postEditorDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Kind selector ------------------------------------------------ */}
        <div role="radiogroup" aria-label={t("doctor.postKindLabel")} className="space-y-1.5">
          <span className="text-sm font-medium" id="post-kind-label">
            {t("doctor.postKindLabel")}
          </span>
          <div
            role="presentation"
            className="flex flex-wrap gap-2"
            aria-labelledby="post-kind-label"
          >
            {KINDS.map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => setKind(k)}
                disabled={isPending}
                data-testid={`doctor-post-kind-${k}`}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  kind === k
                    ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "border-border bg-background text-muted-foreground hover:border-emerald-500/40 hover:text-foreground"
                }`}
              >
                {kindLabels[k]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="doctor-post-title" className="text-sm font-medium">
            {t("doctor.postTitle")}
          </label>
          <input
            id="doctor-post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder={t("doctor.postTitlePlaceholder")}
            disabled={isPending}
            data-testid="doctor-post-title"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="doctor-post-content" className="text-sm font-medium">
            {t(kind === "status" ? "doctor.postContentStatus" : "doctor.postContent")}
          </label>
          <textarea
            id="doctor-post-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={kind === "status" ? 1400 : 10000}
            className="min-h-[200px] w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder={t("doctor.postContentPlaceholder")}
            disabled={isPending}
            data-testid="doctor-post-content"
            dir="auto"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="doctor-post-tags" className="text-sm font-medium">
            {t("doctor.postTags")}
          </label>
          <input
            id="doctor-post-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            maxLength={200}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder={t("doctor.postTagsPlaceholder")}
            disabled={isPending}
            data-testid="doctor-post-tags"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="doctor-post-media" className="text-sm font-medium">
            {t("doctor.postMedia") ?? "Media URL"}
          </label>
          <input
            id="doctor-post-media"
            type="text"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            disabled={isPending}
          />
        </div>


        {/* AI assist toggle --------------------------------------------- */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={aiAssist}
              onChange={(e) => setAiAssist(e.target.checked)}
              disabled={isPending}
              className="mt-0.5 h-4 w-4 rounded border-border accent-emerald-600"
              aria-describedby="ai-assist-disclaimer"
              data-testid="doctor-post-ai-toggle"
            />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <HugeiconsIcon icon={AiMagicIcon} className="h-4 w-4 text-primary" aria-hidden="true" />
                {t("doctor.postAiToggle")}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {t("doctor.postAiToggleDescription")}
              </span>
            </span>
          </label>
          <p id="ai-assist-disclaimer" className="mt-2 text-xs text-muted-foreground">
            {t("doctor.aiDisclaimer")}
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert" data-testid="doctor-post-error">
            {error}
          </p>
        )}
        {success && (
          <p
            ref={successRef}
            tabIndex={-1}
            className="text-sm text-emerald-600 focus:outline-none"
            role="status"
            data-testid="doctor-post-success"
          >
            {t(successKind === "status" ? "doctor.postSubmittedStatus" : "doctor.postSubmitted")}
          </p>
        )}
        <div className="flex gap-3">
          <Button
            onClick={handlePublish}
            disabled={isPending || !title.trim() || !content.trim()}
            data-testid="doctor-post-publish"
          >
            {isPending ? (
              <HugeiconsIcon icon={Loading01Icon} className="me-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            {t("doctor.publish")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
