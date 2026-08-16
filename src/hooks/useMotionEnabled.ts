"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

function subscribeMotionClass(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  const html = document.documentElement;
  const observer = new MutationObserver(onStoreChange);
  observer.observe(html, { attributes: true, attributeFilter: ["class"] });

  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);

  return () => {
    observer.disconnect();
    media.removeEventListener("change", onStoreChange);
  };
}

function getMotionEnabledSnapshot(): boolean {
  if (typeof document === "undefined") return true;
  return !document.documentElement.classList.contains("motion-reduce");
}

/**
 * True when animation is allowed for Framer Motion components.
 *
 * Respects BOTH the system `prefers-reduced-motion` preference AND
 * FibroCare's manual kill-switch (`html.motion-reduce`, toggled by
 * Sensitive mode). Pure-CSS animation is already covered by the
 * global guards in globals.css; this hook covers JS-driven motion
 * (springs, whileInView, pointer responses).
 *
 * Reactively re-checks when the `class` attribute on <html> changes
 * (Sensitive mode toggle) or when the system preference changes.
 */
export function useMotionEnabled(): boolean {
  const manualEnabled = useSyncExternalStore(
    subscribeMotionClass,
    getMotionEnabledSnapshot,
    () => true
  );
  const systemReduced = useReducedMotion();
  return manualEnabled && !systemReduced;
}