"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { QuotesIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

const DAILY_QUOTE_KEYS: TranslationKey[] = [
  "quotes.quote1",
  "quotes.quote2",
  "quotes.quote3",
  "quotes.quote4",
  "quotes.quote5",
  "quotes.quote6",
  "quotes.quote7",
  "quotes.quote8",
  "quotes.quote9",
  "quotes.quote10",
  "quotes.quote11",
  "quotes.quote12",
];

export function DailyQuoteWidget() {
  const { t } = useLanguage();
  const [quoteKey] = useState<TranslationKey>(() => {
    const dayIndex = Math.floor(Date.now() / 86_400_000);
    return DAILY_QUOTE_KEYS[dayIndex % DAILY_QUOTE_KEYS.length];
  });

  return (
    <DepthCard tilt={3} delay={0.12} float>
      <Card className="h-full overflow-hidden">
        <CardContent>
          <div className="flex items-start gap-3">
            <div className="icon-badge h-10 w-10 shrink-0 rounded-xl">
              <HugeiconsIcon
                icon={QuotesIcon}
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>
            <div className="space-y-1.5 pt-0.5">
              <p className="text-sm font-medium text-foreground leading-relaxed">
                &ldquo;{t(quoteKey)}&rdquo;
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                {t("quotes.author")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DepthCard>
  );
}
