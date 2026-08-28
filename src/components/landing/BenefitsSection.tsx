"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ZapIcon,
  ChartHistogramIcon,
  File01Icon,
  FlowerIcon,
  Shield01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { MaskedReveal } from "@/components/ui/MaskedReveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Button } from "@/components/ui/button";
import { Pressable } from "@/components/ui/Pressable";
import { cn } from "@/lib/utils";

interface Benefit {
  title: TranslationKey;
  copy: TranslationKey;
  icon: IconSvgElement;
  image?: string;
  /** Optional small pill (e.g. "New") pinned to the top of the card. */
  pill?: TranslationKey;
  large?: boolean;
}

const BENEFITS: Benefit[] = [
  {
    title: "landing.benefits.checkinsTitle",
    copy: "landing.benefits.checkinsCopy",
    icon: ZapIcon,
    image: "/images/medical/daily-checkin.svg",
    pill: "landing.benefits.pill.core",
    large: true,
  },
  {
    title: "landing.benefits.patternsTitle",
    copy: "landing.benefits.patternsCopy",
    icon: ChartHistogramIcon,
    image: "/images/medical/pattern-triggers.svg",
  },
  {
    title: "landing.benefits.reportTitle",
    copy: "landing.benefits.reportCopy",
    icon: File01Icon,
    image: "/images/medical/care-summary.svg",
  },
  {
    title: "landing.benefits.toolsTitle",
    copy: "landing.benefits.toolsCopy",
    icon: FlowerIcon,
    image: "/images/medical/symptom-toolkit.svg",
    pill: "landing.benefits.pill.new",
  },
  {
    title: "landing.benefits.privacyTitle",
    copy: "landing.benefits.privacyCopy",
    icon: Shield01Icon,
    image: "/images/medical/privacy-shield.svg",
  },
];

function BenefitCard({ benefit, className }: { benefit: Benefit; className?: string }) {
  const { t } = useLanguage();
  const Icon = benefit.icon;
  return (
    <SpotlightCard
      as="article"
      className={cn(
        "surface-crisp hover-lift glow-card flex h-full flex-col overflow-hidden rounded-3xl border-border p-6 sm:p-8",
        benefit.large ? "min-h-[300px] justify-end" : "justify-between",
        className
      )}
    >
      <div className="flex flex-col h-full">
        {benefit.image && (
          <div className={cn(
            "relative mb-6 overflow-hidden rounded-2xl",
            benefit.large ? "h-40" : "h-24"
          )}>
            <Image
              src={benefit.image}
              alt={t(benefit.title)}
              fill
              className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
        )}
        <div className="flex items-start justify-between gap-4">
          <span className="icon-badge h-11 w-11 rounded-2xl transition-transform duration-300 ease-out hover:scale-105">
            <HugeiconsIcon icon={Icon} className="h-5 w-5" aria-hidden="true" />
          </span>
          {benefit.pill && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              {t(benefit.pill)}
            </span>
          )}
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {t(benefit.title)}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            {t(benefit.copy)}
          </p>
        </div>
      </div>
    </SpotlightCard>
  );
}

export function BenefitsSection() {
  const { t } = useLanguage();
  const [primary, ...rest] = BENEFITS;

  return (
    <section
      id="features"
      className="px-4 py-16 sm:px-6 md:py-20 lg:px-8"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.18em] text-primary">
              <span className="h-px w-8 bg-primary/50" aria-hidden="true" />
              {t("landing.nav.features")}
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2
              id="features-heading"
              className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]"
            >
              <MaskedReveal text={t("landing.benefits.heading")} />
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("landing.benefits.copy")}
            </p>
          </ScrollReveal>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
          <BenefitCard
            benefit={primary}
            className="md:col-span-2 lg:col-span-3"
          />
          <BenefitCard
            benefit={rest[0]}
            className="md:col-span-2 lg:col-span-2"
          />
          <BenefitCard
            benefit={rest[1]}
            className="md:col-span-2 lg:col-span-2"
          />
          <BenefitCard
            benefit={rest[2]}
            className="md:col-span-2 lg:col-span-2"
          />
          <BenefitCard
            benefit={rest[3]}
            className="md:col-span-2 lg:col-span-1"
          />
        </div>

        <ScrollReveal delay={0.15}>
          <div className="surface-crisp glow-card hover-lift mt-5 flex flex-col items-start justify-between gap-6 rounded-3xl p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                {t("landing.benefits.readyTitle")}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground sm:text-[15px]">
                {t("landing.benefits.readyCopy")}
              </p>
            </div>
            <Pressable hoverScale={1.02} tapScale={0.97} className="shrink-0 rounded-full">
              <Button
                size="lg"
                nativeButton={false}
                className="rounded-full"
                render={<Link href="/signup" />}
              >
                {t("landing.start")}
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  data-icon="inline-end"
                  className="rtl:scale-x-[-1]"
                  aria-hidden="true"
                />
              </Button>
            </Pressable>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
