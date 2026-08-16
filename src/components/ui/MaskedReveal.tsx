"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";

import { useMotionEnabled } from "@/hooks/useMotionEnabled";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

interface MaskedRevealProps extends React.HTMLAttributes<HTMLElement> {
  text: string;
  /** Element to render (defaults to span). */
  as?: React.ElementType;
  /** Extra class names for each word span (e.g. a gradient text class). */
  wordClassName?: string;
  /** Stagger delay before the first word moves, in seconds. */
  delay?: number;
  /** Seconds between each word's reveal. */
  stagger?: number;
  /** Visibility ratio of the block that must be in view to trigger. */
  amount?: number;
}

/**
 * Masked word reveal (masked-reveal technique, framer-motion only).
 *
 * Each word sits inside an `overflow: hidden` mask and rises from
 * `translateY(110%)` into place, in reading order, once the block scrolls
 * into view. The clip reads as a premium editorial reveal without the paid
 * SplitText plugin.
 *
 * Accessibility & robustness (mirrors WordReveal):
 * - Under reduced motion (system or the manual `html.motion-reduce`
 *   kill-switch) the string renders plain at full opacity — content is
 *   never gated behind the animation.
 * - SSR and the first client render output the plain string, so hydration
 *   is always exact and no-JS shows the text.
 * - Each word keeps its trailing space (`whitespace-pre`) so visual flow
 *   and screen-reader output stay identical to plain text.
 */
export function MaskedReveal({
  text,
  as: Tag = "span",
  wordClassName,
  delay = 0,
  stagger = 0.045,
  amount = 0.4,
  className,
  ...props
}: MaskedRevealProps) {
  const motionEnabled = useMotionEnabled();
  // True only after hydration: the server snapshot is `false` and the client
  // snapshot `true`, so React flips `mounted` right after mount — without a
  // setState-in-effect (which the react-hooks rule forbids).
  const mounted = React.useSyncExternalStore(
    React.useCallback((onStoreChange: () => void) => {
      onStoreChange();
      return () => {};
    }, []),
    () => true,
    () => false
  );

  const shouldAnimate = mounted && motionEnabled;
  const words = React.useMemo(() => text.split(" "), [text]);

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  const word: Variants = {
    hidden: { y: "110%", opacity: 0.001 },
    visible: {
      y: "0%",
      opacity: 1,
      transition: { duration: 0.8, ease: EASE_OUT },
    },
  };

  return (
    <Tag className={cn(className)} {...props}>
      <motion.span
        key={shouldAnimate ? `masked:${text}` : "static"}
        initial={shouldAnimate ? "hidden" : false}
        whileInView={shouldAnimate ? "visible" : undefined}
        viewport={{ once: true, amount }}
        variants={shouldAnimate ? container : undefined}
        className={cn(shouldAnimate && "block")}
      >
        {words.map((word_, index) => (
          <span
            key={index}
            className="inline-block overflow-hidden align-top"
          >
            <motion.span
              className={cn(
                "inline-block -mb-[0.12em] whitespace-pre pb-[0.12em] [overflow-wrap:anywhere]",
                wordClassName
              )}
              variants={shouldAnimate ? word : undefined}
            >
              {word_ + (index < words.length - 1 ? " " : "")}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}