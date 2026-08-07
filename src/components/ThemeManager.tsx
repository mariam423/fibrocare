"use client";

import { useEffect } from "react";
import { useHealth } from "@/context/HealthContext";

export default function ThemeManager() {
  const { activeTheme, motionEnabled, isDark } = useHealth();

  useEffect(() => {
    const html = document.documentElement;

    html.classList.toggle("theme-sensitive", activeTheme === "Sensitive");
    html.classList.toggle("dark", isDark);
    html.classList.toggle("motion-reduce", !motionEnabled);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    html.classList.toggle("motion-reduce", !motionEnabled || prefersReducedMotion);
  }, [activeTheme, motionEnabled, isDark]);

  return null;
}
