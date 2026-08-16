"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  HeartIcon,
  LockKeyIcon,
  Shield01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { WordReveal } from "@/components/ui/WordReveal";
import { RouteTransition } from "@/components/ui/RouteTransition";

interface AuthShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const TRUST_POINTS = [
  { icon: LockKeyIcon, label: "PIN lock optional" },
  { icon: Shield01Icon, label: "Encrypted, never sold" },
  { icon: Clock01Icon, label: "2-minute check-ins" },
];

/**
 * Shared, gentle frame for the /login and /signup pages.
 *
 * A two-panel composition: a calm wellness photograph on the left (desktop
 * and up) with a soft quote overlay and floating glass chips, and the form
 * on the right inside a frosted glass card. Uses the app's semantic tokens
 * so the soothing palette (Standard lavender or Sensitive sage) applies
 * automatically.
 */
export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <RouteTransition>
      <div className="flex min-h-[100dvh] items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 overflow-hidden rounded-3xl ring-1 ring-border glass-surface lg:grid-cols-[1.05fr_1fr]">
            {/* Calm visual panel */}
            <div className="relative hidden lg:block min-h-[560px]">
              <Image
                src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1400&q=80"
                alt="A calm, softly lit spa setting with candles and folded towels"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 0vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* Breathing sage glow, echoing the app's calm identity */}
              <div
                aria-hidden="true"
                className="breathe-glow absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[color-mix(in_oklab,#86ac8c_30%,transparent)] blur-2xl"
              />

              {/* Floating glass chips over the photo */}
              <div
                aria-hidden="true"
                className="animate-float-soft absolute right-8 top-10"
              >
                <div className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-lg backdrop-blur-md">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                    <HugeiconsIcon icon={HeartIcon} className="h-4 w-4 text-white" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">
                      Gentle by design
                    </span>
                    <span className="block text-[11px] text-white/70">
                      check in when you can
                    </span>
                  </span>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="animate-float-soft absolute bottom-40 right-6"
                style={{ animationDelay: "1.4s" }}
              >
                <div className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-lg backdrop-blur-md">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                    <HugeiconsIcon icon={Shield01Icon} className="h-4 w-4 text-white" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">
                      Private by default
                    </span>
                    <span className="block text-[11px] text-white/70">
                      encrypted, never sold
                    </span>
                  </span>
                </div>
              </div>

              <figure className="absolute inset-x-0 bottom-0 p-8">
                <blockquote className="max-w-sm text-lg italic leading-relaxed text-white drop-shadow-md">
                  &ldquo;You are not broken. You are learning to move at your
                  body&rsquo;s pace.&rdquo;
                </blockquote>
                <figcaption className="mt-3 text-sm font-medium text-white/80">
                  A gentle note from FibroCare
                </figcaption>
              </figure>
            </div>

            {/* Form panel */}
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <Link
                href="/dashboard"
                className="mb-8 flex items-center gap-2 self-start rounded-2xl bg-primary/15 p-3 text-primary transition-colors hover:bg-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex items-center gap-2">
                  <HugeiconsIcon icon={HeartIcon} className="h-6 w-6" aria-hidden="true" />
                  <span className="text-2xl font-semibold tracking-tight">
                    FibroCare
                  </span>
                </span>
              </Link>

              <WordReveal
                as="h1"
                text={title}
                className="text-2xl font-bold tracking-tight text-foreground"
                amount={0.5}
              />
              {description && (
                <WordReveal
                  as="p"
                  text={description}
                  className="mt-2 text-base leading-relaxed text-muted-foreground"
                  delay={0.06}
                  amount={0.5}
                />
              )}
              <div className="mt-6">{children}</div>

              {/* Quiet trust row */}
              <ul
                className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-5"
                aria-label="Privacy and simplicity"
              >
                {TRUST_POINTS.map((point) => (
                  <li
                    key={point.label}
                    className="flex items-center gap-1.5 text-[13px] text-muted-foreground"
                  >
                    <HugeiconsIcon
                      icon={point.icon}
                      className="h-3.5 w-3.5 text-primary/70"
                      aria-hidden="true"
                    />
                    {point.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </RouteTransition>
  );
}
