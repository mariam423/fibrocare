"use client";

import { useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PenTool01Icon,
  StopIcon,
  HeartPulseIcon,
} from "@hugeicons/core-free-icons";
import { useAiStream } from "@/components/ai/useAiStream";
import { AiMarkdown } from "@/components/ai/AiMarkdown";
import { useLanguage } from "@/context/LanguageContext";

/**
 * "Reflect with AI" — an empathetic, streamed reflection on the user's
 * journal note, placed right under the check-in notes box.
 */
export function AiReflection({ note }: { note: string }) {
  const { text, status, offline, error, stream, stop, reset } = useAiStream();
  const { t } = useLanguage();

  const handleReflect = useCallback(() => {
    void stream("/api/ai/reflect", { note: note.trim() });
  }, [note, stream]);

  const canReflect = note.trim().length >= 5;
  const loading = status === "loading";

  if (!canReflect && status === "idle") return null;

  return (
    <div className="mt-3">
      {status === "idle" && canReflect && (
        <button
          type="button"
          onClick={handleReflect}
          className="inline-flex items-center gap-1.5 rounded-full border border-violet-300/40 bg-violet-500/10 px-3.5 py-1.5 text-xs font-medium text-violet-600 transition-all hover:-translate-y-0.5 hover:bg-violet-500/15 hover:shadow-[0_4px_14px_-4px_rgba(139,92,246,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-violet-300"
        >
          <HugeiconsIcon icon={PenTool01Icon} className="h-3.5 w-3.5" aria-hidden="true" />
          {t("reflection.button")}
        </button>
      )}

      {loading && (
        <button
          type="button"
          onClick={stop}
          className="inline-flex items-center gap-1.5 rounded-full border border-rose-300/40 bg-rose-500/10 px-3.5 py-1.5 text-xs font-medium text-rose-500 transition-colors hover:bg-rose-500/20"
        >
          <HugeiconsIcon icon={StopIcon} className="h-3.5 w-3.5" aria-hidden="true" />
          {t("reflection.stop")}
        </button>
      )}

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 space-y-2 rounded-xl border border-border bg-card/60 p-4 dark:border-white/10 dark:bg-background/40 dark:backdrop-blur-xl"
            role="status"
            aria-label={t("reflection.generatingAria")}
          >
            <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-200/70 dark:bg-slate-700/50" />
            <div className="h-3.5 w-full animate-pulse rounded bg-slate-200/70 dark:bg-slate-700/50" />
            <div className="h-3.5 w-[88%] animate-pulse rounded bg-slate-200/70 dark:bg-slate-700/50" />
          </motion.div>
        )}

        {status === "done" && text && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 rounded-xl border border-violet-200/50 bg-gradient-to-br from-violet-500/[0.06] to-transparent p-4 dark:border-violet-400/20"
          >
            <div className="mb-2 flex items-center gap-2">
              <HugeiconsIcon
                icon={HeartPulseIcon}
                className="h-4 w-4 text-violet-500 dark:text-violet-300"
                aria-hidden="true"
              />
              <p className="text-xs font-semibold text-violet-600 dark:text-violet-300">
                {t("reflection.resultLabel")}
              </p>
              <button
                type="button"
                onClick={reset}
                aria-label={t("reflection.dismissAria")}
                className="ml-auto rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M2 2l10 10M12 2L2 12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="text-sm leading-relaxed text-foreground">
              <AiMarkdown text={text} />
            </div>
          </motion.div>
        )}

        {offline && (
          <p className="mt-3 text-xs text-muted-foreground">
            {t("reflection.offline")}
          </p>
        )}

        {error && (
          <p role="alert" className="mt-3 text-xs text-rose-500">
            {error}
          </p>
        )}
      </AnimatePresence>
    </div>
  );
}
