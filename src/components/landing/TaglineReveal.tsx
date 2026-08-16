"use client";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { MaskedReveal } from "@/components/ui/MaskedReveal";
import { useLanguage } from "@/context/LanguageContext";

export function TaglineReveal() {
  const { t } = useLanguage();

  return (
    <section className="px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal>
          <span className="inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.18em] text-primary">
            <span className="h-px w-8 bg-primary/50" aria-hidden="true" />
            {t("landing.tagline.eyebrow")}
          </span>
        </ScrollReveal>

        <h2 className="mt-8 text-balance text-3xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
          <MaskedReveal text={t("landing.tagline.heading")} amount={0.45} />
        </h2>

        <ScrollReveal delay={0.15}>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            {t("landing.tagline.copy")}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
