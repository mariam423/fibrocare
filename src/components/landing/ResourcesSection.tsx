"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  BookOpen01Icon,
  StethoscopeIcon,
  HeartPulseIcon,
  YogaIcon,
  AppleIcon,
  BubbleChatQuestionIcon,
} from "@hugeicons/core-free-icons";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { MaskedReveal } from "@/components/ui/MaskedReveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

interface ResourceCard {
  href: string;
  category: TranslationKey;
  title: TranslationKey;
  copy: TranslationKey;
  icon: typeof BookOpen01Icon;
  tint: string;
}

const RESOURCES: ResourceCard[] = [
  {
    href: "/resources/about",
    category: "landing.resources.card.category.basics",
    title: "resources.about",
    copy: "about.overview",
    icon: BookOpen01Icon,
    tint: "oklab(0.55 0.06 150)",
  },
  {
    href: "/resources/diagnosis",
    category: "landing.resources.card.category.diagnosis",
    title: "resources.diagnosis",
    copy: "diagnosis.subtitle",
    icon: StethoscopeIcon,
    tint: "oklab(0.55 0.06 280)",
  },
  {
    href: "/resources/treatment",
    category: "landing.resources.card.category.treatment",
    title: "resources.treatment",
    copy: "treatment.subtitle",
    icon: HeartPulseIcon,
    tint: "oklab(0.58 0.06 45)",
  },
  {
    href: "/resources/exercises",
    category: "landing.resources.card.category.movement",
    title: "resources.exercises",
    copy: "exercises.subtitle",
    icon: YogaIcon,
    tint: "oklab(0.55 0.05 190)",
  },
  {
    href: "/resources/nutrition",
    category: "landing.resources.card.category.nutrition",
    title: "resources.nutrition",
    copy: "nutrition.subtitle",
    icon: AppleIcon,
    tint: "oklab(0.56 0.06 120)",
  },
  {
    href: "/resources/faq",
    category: "landing.resources.card.category.faq",
    title: "resources.faq",
    copy: "faq.subtitle",
    icon: BubbleChatQuestionIcon,
    tint: "oklab(0.56 0.05 230)",
  },
];

export function ResourcesSection() {
  const { t } = useLanguage();
  return (
    <section
      id="resources"
      className="border-y border-border bg-muted/40 px-4 py-16 sm:px-6 md:py-20 lg:px-8 dark:border-white/10 dark:bg-background/40 dark:backdrop-blur-xl"
      aria-labelledby="resources-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <ScrollReveal>
              <span className="inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.18em] text-primary">
                <span className="h-px w-8 bg-primary/50" aria-hidden="true" />
                {t("landing.resources.eyebrow")}
              </span>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2
                id="resources-heading"
                className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]"
              >
                <MaskedReveal text={t("landing.resources.heading")} />
              </h2>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.1}>
            <Link
              href="/resources"
              className="group inline-flex items-center gap-2 rounded-full surface-crisp hover-lift glow-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("landing.resources.viewAll")}
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 rtl:scale-x-[-1] rtl:group-hover:-translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            </Link>
          </ScrollReveal>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCES.map((resource, i) => {
            const Icon = resource.icon;
            return (
              <ScrollReveal key={resource.href} delay={(i % 3) * 0.08} className="h-full">
                <SpotlightCard
                  as="article"
                  className="surface-crisp hover-lift glow-card group flex h-full flex-col rounded-3xl border-border p-6 sm:p-7"
                >
                  <span
                    className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground ring-1 ring-border"
                    style={{ backgroundColor: `color-mix(in srgb, ${resource.tint} 16%, transparent)` }}
                  >
                    {t(resource.category)}
                  </span>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <span className="icon-badge h-10 w-10 rounded-xl transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-105">
                      <HugeiconsIcon icon={Icon} className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                    {t(resource.title)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(resource.copy)}
                  </p>
                  <Link
                    href={resource.href}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    aria-label={`${t("landing.resources.card.readGuide")}: ${t(resource.title)}`}
                  >
                    {t("landing.resources.card.readGuide")}
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:scale-x-[-1] rtl:group-hover:-translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </SpotlightCard>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}