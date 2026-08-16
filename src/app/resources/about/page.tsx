"use client";

import React from "react";
import {
  Activity01Icon,
  BrainIcon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import AppHeader from "@/components/layout/AppHeader";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { ContentPageLayout } from "@/components/resources/ContentPageLayout";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
  const { t, locale } = useLanguage();

  const sections = [
    {
      title: t("about.overview"),
      icon: Activity01Icon,
      content: locale === "ar"
        ? "التهاب العضلات الليفية (Fibromyalgia) هو حالة مزمنة تسبب ألمًا واسع النطاق في العضلات والعظام، إلى جانب الإرهاق واضطرابات النوم ومشاكل إدراكية وأعراض أخرى. لا يوجد علاج معروف، لكن يمكن إدارة الأعراض بشكل فعال."
        : "Fibromyalgia is a chronic condition that causes widespread musculoskeletal pain, along with fatigue, sleep problems, cognitive difficulties, and other symptoms. While there is no known cure, symptoms can be effectively managed with the right approach.",
      highlights: locale === "ar"
        ? ["يؤثر على 2-4% من السكان", "يسبب ألمًا مزمنًا في جميع أنحاء الجسم", "يمكن إدارة الأعراض بفعالية"]
        : ["Affects 2-4% of the population", "Causes chronic widespread pain", "Symptoms can be effectively managed"],
    },
    {
      title: t("about.causes"),
      icon: AlertCircleIcon,
      content: t("about.causesDetail"),
    },
    {
      title: t("about.symptoms"),
      icon: BrainIcon,
      content: t("about.symptomsDetail"),
      highlights: locale === "ar"
        ? ["الألم المزمن الواسع", "الإرهاق المستمر", "صعوبات التركيز (ضباب الألياف)", "اضطرابات النوم"]
        : ["Chronic widespread pain", "Persistent fatigue", "Cognitive difficulties (fibro fog)", "Sleep disturbances"],
    },
  ];

  return (
    <RouteTransition>
    <div className="min-h-[100dvh]">
      <AppHeader backHref="/resources" backLabel={t("nav.backToDashboard")} />
      <main id="main-content" className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 pt-20 pb-48 mb-20">
        <ContentPageLayout
          titleKey="about.title"
          subtitleKey="about.subtitle"
          icon={Activity01Icon}
          sections={sections}
        />
      </main>
    </div>
    </RouteTransition>
  );
}
