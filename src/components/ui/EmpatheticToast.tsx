"use client";

import React, { useEffect, useRef } from "react";
import { X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmpatheticToastProps {
  message: string;
  onClose: () => void;
  actions?: { label: string; onClick: () => void }[];
}

export function EmpatheticToast({ message, onClose, actions }: EmpatheticToastProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-[100] max-w-sm animate-in slide-in-from-bottom-full fade-in duration-500"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="empathic-toast-title"
      aria-describedby="empathic-toast-message"
    >
      <div className="bg-card text-card-foreground border-l-4 border-primary shadow-2xl rounded-2xl p-4 flex flex-col gap-4 ring-1 ring-border">
        <div className="flex justify-between items-start gap-3">
          <div className="flex gap-3">
            <div className="p-2 rounded-full bg-primary/15 shrink-0">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p id="empathic-toast-title" className="text-sm font-semibold">
                We&apos;re here with you
              </p>
              <p
                id="empathic-toast-message"
                className="text-sm font-medium leading-relaxed"
              >
                {message}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Dismiss message"
            className="rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {actions && (
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Button
                key={action.label}
                size="sm"
                variant="outline"
                onClick={action.onClick}
                className="text-xs rounded-full px-3 py-1 hover:bg-primary/10"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
