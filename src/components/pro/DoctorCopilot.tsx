"use client";

import React, { useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiMagicIcon, Loading01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { generateDoctorResponseDraft } from "@/app/pro/actions";

interface DoctorCopilotProps {
  consultationId: string;
  patientMessage: string;
  onUseDraft: (draft: string) => void;
}

export function DoctorCopilot({ consultationId, patientMessage, onUseDraft }: DoctorCopilotProps) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<{
    draft: string;
    keyPoints: string[];
    followUpQuestions: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      const result = await generateDoctorResponseDraft(consultationId, patientMessage);
      if (result.success && result.data) {
        setDraft(result.data);
      } else {
        setError(result.error ?? "Failed to generate draft.");
      }
    });
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <HugeiconsIcon icon={AiMagicIcon} className="h-4 w-4 text-primary" />
          {t("consultation.suggestedResponse")}
        </CardTitle>
        <CardDescription className="text-xs">
          {t("consultation.aiDraftDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!draft && !isPending && (
          <Button size="sm" variant="outline" onClick={handleGenerate}>
            <HugeiconsIcon icon={AiMagicIcon} className="me-1.5 h-3.5 w-3.5" />
            {t("consultation.aiDraft")}
          </Button>
        )}
        {isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" />
            Generating draft response…
          </div>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
        {draft && (
          <div className="space-y-3">
            <div className="rounded-xl bg-background p-3 text-sm whitespace-pre-wrap">
              {draft.draft}
            </div>
            {draft.keyPoints.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <p className="font-medium">Key points:</p>
                <ul className="mt-1 space-y-0.5">
                  {draft.keyPoints.map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              </div>
            )}
            {draft.followUpQuestions.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <p className="font-medium">Consider asking:</p>
                <ul className="mt-1 space-y-0.5">
                  {draft.followUpQuestions.map((q, i) => (
                    <li key={i}>• {q}</li>
                  ))}
                </ul>
              </div>
            )}
            <Button size="sm" onClick={() => onUseDraft(draft.draft)}>
              {t("consultation.useDraft")}
            </Button>
            <p className="text-[10px] italic text-muted-foreground/70">
              {t("consultation.aiDisclaimer")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
