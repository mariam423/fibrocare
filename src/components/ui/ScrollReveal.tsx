"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMotionEnabled } from "@/hooks/useMotionEnabled";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

interface ScrollRevealProps extends React.HTMLAttributes<HTMLElement> {
  /** Stagger delay in seconds before the animation runs once in view. */
  delay?: number;
  /** Visibility ratio (0–1) that triggers the reveal. */
  threshold?: number;
  /** Optionally render as a different element (e.g. "section", "li"). */
  as?: React.ElementType;
}

/**
 * Scroll-reveal entrance driven by Framer Motion's `whileInView`.
 *
 * Wraps content in a motion element that starts at opacity 0 with a gentle
 * rise and animates to its resting state the first time it enters the
 * viewport. Only `opacity`/`transform` are animated — never layout — so a
 * reveal can never shift sibling content.
 *
 * - Runs once per element (`viewport.once`).
 * - Framer Motion observes the viewport and fires immediately for content
 *   already on screen after mount.
 * - Reduced motion (system or the manual `html.motion-reduce` class) is
 *   handled by `useMotionEnabled`; the element then renders at full opacity
 *   and never stranding content hidden.
 * - SSR and the first client render output the element without a start-state
 *   (no inline opacity 0), so hydration is exact and no-JS shows the content.
 *   The hidden start-state is applied only after mount by remounting the
 *   motion element (framer's `initial` is read once per mount).
 */
export function ScrollReveal({
  delay = 0,
  threshold = 0.15,
  as: Tag = "div",
  className,
  children,
  ...props
}: ScrollRevealProps) {
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
  const MotionTag = React.useMemo(() => motion.create(Tag), [Tag]);

  return (
    <MotionTag
      key={shouldAnimate ? "reveal" : "static"}
      className={cn(className)}
      initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
      whileInView={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: threshold, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay }}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
