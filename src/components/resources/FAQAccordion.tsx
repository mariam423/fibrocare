"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  HelpCircleIcon,
  Search01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AiTakeawayBanner } from "@/components/resources/AiTakeawayBanner";
import { BdiText } from "@/components/resources/BdiText";
import { CitationBadge } from "@/components/resources/CitationBadge";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import type { RetrievedChunk } from "@/lib/ai/rag/types";
import {
  PAGE_TAKEAWAYS,
  groundingChunk,
  groundingTakeaway,
} from "@/lib/resources/engine";
import { searchFaq, type FaqSearchEntry } from "@/lib/resources/faqSearch";
import { cn } from "@/lib/utils";

interface FAQItem {
  questionKey: TranslationKey;
  answerKey: TranslationKey;
  /** Knowledge chunk id this answer is grounded in (optional citation). */
  chunkId?: string;
  /** Curated search keywords (EN + AR) for the semantic search. */
  keywords: string[];
}

const FAQ_ITEMS: FAQItem[] = [
  {
    questionKey: "faq.chronic",
    answerKey: "faq.chronicAnswer",
    keywords: ["chronic", "long term", "مزمن", "طويلة الأمد"],
  },
  {
    questionKey: "faq.cure",
    answerKey: "faq.cureAnswer",
    keywords: ["cure", "heal", "علاج نهائي", "شفاء"],
  },
  {
    questionKey: "faq.pregnancy",
    answerKey: "faq.pregnancyAnswer",
    keywords: ["pregnancy", "pregnant", "حمل", "حامل"],
  },
  {
    questionKey: "faq.exercise",
    answerKey: "faq.exerciseAnswer",
    chunkId: "exercise-protocols",
    keywords: [
      "exercise",
      "safe",
      "stiff",
      "stiffness",
      "movement",
      "walking",
      "yoga",
      "تمارين",
      "آمنة",
      "تيبس",
      "حركة",
    ],
  },
  {
    questionKey: "faq.diagnosis",
    answerKey: "faq.diagnosisAnswer",
    chunkId: "acr-criteria-2010",
    keywords: ["diagnosis", "diagnose", "test", "doctor", "تشخيص", "فحص", "طبيب"],
  },
  {
    questionKey: "faq.treatment",
    answerKey: "faq.treatmentAnswer",
    chunkId: "eular-management-overview",
    keywords: [
      "treatment",
      "medication",
      "therapy",
      "cbt",
      "drug",
      "علاج",
      "أدوية",
      "دواء",
    ],
  },
];

function AccordionItem({
  question,
  answer,
  chunk,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  chunk: RetrievedChunk | null;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4 text-start font-medium text-foreground transition-all duration-200 hover:text-primary hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg cursor-pointer active:scale-[0.99]"
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${question}`}
      >
        <span className="flex items-center gap-2 text-base">
          <BdiText text={question} />
          {chunk && <CitationBadge chunk={chunk} />}
        </span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
            isOpen && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>
      <motion.div
        id={`faq-panel-${question}`}
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
        role="region"
        aria-hidden={!isOpen}
      >
        <div className="pb-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-line pe-6">
          <BdiText text={answer} />
        </div>
      </motion.div>
    </div>
  );
}

export function FAQAccordion() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const takeaway = useMemo(
    () => ({
      bullets: PAGE_TAKEAWAYS.faq.bullets,
      chunk: groundingTakeaway("faq"),
    }),
    []
  );

  const chunks = useMemo(
    () =>
      FAQ_ITEMS.map((item) =>
        item.chunkId ? groundingChunk(item.chunkId) : null
      ),
    []
  );

  // Localized search corpus — rebuilt when the locale changes.
  const searchEntries = useMemo<FaqSearchEntry[]>(
    () =>
      FAQ_ITEMS.map((item) => ({
        question: t(item.questionKey),
        answer: t(item.answerKey),
        keywords: item.keywords,
      })),
    [t]
  );

  const searching = query.trim().length > 0;
  const results = useMemo(
    () => searchFaq(query, searchEntries),
    [query, searchEntries]
  );
  const visibleIndices = searching ? results : FAQ_ITEMS.map((_, i) => i);
  // While searching, the top match stays open so the answer is one tap away.
  const activeIndex = searching && results.length > 0 ? results[0] : openIndex;

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

      <AiTakeawayBanner bullets={takeaway.bullets} chunk={takeaway.chunk} />

      {/* Semantic AI search */}
      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("faq.searchPlaceholder")}
          aria-label={t("faq.searchAria")}
          className="h-11 w-full rounded-xl border border-emerald-500/20 bg-white/70 ps-9 pe-9 text-sm text-foreground placeholder:text-muted-foreground outline-none shadow-lg shadow-emerald-950/20 backdrop-blur-xl transition-all duration-200 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/25 dark:bg-slate-900/60"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={t("faq.searchClear")}
            className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <DepthCard tilt={2} delay={0.05}>
        <Card className="rounded-2xl border border-emerald-500/20 bg-white/70 shadow-lg shadow-emerald-950/20 backdrop-blur-xl transition-all duration-200 hover:scale-[1.01] hover:border-emerald-400/40 hover:shadow-emerald-950/30 dark:bg-slate-900/60">
          <CardContent className="px-6">
            {searching && results.length === 0 ? (
              <div className="py-10 text-center">
                <HugeiconsIcon
                  icon={HelpCircleIcon}
                  className="mx-auto h-10 w-10 text-muted-foreground/40"
                  aria-hidden="true"
                />
                <p className="mt-3 text-sm font-medium text-foreground">
                  {t("faq.noMatch")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("faq.noMatchHint")}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {visibleIndices.map((itemIndex) => {
                  const item = FAQ_ITEMS[itemIndex];
                  return (
                    <AccordionItem
                      key={item.questionKey}
                      question={t(item.questionKey)}
                      answer={t(item.answerKey)}
                      chunk={chunks[itemIndex]}
                      isOpen={activeIndex === itemIndex}
                      onToggle={() =>
                        setOpenIndex(openIndex === itemIndex ? null : itemIndex)
                      }
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </DepthCard>
    </ScrollReveal>
  );
}
