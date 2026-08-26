"use client";

import React, { useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiMagicIcon, Loading01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { structureSymptoms } from "@/app/pro/actions";

interface PatientAssistantProps {
  consultationId: string;
  onStructured: (structured: {
    structuredMessage: string;
    categories: { label: string; details: string }[];
    suggestedQuestions: string[];
  }) => void;
}

export function PatientAssistant({ onStructured }: PatientAssistantProps) {
  const { t } = useLanguage();
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleStructure = () => {
    if (!input.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await structureSymptoms(input);
      if (result.success && result.data) {
        onStructured(result.data);
        setInput("");
      } else {
        setError(result.error ?? "Failed to structure symptoms.");
      }
    });
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <HugeiconsIcon icon={AiMagicIcon} className="h-4 w-4 text-primary" />
          {t("consultation.symptomHelper")}
        </CardTitle>
        <CardDescription className="text-xs">
          {t("consultation.symptomHelperDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("consultation.symptomPlaceholder")}
          dir="auto"
          className="min-h-[80px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          disabled={isPending}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <p className="text-[11px] text-muted-foreground italic">
          {t("consultation.aiDisclaimer")}
        </p>
        <Button
          size="sm"
          onClick={handleStructure}
          disabled={isPending || !input.trim()}
        >
          {isPending ? (
            <HugeiconsIcon icon={Loading01Icon} className="me-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <HugeiconsIcon icon={AiMagicIcon} className="me-1.5 h-3.5 w-3.5" />
          )}
          {t("consultation.symptomHelper")}
        </Button>
      </CardContent>
    </Card>
  );
}
