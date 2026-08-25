"use client";

import { Fragment, memo, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { splitBdi } from "@/lib/resources/text";

/**
 * Recursively wraps numeric/acronym tokens in `<bdi>` so they keep their own
 * direction when AI responses mix languages — e.g. "5-10 دقائق" or an English
 * acronym inside an Arabic stream stays correctly ordered in RTL mode.
 *
 * Only text nodes and arrays are split: element nodes are left untouched so
 * each markdown renderer wraps exactly its own text children (no nested
 * `<bdi>`), and `<bdi>` is a no-op in LTR so English output is unchanged.
 */
function bidiWrap(node: ReactNode): ReactNode {
  if (Array.isArray(node)) {
    return node.map((child, i) => (
      <Fragment key={i}>{bidiWrap(child)}</Fragment>
    ));
  }
  if (typeof node === "string" || typeof node === "number") {
    const text = String(node);
    const parts = splitBdi(text);
    if (parts.length === 1 && !parts[0].bdi) return text;
    return parts.map((part, i) =>
      part.bdi ? (
        <bdi key={i}>{part.text}</bdi>
      ) : (
        <Fragment key={i}>{part.text}</Fragment>
      )
    );
  }
  return node;
}

/**
 * Markdown renderer for AI text. Memoized so streaming re-renders only
 * when the streamed text actually changes. (react-markdown v10 removed the
 * `className` prop, so styling is applied on the wrapper div.)
 *
 * Bidi: the wrapper uses `unicode-bidi: plaintext` + `dir="auto"` so every
 * block (paragraph/list item) resolves its own direction from its first
 * strong character — an Arabic paragraph with embedded English words or
 * figures stays RTL while a fully-English paragraph reads LTR.
 */
export const AiMarkdown = memo(function AiMarkdown({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      dir="auto"
      style={{ unicodeBidi: "plaintext" }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-1.5 last:mb-0">{bidiWrap(children)}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-1.5 list-disc space-y-1 ps-4 last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-1.5 list-decimal space-y-1 ps-4 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => <li>{bidiWrap(children)}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold">{bidiWrap(children)}</strong>
          ),
          em: ({ children }) => <em>{bidiWrap(children)}</em>,
          del: ({ children }) => <del>{bidiWrap(children)}</del>,
          blockquote: ({ children }) => (
            <blockquote className="mb-1.5 border-s-2 border-border ps-3 text-muted-foreground last:mb-0">
              {bidiWrap(children)}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              {bidiWrap(children)}
            </a>
          ),
          h1: ({ children }) => (
            <h1 className="mb-1 text-base font-semibold">{bidiWrap(children)}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-1 text-sm font-semibold">{bidiWrap(children)}</h2>
          ),
          code: ({ children }) => (
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
              {bidiWrap(children)}
            </code>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
});
