"use client";

import { useCallback, useRef, useState } from "react";
import { readUIMessageStream, type UIMessageChunk } from "ai";

export type AiStreamStatus = "idle" | "loading" | "done" | "error";

export interface AiStreamState {
  text: string;
  status: AiStreamStatus;
  /** True when the server reported no AI provider configured. */
  offline: boolean;
  error: string | null;
  stream: (url: string, body?: unknown) => Promise<void>;
  stop: () => void;
  reset: () => void;
}

/**
 * One-shot streaming helper for the AI feature routes.
 * Reads the AI SDK UI-message protocol directly so narration / reflection
 * can stream into existing cards without a full chat component.
 */
export function useAiStream(): AiStreamState {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<AiStreamStatus>("idle");
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Mirror of `text` for stable callbacks (the closure would otherwise
  // capture a stale initial value).
  const textRef = useRef("");

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setText("");
    textRef.current = "";
    setStatus("idle");
    setOffline(false);
    setError(null);
  }, []);

  const stream = useCallback(async (url: string, body?: unknown) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setText("");
    textRef.current = "";
    setOffline(false);
    setError(null);
    setStatus("loading");

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });

      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json") || !res.ok) {
        const data = await res.json().catch(() => null);
        const payload = data as { offline?: boolean; error?: string } | null;
        if (payload?.offline) {
          setOffline(true);
          setStatus("done");
          return;
        }
        setError(
          payload?.error ?? "The AI companion could not respond right now."
        );
        setStatus("error");
        return;
      }

      if (!res.body) {
        setError("The AI companion could not respond right now.");
        setStatus("error");
        return;
      }

      const uiStream = readUIMessageStream({
        stream: res.body as unknown as ReadableStream<UIMessageChunk>,
      });
      for await (const message of uiStream) {
        const parts = (message.parts ?? []) as Array<{
          type: string;
          text?: string;
        }>;
        const full = parts
          .filter((p) => p.type === "text" && typeof p.text === "string")
          .map((p) => p.text as string)
          .join("");
        if (full) {
          textRef.current = full;
          setText(full);
        }
      }
      setStatus("done");
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        // User pressed Stop: keep any partial text visible, otherwise return
        // to idle so the trigger button reappears.
        setStatus(textRef.current ? "done" : "idle");
        return;
      }
      console.error("AI stream failed", err);
      setError("The AI companion could not respond right now.");
      setStatus("error");
    }
  }, []);

  return { text, status, offline, error, stream, stop, reset };
}
