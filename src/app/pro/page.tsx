"use client";

import React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Stethoscope02Icon,
  Chatting01Icon,
  AiMagicIcon,
  CheckmarkCircle02Icon,
  FlashIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { WordReveal } from "@/components/ui/WordReveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useProFeature } from "@/hooks/useProFeature";

const FEATURES = [
  {
    badgeKey: "pro.page.doctorHubBadge" as const,
    titleKey: "pro.page.doctorHubTitle" as const,
    descKey: "pro.page.doctorHubDesc" as const,
    icon: Stethoscope02Icon,
    href: "/pro/doctor",
  },
  {
    badgeKey: "pro.page.consultationsBadge" as const,
    titleKey: "pro.page.consultationsTitle" as const,
    descKey: "pro.page.consultationsDesc" as const,
    icon: Chatting01Icon,
    href: "/pro/consultations",
  },
  {
    badgeKey: "pro.page.aiCopilotBadge" as const,
    titleKey: "pro.page.aiCopilotTitle" as const,
    descKey: "pro.page.aiCopilotDesc" as const,
    icon: AiMagicIcon,
    href: "/pro/consultations",
  },
] as const;

const PRICING_PERKS = [
  "pricing.pro.perk1",
  "pricing.pro.perk2",
  "pricing.pro.perk3",
  "pricing.pro.perk4",
  "pricing.pro.perk5",
  "pricing.pro.perk6",
  "pricing.pro.perk7",
] as const;

export default function ProLandingPage() {
  const { t } = useLanguage();
  const { isPro } = useProFeature();

  return (
    <RouteTransition>
      <main className="mx-auto max-w-4xl px-4 py-12 space-y-16">
        {/* Hero */}
        <ScrollReveal>
          <div className="text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <HugeiconsIcon icon={FlashIcon} className="h-3 w-3" aria-hidden="true" />
              {t("pricing.pro.badge")}
            </span>
            <WordReveal
              as="h1"
              text={t("pro.page.title")}
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            />
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {t("pro.page.subtitle")}
            </p>
          </div>
        </ScrollReveal>

        {/* Feature cards */}
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((feat, i) => (
            <ScrollReveal key={feat.titleKey} delay={i * 0.1}>
              <Link href={feat.href} className="group block h-full">
                <Card className="h-full transition-colors group-hover:bg-muted/50">
                  <CardContent className="flex flex-col gap-3 py-6">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                      <HugeiconsIcon icon={feat.icon} className="h-3 w-3" aria-hidden="true" />
                      {t(feat.badgeKey)}
                    </span>
                    <h2 className="text-lg font-semibold tracking-tight">
                      {t(feat.titleKey)}
                    </h2>
                    <p className="flex-1 text-sm text-muted-foreground">
                      {t(feat.descKey)}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                      {t("common.readMore")}
                      <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        {/* Pricing section */}
        <ScrollReveal delay={0.3}>
          <div className="mx-auto max-w-md">
            <Card className="border-primary/40 bg-primary/10 shadow-[0_0_30px_rgba(45,212,191,0.15)]">
              <CardContent className="p-6 space-y-4">
                <div className="text-center space-y-1">
                  <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground">
                    <HugeiconsIcon icon={FlashIcon} className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {t("pricing.pro.badge")}
                  </span>
                  <p className="text-sm font-semibold text-primary">{t("pricing.pro.name")}</p>
                  <p className="flex flex-wrap items-baseline justify-center gap-x-1 text-3xl font-bold">
                    <span dir="ltr" className="whitespace-nowrap tabular-nums">
                      {t("pricing.pro.price")}
                    </span>
                    <span className="text-sm font-normal text-muted-foreground whitespace-nowrap">
                      {t("pricing.pro.period")}
                    </span>
                  </p>
                </div>
                <ul className="space-y-2 text-sm">
                  {PRICING_PERKS.map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      {t(key)}
                    </li>
                  ))}
                </ul>
                {isPro ? (
                  <Button className="w-full rounded-xl" disabled>
                    {t("pricing.pro.badge")}
                  </Button>
                ) : (
                  <Button className="w-full rounded-xl" render={<Link href="/dashboard" />}>
                    {t("pro.page.cta")}
                  </Button>
                )}
                <p className="text-center text-xs text-muted-foreground">
                  {t("pricing.footnote")}
                </p>
              </CardContent>
            </Card>
          </div>
        </ScrollReveal>
      </main>
    </RouteTransition>
  );
}
