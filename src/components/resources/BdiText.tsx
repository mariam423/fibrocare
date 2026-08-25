"use client";

/**
 * Renders localized text with percentages, standalone numbers, and medical
 * acronyms (WPI, SSS, CBC, ESR, …) wrapped in `<bdi>` tags.
 *
 * In RTL (Arabic) mode, `<bdi>` isolates Latin digits and acronyms so
 * punctuation and direction never flip — "2-4%", "7 of 19", and "CBC" render
 * correctly inside Arabic sentences. In LTR mode `<bdi>` has no visual
 * effect, so this is safe for both locales.
 *
 * The tokenization lives in `src/lib/resources/text.ts` (pure, unit-tested);
 * this component only maps segments to DOM.
 */

import React, { useMemo } from "react";
import { splitBdi } from "@/lib/resources/text";

export function BdiText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const parts = useMemo(() => splitBdi(text), [text]);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.bdi ? (
          <bdi key={i}>{part.text}</bdi>
        ) : (
          <React.Fragment key={i}>{part.text}</React.Fragment>
        )
      )}
    </span>
  );
}
