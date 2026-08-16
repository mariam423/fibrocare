"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { QuotesIcon } from "@hugeicons/core-free-icons";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { MaskedReveal } from "@/components/ui/MaskedReveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

interface Testimonial {
  quote: TranslationKey;
  name: TranslationKey;
  role: TranslationKey;
  initials: string;
  tint: string;
  featured?: boolean;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "landing.testimonials.q1",
    name: "landing.testimonials.amiraName",
    role: "landing.testimonials.amiraRole",
    initials: "AH",
    tint: "oklab(0.6 0.06 280)",
    featured: true,
  },
  {
    quote: "landing.testimonials.q2",
    name: "landing.testimonials.nourName",
    role: "landing.testimonials.nourRole",
    initials: "NS",
    tint: "oklab(0.55 0.05 150)",
  },
  {
    quote: "landing.testimonials.q3",
    name: "landing.testimonials.monaName",
    role: "landing.testimonials.monaRole",
    initials: "MK",
    tint: "oklab(0.58 0.06 45)",
  },
];

function QuoteCard({ t: testimonial, index }: { t: Testimonial; index: number }) {
  const { t } = useLanguage();
  return (
    <ScrollReveal delay={index * 0.1} className="h-full">
      <SpotlightCard
        as="figure"
        className={
          testimonial.featured
            ? "surface-crisp hover-lift glow-card flex h-full flex-col justify-between rounded-3xl p-7 sm:p-10"
            : "surface-crisp hover-lift glow-card flex h-full flex-col justify-between rounded-3xl p-6 sm:p-8"
        }
      >
        <div>
          <HugeiconsIcon
            icon={QuotesIcon}
            className={
              testimonial.featured
                ? "h-8 w-8 text-primary/30"
                : "h-6 w-6 text-primary/25"
            }
            aria-hidden="true"
          />
          <blockquote
            className={
              testimonial.featured
                ? "mt-5 text-xl leading-relaxed text-foreground sm:text-2xl"
                : "mt-4 text-[15px] leading-relaxed text-foreground"
            }
          >
            &ldquo;{t(testimonial.quote)}&rdquo;
          </blockquote>
        </div>
        <figcaption className="mt-7 flex items-center gap-3 border-t border-border pt-5">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-foreground shadow-beautiful-sm ring-1 ring-border backdrop-blur-sm"
            style={{ backgroundColor: testimonial.tint }}
          >
            {testimonial.initials}
          </span>
          <span>
            <span className="block text-sm font-semibold text-foreground">
              {t(testimonial.name)}
            </span>
            <span className="block text-[13px] text-muted-foreground">
              {t(testimonial.role)}
            </span>
          </span>
        </figcaption>
      </SpotlightCard>
    </ScrollReveal>
  );
}

export function Testimonials() {
  const { t } = useLanguage();
  const [featured, ...rest] = TESTIMONIALS;

  return (
    <section
      id="stories"
      className="px-4 py-16 sm:px-6 md:py-20 lg:px-8"
      aria-labelledby="stories-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <ScrollReveal>
            <h2
              id="stories-heading"
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              <MaskedReveal text={t("landing.testimonials.heading")} />
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("landing.testimonials.copy")}
            </p>
          </ScrollReveal>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <QuoteCard t={featured} index={0} />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
            {rest.map((t, i) => (
              <QuoteCard key={t.name} t={t} index={i + 1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
