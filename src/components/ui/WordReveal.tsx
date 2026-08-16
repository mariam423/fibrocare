"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";

import { useMotionEnabled } from "@/hooks/useMotionEnabled";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

interface WordRevealProps extends React.HTMLAttributes<HTMLElement> {
  text: string;
  /** Element to render (defaults to span). */
  as?: React.ElementType;
  /** Stagger delay before the first word moves, in seconds. */
  delay?: number;
  /** Seconds between each word's reveal. */
  stagger?: number;
  /** Visibility ratio of the block that must be in view to trigger. */
  amount?: number;
}

/**
 * Word-by-word revisit-the-tagline reveal (landing-page-design B11,
 * softened for the calm system).
 *
 * Each word starts at a muted ~30% ink and resolves to full text color,
 * in reading order, once the block enters the viewport. Words keep their
 * trailing space (`whitespace-pre`) so both visual flow and screen-reader
 * output stay identical to plain text.
 *
 * Accessibility / robustness:
 * - Under reduced motion (system or the manual `html.motion-reduce`
 *   kill-switch) the string renders plain at full opacity — content is
 *   never gated behind the animation.
 * - SSR and the first client render output the plain string (no inline
 *   start-state), so hydration is always exact and no-JS shows the text.
 * - The animation state is applied only after mount by remounting the
 *   inner motion span (framer's `initial` is read once per mount).
 */
export function WordReveal({
  text,
  as: Tag = "span",
  delay = 0,
  stagger = 0.05,
  amount = 0.4,
  className,
  ...props
}: WordRevealProps) {
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
    hidden: { opacity: 0.3, y: "0.35em", filter: "blur(3px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: EASE_OUT },
    },
  };

  return (
    <Tag className={className} {...props}>
      <motion.span
        key={shouldAnimate ? `reveal:${text}` : "static"}
        initial={shouldAnimate ? "hidden" : false}
        whileInView={shouldAnimate ? "visible" : undefined}
        viewport={{ once: true, amount }}
        variants={shouldAnimate ? container : undefined}
      >
        {words.map((word_, index) => (
          <motion.span
            key={index}
            className="inline-block whitespace-pre-wrap [overflow-wrap:anywhere]"
            variants={shouldAnimate ? word : undefined}
          >
            {word_ + (index < words.length - 1 ? " " : "")}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}