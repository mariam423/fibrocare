"use client";

import * as React from "react";

import { useMotionEnabled } from "@/hooks/useMotionEnabled";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  /** Element to render (defaults to div, e.g. "article"). */
  as?: React.ElementType;
}

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
      className={cn(
        "spotlight-card h-auto min-h-fit !overflow-visible pb-4",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}