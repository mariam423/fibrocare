"use client";

import React, { useMemo } from "react";
import {
  RunningShoesIcon,
  Yoga01Icon,
  FootprintsIcon,
  SwimmingIcon,
  LightbulbOffIcon,
} from "@hugeicons/core-free-icons";
import AppHeader from "@/components/layout/AppHeader";
import { RouteTransition } from "@/components/ui/RouteTransition";
import {
  ContentPageLayout,
  type ContentSection,
} from "@/components/resources/ContentPageLayout";
import { ExerciseTimer } from "@/components/resources/ExerciseTimer";
import { useLanguage } from "@/context/LanguageContext";
import {
  PAGE_TAKEAWAYS,
  groundingChunk,
  groundingTakeaway,
} from "@/lib/resources/engine";

export default function ExercisesPage() {
  const { t } = useLanguage();

  const takeaway = useMemo(
    () => ({
      bullets: PAGE_TAKEAWAYS.exercises.bullets,
      chunk: groundingTakeaway("exercises"),
    }),
    []
  );

  // Verified-source citations — retrieved through the local RAG pipeline,
  // null → unverified (safe offline fallback).
  const exerciseChunk = useMemo(() => groundingChunk("exercise-protocols"), []);
  const mindBodyChunk = useMemo(
    () => groundingChunk("complementary-approaches"),
    []
  );

  const sections: ContentSection[] = [
    {
      title: t("exercises.stretching"),
      icon: Yoga01Icon,
      content: t("exercises.stretchingContent"),
      plainContent: t("exercises.stretchingPlain"),
      chunk: exerciseChunk,
      image: "/images/%D8%AA%D9%85%D8%A7%D8%B1%D9%8A%D9%86%20%D8%A7%D9%84%D8%AA%D9%85%D8%B7%D9%8A%D8%B7s.jpg",
      imageFit: "contain",
      highlights: [
        t("exercises.stretchingHighlight.1"),
        t("exercises.stretchingHighlight.2"),
        t("exercises.stretchingHighlight.3"),
      ],
      tags: ["exercises.tag.stretching.1", "exercises.tag.stretching.2"],
      action: (
        <ExerciseTimer
          durationSeconds={180}
          spoonCost={1}
          labelKey="exercises.timer.stretchingLabel"
        />
      ),
    },
    {
      title: t("exercises.yoga"),
      icon: Yoga01Icon,
      content: t("exercises.yogaContent"),
      plainContent: t("exercises.yogaPlain"),
      chunk: mindBodyChunk,
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
      tags: ["exercises.tag.yoga.1", "exercises.tag.yoga.2"],
    },
    {
      title: t("exercises.walking"),
      icon: FootprintsIcon,
      content: t("exercises.walkingContent"),
      plainContent: t("exercises.walkingPlain"),
      chunk: exerciseChunk,
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      tags: ["exercises.tag.walking.1", "exercises.tag.walking.2"],
      action: (
        <ExerciseTimer
          durationSeconds={300}
          spoonCost={2}
          labelKey="exercises.timer.walkingLabel"
        />
      ),
    },
    {
      title: t("exercises.swimming"),
      icon: SwimmingIcon,
      content: t("exercises.swimmingContent"),
      plainContent: t("exercises.swimmingPlain"),
      chunk: exerciseChunk,
      image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80",
      tags: ["exercises.tag.swimming.1", "exercises.tag.swimming.2"],
    },
    {
      title: t("exercises.tips"),
      icon: LightbulbOffIcon,
      content: t("exercises.tipsContent"),
      plainContent: t("exercises.tipsPlain"),
      chunk: exerciseChunk,
      image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80",
      tags: ["exercises.tag.tips.1", "exercises.tag.tips.2"],
    },
  ];

  return (
    <RouteTransition>
    <div>
      <AppHeader backHref="/resources" backLabel={t("nav.backToDashboard")} />
      <main className="container mx-auto max-w-4xl p-4 pt-[calc(env(safe-area-inset-top)+5rem)] sm:p-6 sm:pt-[calc(env(safe-area-inset-top)+6rem)] lg:p-8 pb-24 mb-10">
        <ContentPageLayout
          titleKey="exercises.title"
          subtitleKey="exercises.subtitle"
          icon={RunningShoesIcon}
          sections={sections}
          takeaway={takeaway}
        />
      </main>
    </div>
    </RouteTransition>
  );
}
