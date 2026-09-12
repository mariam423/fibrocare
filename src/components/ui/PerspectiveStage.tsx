"use client";

/**
 * PerspectiveStage — shared CSS-3D perspective wrapper.
 *
 * Gives any child a dimensional, responsive presence without a WebGL
 * runtime: pointer-follow tilt on fine pointers, touch/mouse drag-to-rotate,
 * and a calm resting pose (slight rotateX/rotateY) so the composition always
 * reads as 3D even when static.
 *
 * Accessibility & robustness contract:
 * - Disabled under reduced motion (system preference OR the manual
 *   `html.motion-reduce` kill-switch via useMotionEnabled) — the stage
 *   renders a fixed pose and never listens to pointer input.
 * - SSR-safe: all transform values are deterministic on the server; pointer
 *   logic only runs inside event handlers (no hydration mismatch).
 * - No rAF loops or timers outliving the element → nothing to leak.
 * - Scroll/pinch are never hijacked: on touch, rotation engages only after
 *   a deliberate 200 ms press, and vertical panning stays native
 *   (`touch-action: pan-y`) so the page still scrolls mid-gesture.
 */

import * as React from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from "framer-motion";
import { useMotionEnabled } from "@/hooks/useMotionEnabled";
import { cn } from "@/lib/utils";

export interface PerspectiveStageProps
  extends Omit<HTMLMotionProps<"div">, "onDrag" | "onDragStart" | "onDragEnd"> {
  children?: React.ReactNode;
  /** Max pointer-follow tilt in degrees (fine pointers only). Default 7. */
  tiltDeg?: number;
  /** Resting pose applied when idle — makes the static view feel 3D. */
  resting?: { rotateX?: number; rotateY?: number };
  /** Enable touch/mouse drag-to-rotate. Default true. */
  dragRotate?: boolean;
  /** Max drag rotation in degrees per axis. Default 16. */
  maxDragDeg?: number;
  /** Rotate the resting pose 180° (for back-view silhouettes). */
  flipped?: boolean;
}

const REST_SPRING = { stiffness: 120, damping: 20, mass: 0.5 };
const DRAG_SPRING = { stiffness: 180, damping: 24, mass: 0.4 };
const LONG_PRESS_MS = 200;

export function PerspectiveStage({
  children,
  tiltDeg = 7,
  resting,
  dragRotate = true,
  maxDragDeg = 16,
  flipped = false,
  className,
  style,
  ...props
}: PerspectiveStageProps) {
  const restX = resting?.rotateX ?? 8;
  const restY = resting?.rotateY ?? 0;

  const motionEnabled = useMotionEnabled();
  const ref = React.useRef<HTMLDivElement>(null);

  // Base resting pose + pointer tilt + drag offsets, all motion values.
  const baseX = useMotionValue(restX);
  const baseY = useMotionValue(restY + (flipped ? 180 : 0));
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  const springBaseX = useSpring(baseX, REST_SPRING);
  const springBaseY = useSpring(baseY, REST_SPRING);
  const springTiltX = useSpring(tiltX, REST_SPRING);
  const springTiltY = useSpring(tiltY, REST_SPRING);
  const springDragX = useSpring(dragX, DRAG_SPRING);
  const springDragY = useSpring(dragY, DRAG_SPRING);

  // Compose the three layers into single rotate values.
  const rotateX = useTransform(
    [springBaseX, springTiltX, springDragX],
    ([a, b, c]: number[]) => a + b + c
  );
  const rotateY = useTransform(
    [springBaseY, springTiltY, springDragY],
    ([a, b, c]: number[]) => a + b + c
  );

  // Re-sync the resting pose when the front/back prop flips.
  React.useEffect(() => {
    baseX.set(restX);
    baseY.set(restY + (flipped ? 180 : 0));
  }, [restX, restY, flipped, baseX, baseY]);

  // ---- Drag-to-rotate state (declared before handlers reference it) -----
  const dragStateRef = React.useRef({
    active: false,
    pointerId: null as number | null,
    startX: 0,
    startY: 0,
  });
  const timerRef = React.useRef<number | null>(null);
  const [dragging, setDragging] = React.useState(false);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cancel any pending long-press timer on unmount (no leaks).
  React.useEffect(() => clearTimer, [clearTimer]);

  const endDrag = React.useCallback(() => {
    clearTimer();
    dragStateRef.current.active = false;
    dragStateRef.current.pointerId = null;
    setDragging(false);
    dragX.set(0);
    dragY.set(0);
  }, [clearTimer, dragX, dragY]);

  // ---- Pointer-follow tilt (fine pointers only) -------------------------
  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!motionEnabled) return;
      if (event.pointerType === "mouse" && !dragStateRef.current.active) {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        tiltY.set(px * tiltDeg);
        tiltX.set(-py * tiltDeg);
        return;
      }
      if (dragStateRef.current.active) {
        const dx = event.clientX - dragStateRef.current.startX;
        const dy = event.clientY - dragStateRef.current.startY;
        dragX.set(clamp(dy * 0.25, maxDragDeg));
        dragY.set(clamp(dx * 0.25, maxDragDeg));
      }
    },
    [motionEnabled, tiltDeg, maxDragDeg, tiltX, tiltY, dragX, dragY]
  );

  const handlePointerLeave = React.useCallback(() => {
    tiltX.set(0);
    tiltY.set(0);
  }, [tiltX, tiltY]);

  // ---- Drag-to-rotate handlers (deliberate press; long-press on touch) --
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!motionEnabled || !dragRotate || dragStateRef.current.active) return;
    dragStateRef.current.pointerId = event.pointerId;
    dragStateRef.current.startX = event.clientX;
    dragStateRef.current.startY = event.clientY;
    if (event.pointerType === "mouse") {
      dragStateRef.current.active = true;
      setDragging(true);
    } else {
      // Touch: wait for a deliberate press so taps still reach hotspots.
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        dragStateRef.current.active = true;
        setDragging(true);
      }, LONG_PRESS_MS);
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    // Ignore pointerup from a different pointer than the active drag
    // (multi-touch). Older browsers may omit pointerId entirely — accept
    // those rather than leaving the gesture stuck.
    if (
      typeof dragStateRef.current.pointerId === "number" &&
      event.pointerId !== dragStateRef.current.pointerId
    )
      return;
    endDrag();
  };

  if (!motionEnabled) {
    // Reduced motion: fixed 3D pose, no listeners, zero JS animation.
    return (
      <motion.div
        className={cn("relative [perspective:1100px]", className)}
        style={{
          transform: `rotateX(${restX}deg) rotateY(${
            restY + (flipped ? 180 : 0)
          }deg)`,
          transformStyle: "preserve-3d",
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative touch-pan-y [perspective:1100px]",
        dragging && "cursor-grabbing"
      )}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1100,
        transformStyle: "preserve-3d",
        ...style,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function clamp(value: number, max: number): number {
  return Math.max(-max, Math.min(max, value));
}
