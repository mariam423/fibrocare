"use client";

import React, { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { ArrowLeft01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import type { RetrievedChunk } from "@/lib/ai/rag/types";
import { AiTakeawayBanner } from "./AiTakeawayBanner";
import { CitationBadge } from "./CitationBadge";
import { BdiText } from "./BdiText";

/** A highlight cell: a plain string, or a key-value pair (label + value). */
type HighlightItem = string | { label: string; value: string };

export interface ContentSection {
  title: string;
  icon: IconSvgElement;
  content: string;
  /** Plain-language variant shown when the foggy toggle is on. */
  plainContent?: string;
  highlights?: HighlightItem[];
  /** Retrieved knowledge chunk — renders a "Verified Source" badge. */
  chunk?: RetrievedChunk | null;
  /** Short takeaway pills rendered at the bottom of the card. */
  tags?: TranslationKey[];
  /** Interactive widget (timer, bookmark, quick-add) rendered last. */
  action?: React.ReactNode;
}

interface ContentPageLayoutProps {
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  icon: IconSvgElement;
  sections: ContentSection[];
  accentColor?: string;
  /** Optional "AI 1-Minute Takeaway" banner rendered under the hero. */
  takeaway?: {
    bullets: [TranslationKey, TranslationKey, TranslationKey];
    chunk: RetrievedChunk | null;
  };
}

// Color mapping for dynamic classes
const accentColors: Record<string, { bg: string; text: string }> = {
  primary: { bg: "bg-primary/15", text: "text-primary" },
  emerald: { bg: "bg-emerald/15", text: "text-emerald" },
  blue: { bg: "bg-blue/15", text: "text-blue" },
  purple: { bg: "bg-purple/15", text: "text-purple" },
  orange: { bg: "bg-orange/15", text: "text-orange" },
};

export function ContentPageLayout({
  titleKey,
  subtitleKey,
  icon,
  sections,
  accentColor = "primary",
  takeaway,
}: ContentPageLayoutProps) {
  const { t } = useLanguage();
  const colors = accentColors[accentColor] || accentColors.primary;

  const hasPlain = useMemo(
    () => sections.some((s) => s.plainContent),
    [sections]
  );
  const [foggy, setFoggy] = useState(false);

  return (
    <main className="w-full max-w-4xl mx-auto px-4 pb-12">
      <div className="space-y-8">
        {/* Hero Header */}
        <ScrollReveal as="section" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${colors.bg} ${colors.text}`}>
                <HugeiconsIcon
                  icon={icon}
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {t(titleKey)}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {t(subtitleKey)}
                </p>
              </div>
            </div>
            {hasPlain && (
              <button
                type="button"
                onClick={() => setFoggy((f) => !f)}
                aria-pressed={foggy}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-all duration-200 hover:scale-[1.02] hover:border-emerald-500/50 hover:bg-emerald-500/15 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-emerald-300"
              >
                <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5" aria-hidden="true" />
                {foggy ? t("resources.ai.standard") : t("resources.ai.foggy")}
              </button>
            )}
          </div>
        </ScrollReveal>

        {/* AI 1-Minute Takeaway */}
        {takeaway && (
          <ScrollReveal delay={0.05}>
            <AiTakeawayBanner bullets={takeaway.bullets} chunk={takeaway.chunk} />
          </ScrollReveal>
        )}

        {/* Content Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <ScrollReveal key={index} delay={index * 0.05}>
              <DepthCard tilt={3} delay={index * 0.05}>
                <SpotlightCard className="group h-full rounded-2xl border border-emerald-500/20 bg-white/70 shadow-lg shadow-emerald-950/20 backdrop-blur-xl transition-all duration-200 hover:scale-[1.01] hover:border-emerald-400/40 hover:shadow-emerald-950/30 dark:bg-slate-900/60">
                  <CardHeader className="pt-6 px-6 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                        <HugeiconsIcon
                          icon={section.icon}
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      {section.chunk && (
                        <span className="ms-auto">
                          <CitationBadge chunk={section.chunk} />
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-line leading-relaxed">
                      <BdiText
                        text={foggy ? section.plainContent ?? section.content : section.content}
                      />
                    </div>
                    {section.highlights && section.highlights.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {section.highlights.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 rounded-xl bg-muted/50 border border-border/50 p-3 transition-all duration-200 hover:border-emerald-400/30 hover:bg-emerald-500/5"
                          >
                            {typeof item === "string" ? (
                              <>
                                <span className="shrink-0 mt-1 h-2 w-2 rounded-full bg-primary/60" />
                                <span className="text-sm text-foreground/80">
                                  <BdiText text={item} />
                                </span>
                              </>
                            ) : (
                              <div className="flex w-full flex-col gap-1">
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  <BdiText text={item.label} />
                                </span>
                                <span className="text-sm text-foreground/85">
                                  <BdiText text={item.value} />
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {section.tags && section.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {section.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 transition-all duration-200 hover:border-emerald-500/40 hover:bg-emerald-500/15 dark:text-emerald-300"
                          >
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/70"
                              aria-hidden="true"
                            />
                            {t(tag)}
                          </span>
                        ))}
                      </div>
                    )}
                    {section.action && <div className="pt-1">{section.action}</div>}
                  </CardContent>
                </SpotlightCard>
              </DepthCard>
            </ScrollReveal>
          ))}
        </div>

        {/* Navigation */}
        <ScrollReveal delay={0.2}>
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                className="h-4 w-4 rtl:rotate-180"
                aria-hidden="true"
              />
              {t("common.back")}
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
