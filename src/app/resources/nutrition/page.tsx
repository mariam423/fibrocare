"use client";

import React, { useMemo } from "react";
import {
  AppleIcon,
  Alert01Icon,
  DropletIcon,
  CookingPotIcon,
} from "@hugeicons/core-free-icons";
import AppHeader from "@/components/layout/AppHeader";
import { RouteTransition } from "@/components/ui/RouteTransition";
import {
  ContentPageLayout,
  type ContentSection,
} from "@/components/resources/ContentPageLayout";
import { SafeFoodBookmark } from "@/components/resources/SafeFoodBookmark";
import { TriggerFoodSwap } from "@/components/resources/TriggerFoodSwap";
import { useLanguage } from "@/context/LanguageContext";
import {
  PAGE_TAKEAWAYS,
  groundingChunk,
  groundingTakeaway,
} from "@/lib/resources/engine";

export default function NutritionPage() {
  const { t } = useLanguage();

  const takeaway = useMemo(
    () => ({
      bullets: PAGE_TAKEAWAYS.nutrition.bullets,
      chunk: groundingTakeaway("nutrition"),
    }),
    []
  );

  // Verified-source citations — retrieved through the local RAG pipeline,
  // null → unverified (safe offline fallback).
  const dietChunk = useMemo(
    () => groundingChunk("diet-anti-inflammatory"),
    []
  );
  const hydrationChunk = useMemo(() => groundingChunk("hydration-fatigue"), []);

  const sections: ContentSection[] = [
    {
      title: t("nutrition.goodFoods"),
      icon: AppleIcon,
      content: t("nutrition.goodFoodsContent"),
      plainContent: t("nutrition.goodFoodsPlain"),
      chunk: dietChunk,
      highlights: [
        t("nutrition.goodFoodsHighlight.1"),
        t("nutrition.goodFoodsHighlight.2"),
        t("nutrition.goodFoodsHighlight.3"),
      ],
      tags: ["nutrition.tag.goodFoods.1", "nutrition.tag.goodFoods.2"],
      action: <SafeFoodBookmark />,
    },
    {
      title: t("nutrition.triggers"),
      icon: Alert01Icon,
      content: t("nutrition.triggersContent"),
      plainContent: t("nutrition.triggersPlain"),
      chunk: dietChunk,
      tags: ["nutrition.tag.triggers.1", "nutrition.tag.triggers.2"],
      action: <TriggerFoodSwap />,
    },
    {
      title: t("nutrition.recipes"),
      icon: CookingPotIcon,
      content: t("nutrition.recipesContent"),
      plainContent: t("nutrition.recipesPlain"),
      chunk: dietChunk,
      tags: ["nutrition.tag.recipes.1", "nutrition.tag.recipes.2"],
    },
    {
      title: t("nutrition.hydration"),
      icon: DropletIcon,
      content: t("nutrition.hydrationContent"),
      plainContent: t("nutrition.hydrationPlain"),
      chunk: hydrationChunk,
      tags: ["nutrition.tag.hydration.1", "nutrition.tag.hydration.2"],
    },
  ];

  return (
    <RouteTransition>
    <div className="min-h-[100dvh]">
      <AppHeader backHref="/resources" backLabel={t("nav.backToDashboard")} />
      <main className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 pb-48 mb-20">
        <ContentPageLayout
          titleKey="nutrition.title"
          subtitleKey="nutrition.subtitle"
          icon={AppleIcon}
          sections={sections}
          takeaway={takeaway}
        />
      </main>
    </div>
    </RouteTransition>
  );
}
