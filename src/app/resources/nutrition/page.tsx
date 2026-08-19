"use client";

import React from "react";
import {
  AppleIcon,
  Alert01Icon,
  DropletIcon,
  CookingPotIcon,
} from "@hugeicons/core-free-icons";
import AppHeader from "@/components/layout/AppHeader";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { ContentPageLayout } from "@/components/resources/ContentPageLayout";
import { useLanguage } from "@/context/LanguageContext";

export default function NutritionPage() {
  const { t, locale } = useLanguage();

  const sections = [
    {
      title: t("nutrition.goodFoods"),
      icon: AppleIcon,
      content: locale === "ar"
        ? "الأطعمة التي يمكن أن تساعد في تقليل الأعراض:\n\nالأسماك الدهنية (سلمون، سردين، تونة): غنية بأوميغا 3 التي تقلل الالتهاب.\n\nالفواكه والخضروات الملونة: مليئة بمضادات الأكسدة.\n\nالمكسرات والبذور: مصدر صحي للدهون والبروتين.\n\nالحبوب الكاملة: توفر طاقة مستدامة.\n\nالأطعمة المخمرة (الزبادي، الكيمتشي): تدعم صحة الأمعاء.\n\nالزبادي: يدعم صحة الجهاز الهضمي.\n\nزيت الزيتون: دهون أحادية غير مشبعة مفيدة."
        : "Foods that may help reduce symptoms:\n\nFatty fish (salmon, sardines, tuna): Rich in omega-3 fatty acids that reduce inflammation.\n\nColorful fruits and vegetables: Packed with antioxidants.\n\nNuts and seeds: Healthy source of fats and protein.\n\nWhole grains: Provide sustained energy.\n\nFermented foods (yogurt, kimchi): Support gut health.\n\nOlive oil: Healthy monounsaturated fats.",
      highlights: locale === "ar"
        ? ["سمك السلمون والسردين", "الفواكه والخضروات الملونة", "المكسرات والحبوب الكاملة"]
        : ["Salmon and sardines", "Colorful fruits and vegetables", "Nuts and whole grains"],
    },
    {
      title: t("nutrition.triggers"),
      icon: Alert01Icon,
      content: locale === "ar"
        ? "الأطعمة التي قد تُفاقم الأعراض:\n\nالأطعمة المصنعة: تحتوي على مكونات قد تزيد الالتهاب.\n\nالسكر المضاف: يسبب تقلبات في مستويات الطاقة.\n\nالكافيين: يمكن أن يُفاقم الألم ويعيق النوم.\n\nالكحول: يُضعف جودة النوم ويسبب الجفاف.\n\nالألوان الصناعية والمحسنات: قد تزيد الحساسية.\n\nالأطعمة الدسمة: قد تزيد الالتهاب.\n\nالأطعمة المُبردة: قد تحتوي على مكونات مُحفزة."
        : "Foods that may worsen symptoms:\n\nProcessed foods: Contain ingredients that may increase inflammation.\n\nAdded sugars: Cause energy level fluctuations.\n\nCaffeine: Can worsen pain and interfere with sleep.\n\nAlcohol: Impairs sleep quality and causes dehydration.\n\nArtificial colors and additives: May increase sensitivity.\n\nFatty foods: May increase inflammation.\n\nCold foods: May contain triggering ingredients.",
    },
    {
      title: t("nutrition.recipes"),
      icon: CookingPotIcon,
      content: locale === "ar"
        ? "أفكار وجبات صديقة لالتهاب العضلات الليفية:\n\nالإفطار: شوفان مع مكسرات وفواكه طازجة وزبادي.\n\nالغداء: سلطة سلمون مشوي مع أرز بني وخضروات.\n\nالعشاء: صدور دجاج مشوية مع بطاطا حلوة وبروكلي.\n\nالوجبات الخفيفة: مكسرات وخضروات مع حمص.\n\nالمشروبات: شاي أخضر أو شاي الزنجبيل الدافئ.\n\nالعصائر: عصير طازج من البرتقال والجزر."
        : "Fibromyalgia-friendly meal ideas:\n\nBreakfast: Oatmeal with nuts, fresh fruit, and yogurt.\n\nLunch: Grilled salmon salad with brown rice and vegetables.\n\nDinner: Grilled chicken breast with sweet potato and broccoli.\n\nSnacks: Nuts, vegetables with hummus.\n\nBeverages: Green tea or warm ginger tea.\n\nJuices: Fresh orange and carrot juice.",
    },
    {
      title: t("nutrition.hydration"),
      icon: DropletIcon,
      content: locale === "ar"
        ? "الترطيب ضروري لإدارة أعراض التهاب العضلات الليفية:\n\nاستهدف 8-10 أكواب من الماء يوميًا.\n\nالماء الدافئ مع الليمون يمكن أن يساعد في الهضم.\n\nاشرب الماء بانتظام بدلاً من كميات كبيرة دفعة واحدة.\n\nتجنب المشروبات الغازية والعصائر المحتوية على سكر مضاف.\n\nالشاي الأخضر أو شاي الأعشاب يمكن أن يكون بديلًا صحيًا.\n\nراقب لون البول للتأكد من الترطيب الكافي."
        : "Hydration is essential for managing fibromyalgia symptoms:\n\nAim for 8-10 glasses of water daily.\n\nWarm water with lemon can help with digestion.\n\nDrink water regularly instead of large amounts at once.\n\nAvoid sugary sodas and juices with added sugar.\n\nGreen tea or herbal tea can be a healthy alternative.\n\nMonitor urine color to ensure adequate hydration.",
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
        />
      </main>
    </div>
    </RouteTransition>
  );
}
