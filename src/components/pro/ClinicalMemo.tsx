"use client";

import React, { useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiMagicIcon, Loading01Icon, ClipboardIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { generateClinicalSummary } from "@/app/pro/actions";

interface ClinicalMemoProps {
  consultationId: string;
}

export function ClinicalMemo({ consultationId }: ClinicalMemoProps) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState<{
    overview: string;
    painSummary: string;
    medicationSummary: string;
    symptomSummary: string;
    keyConcerns: string[];
    suggestedFocus: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      const result = await generateClinicalSummary(consultationId);
      if (result.success && result.data) {
        setSummary(result.data);
      } else {
        setError(result.error ?? "Failed to generate summary.");
      }
    });
  };

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <HugeiconsIcon icon={ClipboardIcon} className="h-4 w-4 text-amber-600" />
          {t("consultation.clinicalMemo")}
        </CardTitle>
        <CardDescription className="text-xs">
          {t("consultation.clinicalSummaryDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!summary && !isPending && (
          <Button size="sm" variant="outline" onClick={handleGenerate}>
            <HugeiconsIcon icon={AiMagicIcon} className="me-1.5 h-3.5 w-3.5" />
            {t("consultation.clinicalSummary")}
          </Button>
        )}
        {isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" />
            Generating clinical summary…
          </div>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
        {summary && (
          <div className="space-y-3 text-sm">
            <p className="font-medium text-foreground">{summary.overview}</p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p><span className="font-medium text-foreground">Pain:</span> {summary.painSummary}</p>
              <p><span className="font-medium text-foreground">Medications:</span> {summary.medicationSummary}</p>
              <p><span className="font-medium text-foreground">Symptoms:</span> {summary.symptomSummary}</p>
            </div>
            {summary.keyConcerns.length > 0 && (
              <div>
                <p className="text-xs font-medium text-foreground">Key Concerns:</p>
                <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                  {summary.keyConcerns.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs italic text-muted-foreground">
              <span className="font-medium">Suggested focus:</span> {summary.suggestedFocus}
            </p>
            <p className="text-[10px] italic text-muted-foreground/70">
              {t("consultation.aiDisclaimer")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
