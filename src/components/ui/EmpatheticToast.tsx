"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, HeartIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMotionEnabled } from "@/hooks/useMotionEnabled";
import { useLanguage } from "@/context/LanguageContext";

interface EmpatheticToastProps {
  message: string;
  onClose: () => void;
  actions?: { label: string; onClick: () => void }[];
}

export function EmpatheticToast({ message, onClose, actions }: EmpatheticToastProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const motionEnabled = useMotionEnabled();
  const { t } = useLanguage();

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    return () => {
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const container = containerRef.current;
      if (!container) return;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={containerRef}
      className="fixed bottom-6 end-6 z-[100] w-[calc(100%-3rem)] max-w-sm sm:end-10 lg:end-12"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="empathic-toast-title"
      aria-describedby="empathic-toast-message"
      initial={motionEnabled ? { opacity: 0, y: 28, scale: 0.96 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        y: 16,
        scale: 0.98,
        transition: { duration: motionEnabled ? 0.16 : 0, ease: "easeIn" },
      }}
      transition={motionEnabled ? { type: "spring", stiffness: 260, damping: 26, mass: 0.9 } : undefined}
    >
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(15,23,42,0.12)] backdrop-blur-md flex flex-col gap-4 text-white">
        <div className="flex justify-between items-start gap-3">
          <div className="flex gap-3">
            <div className="icon-badge h-10 w-10 shrink-0 rounded-xl">
              <HugeiconsIcon icon={HeartIcon} className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-1 pt-0.5">
              <p id="empathic-toast-title" className="text-sm font-semibold text-foreground">
                {t("dashboard.toast.title")}
              </p>
              <p
                id="empathic-toast-message"
                className="text-sm text-muted-foreground leading-relaxed"
              >
                {message}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t("dashboard.toast.dismissAria")}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none cursor-pointer"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {actions && (
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Button
                key={action.label}
                size="sm"
                variant="ghost"
                onClick={action.onClick}
                className={cn(
                  "rounded-full border border-slate-800 bg-slate-900/80 px-4 text-xs font-semibold",
                  "transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-primary active:scale-[0.97]"
                )}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
