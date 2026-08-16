"use client";

import { Accordion } from "@base-ui/react/accordion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Message01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { MaskedReveal } from "@/components/ui/MaskedReveal";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

const FAQ_ITEMS: { question: TranslationKey; answer: TranslationKey }[] = [
  {
    question: "landing.faq.q1",
    answer: "landing.faq.a1",
  },
  {
    question: "landing.faq.q2",
    answer: "landing.faq.a2",
  },
  {
    question: "landing.faq.q3",
    answer: "landing.faq.a3",
  },
  {
    question: "landing.faq.q4",
    answer: "landing.faq.a4",
  },
  {
    question: "landing.faq.q5",
    answer: "landing.faq.a5",
  },
  {
    question: "landing.faq.q6",
    answer: "landing.faq.a6",
  },
];

export function FaqSection() {
  const { t } = useLanguage();
  return (
    <section
      id="faq"
      className="px-4 py-16 sm:px-6 md:py-20 lg:px-8"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16">
        <div>
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <span className="icon-badge h-10 w-10 rounded-xl">
                <HugeiconsIcon icon={Message01Icon} className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2
                id="faq-heading"
                className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                <MaskedReveal text={t("landing.faq.heading")} />
              </h2>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {t("landing.faq.copy")}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              href="/resources"
              className="surface-crisp glow-card hover-lift mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("landing.faq.resources")}
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                className="h-4 w-4 transition-transform duration-300 hover:translate-x-0.5 rtl:scale-y-[-1] rtl:hover:-translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.1}>
          <Accordion.Root className="surface-crisp divide-y divide-border overflow-hidden rounded-3xl">
            {FAQ_ITEMS.map((item, i) => (
              <Accordion.Item key={i} value={`item-${i}`}>
                <Accordion.Header>
                  <Accordion.Trigger
                    className={cn(
                      "group flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold text-foreground outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6",
                      "cursor-pointer select-none"
                    )}
                  >
                    {t(item.question)}
                    <HugeiconsIcon
                      icon={ArrowDown01Icon}
                      className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[panel-open]:rotate-180"
                      aria-hidden="true"
                    />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Panel className="overflow-hidden px-5 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-6">
                  {t(item.answer)}
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </ScrollReveal>
      </div>
    </section>
  );
}
