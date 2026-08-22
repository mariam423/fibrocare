"use client";

/**
 * Featured quick-access card for the Somatic Toolkit, shown right under the
 * landing hero. Signed-out visitors who tap it land on the sign-in page and
 * are redirected back to /toolkit after authenticating.
 */

import React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlaySquareIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";

export function ToolkitQuickAccess() {
  const { t } = useLanguage();

  return (
    <section className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8" aria-label={t("dashboard.toolkitCard.title")}>
      <Link
        href="/toolkit"
        className="group block rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-6 transition-all hover:border-primary/50 hover:shadow-[0_0_32px_rgba(45,212,191,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15">
              <HugeiconsIcon icon={PlaySquareIcon} className="h-6 w-6 text-primary" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-bold text-foreground">
                {t("dashboard.toolkitCard.title")}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {t("dashboard.toolkitCard.desc")}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform group-hover:-translate-y-0.5">
            {t("dashboard.toolkitCard.cta")}
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="h-4 w-4 rtl:rotate-180"
              aria-hidden="true"
            />
          </span>
        </div>
      </Link>
    </section>
  );
}
