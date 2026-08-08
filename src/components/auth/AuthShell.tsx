"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

interface AuthShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * Shared, gentle frame for the /login and /signup pages.
 *
 * Uses the app's semantic tokens so the soothing palette (Standard lavender
 * or Sensitive sage) applies automatically. Keeps a single centered column
 * with generous spacing and a clearly labelled brand link back home.
 */
export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-background/80 px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 rounded-2xl bg-primary/15 p-3 text-primary transition-colors hover:bg-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex items-center gap-2">
            <Heart className="h-6 w-6" aria-hidden="true" />
            <span className="text-2xl font-semibold tracking-tight">
              FibroCare
            </span>
          </span>
        </Link>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
