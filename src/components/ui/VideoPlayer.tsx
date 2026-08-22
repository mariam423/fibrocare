"use client";

/**
 * Reusable Glassmorphic Video Player.
 *
 * Supports four source kinds, resolved from any URL:
 *  - direct video files (.mp4/.webm/.ogg) → native <video> element;
 *  - YouTube watch/short/youtu.be links    → privacy-friendly nocookie embed;
 *  - Vimeo links                           → player.vimeo.com embed;
 *  - anything else (incl. YouTube search   → external "open guide" card
 *    pages, which cannot be embedded)        instead of a broken iframe.
 *
 * Graceful degradation everywhere: a loading skeleton while the media loads,
 * and if loading fails the component renders its `fallback` (callers pass
 * the existing step cards / Framer Motion visualizers) so no page ever
 * breaks because of media. Fully offline-safe: without a network the media
 * errors out and the fallback shows.
 */

import React, { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlaySquareIcon, Loading03Icon, Link01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export type VideoSource =
  | { kind: "direct"; url: string }
  | { kind: "youtube"; embedUrl: string; id: string }
  | { kind: "vimeo"; embedUrl: string; id: string }
  | { kind: "external"; url: string };

/** Pure URL → source resolver (unit-tested). */
export function resolveVideoSource(rawUrl: string): VideoSource | null {
  const url = rawUrl.trim();
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    // Relative path (e.g. an app-local asset) — valid as a direct source
    // when it clearly points at a video file, otherwise unusable.
    return /\.(mp4|webm|ogg|mov)$/i.test(url) ? { kind: "direct", url } : null;
  }

  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(parsed.pathname)) {
    return { kind: "direct", url };
  }

  const yt =
    parsed.hostname.replace(/^www\./, "") === "youtu.be"
      ? parsed.pathname.slice(1)
      : parsed.hostname.replace(/^www\./, "") === "youtube.com"
        ? parsed.searchParams.get("v") ??
          (/^\/(embed|shorts|live)\//.test(parsed.pathname)
            ? parsed.pathname.split("/")[2]
            : null)
        : null;
  if (yt) {
    return {
      kind: "youtube",
      id: yt,
      embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt)}?rel=0`,
    };
  }

  const vimeoMatch = parsed.hostname.replace(/^www\./, "") === "vimeo.com"
    ? parsed.pathname.match(/^\/(\d+)/)
    : null;
  if (vimeoMatch) {
    return {
      kind: "vimeo",
      id: vimeoMatch[1],
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  return { kind: "external", url };
}

export interface VideoPlayerProps {
  source: string;
  /** Accessible title for the media region. */
  title: string;
  /** Rendered instead of the media when it fails or is unavailable offline. */
  fallback?: React.ReactNode;
  className?: string;
}

export function VideoPlayer({ source, title, fallback, className }: VideoPlayerProps) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const resolved = useMemo(() => resolveVideoSource(source), [source]);

  if (!resolved) {
    return <>{fallback ?? null}</>;
  }

  const shellClass = cn(
    "relative overflow-hidden rounded-2xl border border-border/60 glass-surface",
    className
  );

  // Media failed (offline / broken link) → seamless fallback.
  if (status === "error") {
    return <>{fallback ?? null}</>;
  }

  if (resolved.kind === "external") {
    return (
      <a
        href={resolved.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(shellClass, "flex items-center gap-3 p-4 text-sm font-medium transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50")}
        aria-label={t("video.openExternal")}
      >
        <HugeiconsIcon icon={Link01Icon} className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <span className="flex-1 truncate">{t("video.openExternal")}</span>
      </a>
    );
  }

  return (
    <div className={shellClass} role="region" aria-label={title}>
      {status === "loading" && (
        <div className="flex aspect-video w-full items-center justify-center bg-muted/40">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <HugeiconsIcon icon={Loading03Icon} className="h-6 w-6 animate-spin" aria-hidden="true" />
            <span className="text-xs">{t("video.loading")}</span>
          </div>
        </div>
      )}
      {resolved.kind === "direct" ? (
        <video
          controls
          preload="metadata"
          src={resolved.url}
          title={title}
          onLoadStart={() => setStatus("loading")}
          onCanPlay={() => setStatus("ready")}
          onError={() => setStatus("error")}
          className={cn("aspect-video w-full bg-black/60", status === "loading" && "hidden")}
        />
      ) : (
        <iframe
          src={resolved.embedUrl}
          title={title}
          allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
          onLoad={() => setStatus("ready")}
          onError={() => setStatus("error")}
          className={cn("aspect-video w-full border-0", status === "loading" && "hidden")}
        />
      )}
      {status === "ready" && (
        <span className="pointer-events-none absolute end-2 top-2 flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          <HugeiconsIcon icon={PlaySquareIcon} className="h-3 w-3" aria-hidden="true" />
          {t("video.badge")}
        </span>
      )}
    </div>
  );
}
