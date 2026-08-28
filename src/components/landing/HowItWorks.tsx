"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ClipboardIcon,
  ChartHistogramIcon,
  File01Icon,
} from "@hugeicons/core-free-icons";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { MaskedReveal } from "@/components/ui/MaskedReveal";
import { cn } from "@/lib/utils";

const STEPS: { number: string; title: TranslationKey; copy: TranslationKey; icon: IconSvgElement; illustration: string }[] = [
  {
    number: "01",
    title: "landing.how.step1Title",
    copy: "landing.how.step1Copy",
    icon: ClipboardIcon,
    illustration: "/images/medical/daily-checkin.svg",
  },
  {
    number: "02",
    title: "landing.how.step2Title",
    copy: "landing.how.step2Copy",
    icon: ChartHistogramIcon,
    illustration: "/images/medical/pattern-triggers.svg",
  },
  {
    number: "03",
    title: "landing.how.step3Title",
    copy: "landing.how.step3Copy",
    icon: File01Icon,
    illustration: "/images/medical/care-summary.svg",
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

        <div className="mt-14 space-y-20">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isEven = i % 2 === 0;
            return (
              <ScrollReveal as="div" key={step.number} delay={i * 0.08}>
                <div className={cn(
                  "grid grid-cols-1 md:grid-cols-2 gap-12 items-center",
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                )}>
                  <div className={cn(
                    "space-y-4",
                    isEven ? "md:order-1" : "md:order-2"
                  )}>
                    <div className="flex items-center gap-4">
                      <span className="font-heading text-4xl font-bold tracking-tight text-primary/30">
                        {step.number}
                      </span>
                      <span className="icon-badge h-12 w-12 rounded-2xl">
                        <HugeiconsIcon icon={Icon} className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                      {t(step.title)}
                    </h3>
                    <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                      {t(step.copy)}
                    </p>
                  </div>
                  <div className={cn(
                    "relative aspect-video w-full overflow-hidden rounded-3xl border border-border bg-background/50 shadow-beautiful-md backdrop-blur-sm",
                    isEven ? "md:order-2" : "md:order-1"
                  )}>
                    <Image
                      src={step.illustration}
                      alt={t(step.title)}
                      fill
                      className="object-contain p-6"
                    />
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-primary/5 to-transparent" />
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
