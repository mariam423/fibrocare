"use client";

import React, { useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiMagicIcon, Loading01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { aiPublishingAssistant } from "@/app/pro/actions";

interface AiPublishingAssistantProps {
  onArticleGenerated: (article: {
    title: string;
    content: string;
    tags: string[];
    summary: string;
  }) => void;
}

export function AiPublishingAssistant({ onArticleGenerated }: AiPublishingAssistantProps) {
  const { t } = useLanguage();
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!notes.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await aiPublishingAssistant(notes);
      if (result.success && result.data) {
        onArticleGenerated(result.data);
        setNotes("");
      } else {
        setError(result.error ?? "Failed to generate article.");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={AiMagicIcon} className="h-5 w-5 text-primary" />
          {t("doctor.aiAssist")}
        </CardTitle>
        <CardDescription>{t("doctor.aiAssistDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., New research on sleep hygiene for fibromyalgia patients…"
          className="min-h-[120px] w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          disabled={isPending}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground italic">
          {t("doctor.aiDisclaimer")}
        </p>
        <Button
          onClick={handleGenerate}
          disabled={isPending || !notes.trim()}
          className="w-full"
        >
          {isPending ? (
            <>
              <HugeiconsIcon icon={Loading01Icon} className="me-2 h-4 w-4 animate-spin" />
              {t("doctor.aiGenerating")}
            </>
          ) : (
            <>
              <HugeiconsIcon icon={AiMagicIcon} className="me-2 h-4 w-4" />
              {t("doctor.aiAssist")}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
