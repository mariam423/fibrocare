"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Markdown renderer for AI text. Memoized so streaming re-renders only
 * when the streamed text actually changes. (react-markdown v10 removed the
 * `className` prop, so styling is applied on the wrapper div.)
 */
export const AiMarkdown = memo(function AiMarkdown({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-1.5 list-disc space-y-1 pl-4 last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-1.5 list-decimal space-y-1 pl-4 last:mb-0">
              {children}
            </ol>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              {children}
            </a>
          ),
          h1: ({ children }) => (
            <h1 className="mb-1 text-base font-semibold">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-1 text-sm font-semibold">{children}</h2>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
});
