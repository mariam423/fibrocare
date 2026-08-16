"use client";

import * as React from "react";

import { useMotionEnabled } from "@/hooks/useMotionEnabled";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  /** Element to render (defaults to div, e.g. "article"). */
  as?: React.ElementType;
}

/**
 * Cursor spotlight wrapper (design-taste micro-interaction).
 *
 * Writes `--spot-x` / `--spot-y` CSS custom properties directly on the
 * element on pointermove, so there are zero re-renders while tracking.
 * The radial highlight itself is painted by the `.spotlight-card::after`
 * layer in globals.css (uses ::after so it never clashes with
 * `.glow-card::before` on the same element; positioned behind children
 * via `.spotlight-card > *`), which fades in on hover / focus-within.
 *
 * Accessibility:
 * - Reduced motion and reduced transparency disable the layer in CSS.
 * - The highlight is decorative (pointer-events: none, no aria).
 * - Fine pointers only; touch devices get the plain hover state.
 */
export function SpotlightCard({
  children,
  className,
  as: Tag = "div",
  ...props
}: SpotlightCardProps) {
  const motionEnabled = useMotionEnabled();
  const ref = React.useRef<HTMLElement>(null);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!motionEnabled || event.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      onPointerMove={handlePointerMove}
      className={cn("spotlight-card", className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
