"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
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

interface ContentSection {
  title: string;
  icon: IconSvgElement;
  content: string;
  highlights?: string[];
}

interface ContentPageLayoutProps {
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  icon: IconSvgElement;
  sections: ContentSection[];
  accentColor?: string;
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
}: ContentPageLayoutProps) {
  const { t } = useLanguage();
  const colors = accentColors[accentColor] || accentColors.primary;

  return (
    <main className="w-full max-w-4xl mx-auto px-4 pb-12">
      <div className="space-y-8">
        {/* Hero Header */}
        <ScrollReveal as="section" className="space-y-4">
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
        </ScrollReveal>

        {/* Content Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <ScrollReveal key={index} delay={index * 0.05}>
              <DepthCard tilt={3} delay={index * 0.05}>
                <SpotlightCard className="group h-full rounded-3xl border border-border/60 bg-card/70 backdrop-blur-sm shadow-depth-sm transition-all duration-300 dark:border-white/10 dark:bg-background/40 dark:backdrop-blur-xl dark:hover:border-emerald-400/30 dark:hover:shadow-[0_0_24px_rgba(16,185,129,0.16)]">
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
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-line leading-relaxed">
                      {section.content}
                    </div>
                    {section.highlights && section.highlights.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {section.highlights.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 rounded-xl bg-muted/50 border border-border/50 p-3"
                          >
                            <span className="shrink-0 mt-1 h-2 w-2 rounded-full bg-primary/60" />
                            <span className="text-sm text-foreground/80">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
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
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" aria-hidden="true" />
              {t("common.back")}
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}