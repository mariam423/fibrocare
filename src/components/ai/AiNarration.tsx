"use client";

import { useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SparklesIcon,
  StopIcon,
  ArtificialIntelligence04Icon,
} from "@hugeicons/core-free-icons";
import { useAiStream } from "@/components/ai/useAiStream";
import { AiMarkdown } from "@/components/ai/AiMarkdown";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * "Explain this in my words" — streams a warm, personalized narration of the
 * user's detected health patterns below the AI Care Insight card.
 */
export function AiNarration() {
  const { text, status, offline, error, stream, stop, reset } = useAiStream();
  const { t } = useLanguage();

  const handleExplain = useCallback(() => {
    void stream("/api/ai/insight");
  }, [stream]);

  const loading = status === "loading";

  return (
    <section
      aria-label={t("narration.title")}
      className="mb-6 rounded-2xl border border-dashed border-primary/25 bg-gradient-to-br from-primary/[0.04] to-violet-500/[0.04] overflow-visible px-4 pb-4"
    >
      <div className="h-auto min-h-fit py-3 px-4 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 overflow-visible rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-violet-500/10 ring-1 ring-primary/20">
            <HugeiconsIcon
              icon={ArtificialIntelligence04Icon}
              className="h-4 w-4 text-primary"
              aria-hidden="true"
            />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("narration.title")}
          </h3>
        </div>

        {status === "idle" && (
          <button
            type="button"
            onClick={handleExplain}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary transition-all hover:-translate-y-0.5 hover:bg-primary/15 hover:shadow-[0_4px_14px_-4px_rgba(59,107,72,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5" aria-hidden="true" />
            {t("narration.explain")}
          </button>
        )}

        {loading && (
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-1.5 rounded-full border border-rose-300/40 bg-rose-500/10 px-3.5 py-1.5 text-xs font-medium text-rose-500 transition-colors hover:bg-rose-500/20"
          >
            <HugeiconsIcon icon={StopIcon} className="h-3.5 w-3.5" aria-hidden="true" />
            {t("narration.stop")}
          </button>
        )}

        {status === "done" && (
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger
                render={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary transition-all hover:-translate-y-0.5 hover:bg-primary/15 hover:shadow-[0_4px_14px_-4px_rgba(59,107,72,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                }
              >
                  <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("narration.explain")}
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                  <DialogTitle>{t("narration.detailedAnalysisTitle") || "Detailed Patterns Analysis"}</DialogTitle>
                  <DialogDescription>
                    {t("narration.detailedAnalysisDesc") || "Here is a deeper dive into the patterns detected in your health logs."}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 text-center" dir="auto">
                  <p className="text-sm text-foreground leading-relaxed">
                    {t("narration.patternBody") || "Your patterns show a strong correlation between sleep quality and pain levels the following morning."}
                  </p>
                   <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground border border-border">
                    <strong className="block mb-1">{t("narration.aiObservationLabel") || "AI Observation"}:</strong> {t("narration.aiObservationText") || "Flare-ups typically occur 24-48 hours after high-stress events."}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              {t("narration.dismiss")}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 space-y-2.5"
            role="status"
            aria-label={t("narration.generatingAria")}
          >
            <div className="h-3.5 w-full animate-pulse rounded bg-muted-foreground/25" />
            <div className="h-3.5 w-[92%] animate-pulse rounded bg-muted-foreground/25" />
            <div className="h-3.5 w-[78%] animate-pulse rounded bg-muted-foreground/25" />
            <div className="h-3.5 w-[85%] animate-pulse rounded bg-muted-foreground/25" />
          </motion.div>
        )}

        {status === "done" && text && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "mt-4 rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground"
            )}
          >
            <AiMarkdown text={text} />
          </motion.div>
        )}

        {offline && (
          <motion.p
            key="offline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-sm text-muted-foreground"
          >
            {t("narration.offline")}
          </motion.p>
        )}

        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="alert"
            className="mt-4 text-sm text-rose-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}
