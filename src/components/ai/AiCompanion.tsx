"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useReducedMotion, AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChatBotIcon,
  StopIcon,
  SparklesIcon,
  ArrowUp02Icon,
  CheckmarkCircle01Icon,
  HeartPulseIcon,
} from "@hugeicons/core-free-icons";
import { AiMarkdown } from "@/components/ai/AiMarkdown";
import {
  providerDisplayName,
  useAiStatus,
} from "@/context/AiStatusContext";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import {
  EMPTY_USER_FACTS,
  loadUserFacts,
  recordConversationTurn,
  type UserFacts,
} from "@/lib/ai/memory/userMemory";

interface UiPart {
  type?: string;
  text?: string;
  toolInvocation?: { state?: string; toolName?: string };
}

function getMessageText(parts: UiPart[] | undefined): string {
  if (Array.isArray(parts)) {
    return parts
      .filter((p) => p.type === "text" && typeof p.text === "string")
      .map((p) => p.text as string)
      .join("");
  }
  return "";
}

/** Has a resolved tool part (e.g. the companion checked live data). */
function hasToolResult(parts: UiPart[] | undefined): boolean {
  return Array.isArray(parts)
    ? parts.some(
        (p) => p.type === "tool-invocation" && p.toolInvocation?.state === "result"
      )
    : false;
}

export function AiCompanion() {
  const reduceMotion = useReducedMotion();
  const { t, locale } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const SUGGESTIONS = [
    t("companion.suggestion1"),
    t("companion.suggestion2"),
    t("companion.suggestion3"),
  ];

  // Live vs offline companion mode — shared with the header badge via
  // AiStatusContext (single getAiStatus() fetch for the whole app).
  const { status: aiStatus } = useAiStatus();
  const aiConfigured = aiStatus?.configured ?? null;
  const mockMode = aiStatus?.mock ?? false;
  const providerName = !aiStatus
    ? ""
    : aiStatus.mock
      ? "Mock mode"
      : providerDisplayName(aiStatus.provider);

  // AI SDK v7: useChat() with no options uses the default HttpChatTransport
  // pointed at /api/chat. Input is managed locally.
  //
  // Memory Layer (client side): durable patient facts live encrypted in
  // localStorage (AES-GCM via security/crypto.ts). They ride to the API in
  // each send's request body — re-validated server-side before touching a
  // prompt — and grow after every completed answer.
  const [userFacts, setUserFacts] = useState<UserFacts>(EMPTY_USER_FACTS);

  useEffect(() => {
    let cancelled = false;
    loadUserFacts()
      .then((facts) => {
        if (!cancelled) setUserFacts(facts);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const { messages, sendMessage, stop, status, error, clearError } = useChat();

  const isLoading = status === "submitted" || status === "streaming";
  const isOffline = aiConfigured === false;

  // After each completed answer, learn any new durable facts from what the
  // user just said (deterministic extraction + encrypted save).
  const lastStatusRef = useRef(status);
  useEffect(() => {
    const previous = lastStatusRef.current;
    lastStatusRef.current = status;
    if (previous !== "streaming" || status !== "ready") return;
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const text = getMessageText(lastUser?.parts as UiPart[] | undefined);
    if (!text) return;
    recordConversationTurn(text)
      .then(setUserFacts)
      .catch(() => {});
  }, [status, messages]);

  // Keep the newest message in view while streaming.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [messages.length, isLoading, reduceMotion]);

  // Move focus into the dialog when opened; restore it to the launcher on
  // close. Close on Escape.
  useEffect(() => {
    if (open) {
      const focusTimer = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(focusTimer);
    }
    launcherRef.current?.focus();
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const submitSuggestion = useCallback(
    (prompt: string) => {
      if (aiConfigured !== true || isLoading) return;
      // locale rides the body so the server prompt isolates output language.
      void sendMessage({ text: prompt }, { body: { userFacts, locale } });
    },
    [aiConfigured, isLoading, sendMessage, userFacts, locale]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const value = input.trim();
      if (!value || aiConfigured !== true || isLoading) return;
      setInput("");
      clearError();
      void sendMessage({ text: value }, { body: { userFacts, locale } });
    },
    [input, aiConfigured, isLoading, sendMessage, clearError, userFacts, locale]
  );

  const lastAssistantIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return i;
    }
    return -1;
  }, [messages]);

  const showSuggestions = messages.length === 0 && !isOffline;

  return (
    <>
      {/* Launcher */}
      <div className="fixed bottom-5 end-5 z-[70] sm:bottom-6 sm:end-6">
        <AnimatePresence>
          {!open && (
            <motion.button
              ref={launcherRef}
              type="button"
              onClick={() => setOpen(true)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={
                reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 22 }
              }
              aria-label={t("companion.openAria")}
              className={cn(
                "relative flex h-14 w-14 items-center justify-center rounded-full",
                "bg-gradient-to-br from-primary via-primary/90 to-violet-600 text-white",
                "shadow-[0_8px_32px_-6px_rgba(59,107,72,0.55)] hover:shadow-[0_10px_40px_-6px_rgba(139,92,246,0.6)]",
                "transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            >
              {!reduceMotion && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/30 [animation-duration:2.4s]"
                />
              )}
              <HugeiconsIcon icon={ChatBotIcon} className="h-6 w-6" aria-hidden="true" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={t("companion.dialogAria")}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-24 end-4 z-[70] flex h-[min(34rem,calc(100dvh-8.5rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Aurora wash */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/20 via-violet-400/15 to-transparent blur-3xl"
            />

            {/* Header */}
            <header className="relative flex items-center gap-3 border-b border-border px-4 py-3.5">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-white shadow-[0_4px_16px_-4px_rgba(59,107,72,0.6)]">
                <HugeiconsIcon icon={HeartPulseIcon} className="h-5 w-5" aria-hidden="true" />
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900",
                    isOffline ? "bg-slate-400" : "bg-emerald-400"
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-foreground">
                  {t("companion.title")}
                </h2>
                <p className="truncate text-xs text-muted-foreground">
                  {aiConfigured === null
                    ? t("companion.waking")
                    : isOffline
                      ? t("companion.offlineBadge")
                      : mockMode
                        ? t("companion.liveSimulated", { provider: providerName || "mock" })
                        : t("companion.liveRag")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("companion.closeAria")}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M2 2l10 10M12 2L2 12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </header>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="relative flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-violet-500/10 ring-1 ring-primary/20">
                    <HugeiconsIcon
                      icon={ChatBotIcon}
                      className="h-6 w-6 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="max-w-[16rem] text-sm text-muted-foreground">
                    {t("companion.hello")}
                  </p>
                  {showSuggestions && (
                    <div className="mt-1 flex flex-col gap-2">
                      {SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => submitSuggestion(suggestion)}
                          disabled={isLoading}
                          className="rounded-full border border-border bg-muted/60 px-3.5 py-2 text-xs font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-primary/5 disabled:opacity-50"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  {isOffline && (
                    <p className="max-w-[16rem] text-xs text-muted-foreground/80">
                      <KeyHint text={t("companion.offlineHint")} />
                    </p>
                  )}
                  {mockMode && (
                    <p className="max-w-[16rem] text-xs text-muted-foreground/80">
                      <KeyHint text={t("companion.mockHint")} />
                    </p>
                  )}
                </div>
              )}

              {messages.map((message, index) => {
                const isUser = message.role === "user";
                const parts = (message.parts ?? []) as UiPart[];
                const text = getMessageText(parts);
                const isLast = index === lastAssistantIndex;
                const streaming = isLoading && isLast && !isUser;

                return (
                  <div
                    key={message.id}
                    className={cn("flex", isUser ? "justify-end" : "justify-start")}
                  >
                    {!isUser && (
                      <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-violet-500/10 ring-1 ring-primary/20">
                        <HugeiconsIcon
                          icon={ChatBotIcon}
                          className="h-3.5 w-3.5 text-primary"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        isUser
                          ? "rounded-br-md bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-[0_4px_16px_-6px_rgba(59,107,72,0.5)]"
                          : "rounded-bl-md border border-border bg-muted/60 text-foreground"
                      )}
                    >
                      {hasToolResult(parts) && !text && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <HugeiconsIcon
                            icon={CheckmarkCircle01Icon}
                            className="h-3.5 w-3.5 text-emerald-500"
                            aria-hidden="true"
                          />
                          {t("companion.checkedData")}
                        </span>
                      )}
                      {text ? (
                        <AiMarkdown text={text} />
                      ) : streaming ? (
                        <span className="flex flex-col gap-1.5">
                          <StreamingCaret reduceMotion={reduceMotion ?? false} />
                          <span className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <HugeiconsIcon
                              icon={SparklesIcon}
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-pulse text-primary"
                              aria-hidden="true"
                            />
                            {t("companion.retrieving")}
                          </span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}

              {error && (
                <p className="text-xs text-rose-500" role="alert">
                  {error.message ?? t("companion.errorDefault")}
                </p>
              )}
            </div>

            {/* Screen-reader status: announcements live here, not on the
                message list, so streaming deltas don't re-announce history. */}
            <p aria-live="polite" className="sr-only">
              {isLoading ? t("companion.responding") : ""}
            </p>

            {/* Input */}
            <footer className="relative border-t border-border p-3">
              {isOffline ? (
                <p className="flex items-center justify-center gap-2 px-2 py-2.5 text-center text-xs text-muted-foreground">
                  <HugeiconsIcon
                    icon={SparklesIcon}
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  {t("companion.offlinePaused")}
                </p>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="flex items-end gap-2"
                  aria-label={t("companion.chatFormAria")}
                >
                  <label htmlFor="companion-input" className="sr-only">
                    {t("companion.inputLabel")}
                  </label>
                  <input
                    id="companion-input"
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t("companion.inputPlaceholder")}
                    disabled={isLoading || aiConfigured !== true}
                    className="min-h-11 flex-1 rounded-2xl border border-border bg-muted/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
                  />
                  {isLoading ? (
                    <button
                      type="button"
                      onClick={stop}
                      aria-label={t("companion.stopAria")}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 transition-colors hover:bg-rose-500/20"
                    >
                      <HugeiconsIcon icon={StopIcon} className="h-5 w-5" aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={input.trim().length === 0}
                      aria-label={t("companion.sendAria")}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-white shadow-[0_4px_16px_-6px_rgba(59,107,72,0.6)] transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:hover:brightness-100 disabled:active:scale-100"
                    >
                      <HugeiconsIcon icon={ArrowUp02Icon} className="h-5 w-5" aria-hidden="true" />
                    </button>
                  )}
                </form>
              )}
            </footer>

            {/* Loading shimmer strip while waiting for first tokens */}
            {isLoading && (
              <div className="relative h-0.5 overflow-hidden bg-transparent">
                <motion.div
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
                  animate={reduceMotion ? {} : { x: ["-100%", "340%"] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                  aria-hidden="true"
                />
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

/** Renders a hint string, styling the GEMINI_API_KEY token as a code chip. */
function KeyHint({ text }: { text: string }) {
  const parts = text.split("GEMINI_API_KEY");
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
              GEMINI_API_KEY
            </code>
          )}
        </Fragment>
      ))}
    </>
  );
}

function StreamingCaret({ reduceMotion }: { reduceMotion: boolean }) {
  if (reduceMotion) {
    return <span className="text-muted-foreground">…</span>;
  }
  return (
    <motion.span
      aria-hidden="true"
      className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 rounded-full bg-primary"
      animate={{ opacity: [1, 0.2, 1] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
