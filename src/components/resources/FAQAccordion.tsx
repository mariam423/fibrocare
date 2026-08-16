"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, HelpCircleIcon } from "@hugeicons/core-free-icons";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface FAQItem {
  questionKey: TranslationKey;
  answerKey: TranslationKey;
}

const FAQ_ITEMS: FAQItem[] = [
  { questionKey: "faq.chronic", answerKey: "faq.chronicAnswer" },
  { questionKey: "faq.cure", answerKey: "faq.cureAnswer" },
  { questionKey: "faq.pregnancy", answerKey: "faq.pregnancyAnswer" },
  { questionKey: "faq.exercise", answerKey: "faq.exerciseAnswer" },
  { questionKey: "faq.diagnosis", answerKey: "faq.diagnosisAnswer" },
  { questionKey: "faq.treatment", answerKey: "faq.treatmentAnswer" },
];

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4 text-left font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="text-base">{question}</span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
        role="region"
      >
        <div className="pb-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {answer}
        </div>
      </div>
    </div>
  );
}

export function FAQAccordion() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ScrollReveal as="section" className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <HugeiconsIcon icon={HelpCircleIcon} className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {t("faq.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("faq.subtitle")}
          </p>
        </div>
      </div>

      <DepthCard tilt={2} delay={0.05}>
        <Card className="border-none shadow-depth-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem
                  key={index}
                  question={t(item.questionKey)}
                  answer={t(item.answerKey)}
                  isOpen={openIndex === index}
                  onToggle={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </DepthCard>
    </ScrollReveal>
  );
}
