"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ClipboardIcon,
  ChartHistogramIcon,
  File01Icon,
} from "@hugeicons/core-free-icons";

import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { MaskedReveal } from "@/components/ui/MaskedReveal";
import { cn } from "@/lib/utils";

const STEPS: { number: string; title: TranslationKey; copy: TranslationKey; icon: IconSvgElement }[] = [
  {
    number: "01",
    title: "landing.how.step1Title",
    copy: "landing.how.step1Copy",
    icon: ClipboardIcon,
  },
  {
    number: "02",
    title: "landing.how.step2Title",
    copy: "landing.how.step2Copy",
    icon: ChartHistogramIcon,
  },
  {
    number: "03",
    title: "landing.how.step3Title",
    copy: "landing.how.step3Copy",
    icon: File01Icon,
  },
];

export function HowItWorks() {
  const { t } = useLanguage();
  return (
    <section
      id="how"
      className="border-y border-border bg-muted/40 px-4 py-16 sm:px-6 md:py-20 lg:px-8 dark:border-white/10 dark:bg-background/40 dark:backdrop-blur-xl"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <ScrollReveal>
            <h2
              id="how-heading"
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              <MaskedReveal text={t("landing.how.heading")} />
            </h2>
          </ScrollReveal>
        </div>

        <ol className="mt-14 space-y-10">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <ScrollReveal as="li" key={step.number} delay={i * 0.08}>
                <div className="group grid grid-cols-[auto_1fr] items-start gap-6 sm:grid-cols-[120px_auto_1fr] sm:gap-8">
                  <span
                    aria-hidden="true"
                    className="hidden pt-1 font-heading text-5xl font-bold tracking-tight text-primary/25 transition-colors duration-300 group-hover:text-primary/45 sm:block"
                  >
                    {step.number}
                  </span>
                  <span className="icon-badge h-12 w-12 rounded-2xl transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-[1.04]">
                    <HugeiconsIcon icon={Icon} className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className={cn("border-s border-border ps-6 transition-colors duration-300 group-hover:border-primary/25 sm:ps-8")}>
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">
                      {t(step.title)}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                      {t(step.copy)}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
