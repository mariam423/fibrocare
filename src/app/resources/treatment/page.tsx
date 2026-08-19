"use client";

import React from "react";
import {
  PillIcon,
  TreatmentIcon,
  RunningShoesIcon,
  Brain01Icon,
  Moon01Icon,
  HeartIcon,
} from "@hugeicons/core-free-icons";
import AppHeader from "@/components/layout/AppHeader";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { ContentPageLayout } from "@/components/resources/ContentPageLayout";
import { useLanguage } from "@/context/LanguageContext";

export default function TreatmentPage() {
  const { t, locale } = useLanguage();

  const sections = [
    {
      title: t("treatment.medications"),
      icon: PillIcon,
      content: locale === "ar"
        ? "تُستخدم الأدوية لتقليل الألم وتحسين النوم. الأدوية الشائعة تشمل:\n\nدولوكسيتين (Cymbalta): مضاد للاكتئاب يساعد في تقليل الألم المزمن.\n\nبريجابالين (Lyrica): مضاد للنوبات يقلل من إشارات الألم.\n\nميلناسيبران (Savella): مضاد للاكتئاب مخصص لالتهاب العضلات الليفية.\n\nأسيتامينوفين أو مضادات الالتهاب غير الستيرويدية (NSAIDs): يمكن أن تساعد في تخفيف الألم الخفيف.\n\nمن المهم العمل مع طبيبك للعثور على الدواء المناسب والجرعة."
        : "Medications are used to reduce pain and improve sleep. Common medications include:\n\nDuloxetine (Cymbalta): An antidepressant that helps reduce chronic pain.\n\nPregabalin (Lyrica): An anticonvulsant that reduces pain signals.\n\nMilnacipran (Savella): An antidepressant specifically for fibromyalgia.\n\nAcetaminophen or NSAIDs: Can help with mild pain relief.\n\nWork with your doctor to find the right medication and dosage.",
    },
    {
      title: t("treatment.therapy"),
      icon: TreatmentIcon,
      content: locale === "ar"
        ? "العلاج الطبيعي يلعب دورًا مهمًا في إدارة التهاب العضلات الليفية:\n\nالتمارين المتدرجة: تقوية العضلات تدريجيًا مع تجنب الإجهاد.\n\nالتمطيط: تحسين المرونة وتقليل التيبس الصباحي.\n\nالعلاج بالماء الدافئ: تخفيف الألم وتحسين الحركة.\n\nالعلاج الحركي: تعلم حركات آمنة للنشاط اليومي.\n\nالعلاج الطبيعي يمكن أن يُعلمك تقنيات لتقليل الألم وتحسين الوظيفة اليومية."
        : "Physical therapy plays an important role in managing fibromyalgia:\n\nProgressive exercises: Gradually strengthening muscles while avoiding strain.\n\nStretching: Improving flexibility and reducing morning stiffness.\n\nWarm water therapy: Easing pain and improving movement.\n\nManual therapy: Hands-on techniques to reduce muscle tension.\n\nPhysical therapy can teach you techniques to reduce pain and improve daily function.",
    },
    {
      title: t("treatment.exercise"),
      icon: RunningShoesIcon,
      content: locale === "ar"
        ? "التمارين المنتظمة اللطيفة من أكثر العلاجات فعالية:\n\nالمشي: نشاط منخفض التأثير يمكن تخصيصه حسب قدرتك.\n\nالسباحة: ممتازة لأن الماء يدعم الجسم ويقلل الضغط.\n\nاليوجا: تجمع بين الحركة والتنفس والاسترخاء.\n\nالتمطيط: تقليل التيبس وتحسين المرونة.\n\nالتاي تشي: حركات بطيئة ومدروسة تحسن التوازن والمرونة.\n\nابدأ ببطء وزد من مستوى النشاط تدريجيًا."
        : "Regular gentle exercise is one of the most effective treatments:\n\nWalking: A low-impact activity you can customize to your ability.\n\nSwimming: Excellent because water supports your body and reduces pressure.\n\nYoga: Combines movement, breathing, and relaxation.\n\nStretching: Reduces stiffness and improves flexibility.\n\nTai Chi: Slow, deliberate movements that improve balance and flexibility.\n\nStart slowly and gradually increase your activity level.",
    },
    {
      title: t("treatment.stress"),
      icon: Brain01Icon,
      content: locale === "ar"
        ? "إدارة التوتر ضرورية لأن التوتر يمكن أن يُفاقم الأعراض:\n\nالتأمل والتنفس العميق: تقنيات بسيطة يمكن ممارستها يوميًا.\n\nالعلاج السلوكي المعرفي (CBT): يساعد في تغيير أنماط التفكير السلبية.\n\nإدارة الوقت: تجنب الحِمل الزائد وتحديد الأولويات.\n\nالدعم الاجتماعي: التواصل مع الأصدقاء والعائلة والمجتمع.\n\nالمنافذ الإبداعية: الكتابة والموسيقى والفنون."
        : "Stress management is essential because stress can worsen symptoms:\n\nMeditation and deep breathing: Simple techniques you can practice daily.\n\nCognitive Behavioral Therapy (CBT): Helps change negative thought patterns.\n\nTime management: Avoiding overload and setting priorities.\n\nSocial support: Connecting with friends, family, and community.\n\nCreative outlets: Writing, music, and arts.",
    },
    {
      title: t("treatment.sleep"),
      icon: Moon01Icon,
      content: locale === "ar"
        ? "تحسين جودة النوم ضروري للأمان والراحة:\n\nروتين نوم ثابت: اذهب إلى النوم واستيقظ في نفس الوقت.\n\nبيئة مريحة: غرفة مظلمة وباردة وهادئة.\n\nتجنب الكافيين: خاصة في المساء.\n\nاسترخاء قبل النوم: قراءة أو الاستماع إلى موسيقى هادئة.\n\nال limitations: قلل من الشاشات قبل النوم."
        : "Improving sleep quality is essential for rest and recovery:\n\nConsistent sleep routine: Go to bed and wake up at the same time.\n\nComfortable environment: Dark, cool, and quiet room.\n\nAvoid caffeine: Especially in the evening.\n\nPre-sleep relaxation: Reading or listening to calming music.\n\nScreen limits: Reduce screen time before bed.",
    },
    {
      title: t("treatment.selfCare"),
      icon: HeartIcon,
      content: locale === "ar"
        ? "استراتيجيات الرعاية الذاتية تساعدك على إدارة أعراضك يوميًا:\n\nالتخطيط: تقسيم المهام الكبيرة إلى أجزاء أصغر.\n\nالراحة المجدولة: خذ استراحات منتظمة قبل أن تشعر بالإرهاق.\n\nالتسجيل: تتبع الأعراض والمحفزات.\n\nالعلاج بالماء الدافئ: استخدام الأكياس الدافئة أو الحمامات الدافئة.\n\nالتدفئة: ارتداء طبقات للحفاظ على حرارة الجسم."
        : "Self-care strategies help you manage your symptoms daily:\n\nPacing: Break large tasks into smaller parts.\n\nScheduled rest: Take regular breaks before you feel exhausted.\n\nTracking: Monitor symptoms and triggers.\n\nWarm therapy: Use warm packs or warm baths.\n\nHeat management: Wear layers to maintain body temperature.",
    },
  ];

  return (
    <RouteTransition>
    <div className="min-h-[100dvh]">
      <AppHeader backHref="/resources" backLabel={t("nav.backToDashboard")} />
      <main className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 pb-48 mb-20">
        <ContentPageLayout
          titleKey="treatment.title"
          subtitleKey="treatment.subtitle"
          icon={PillIcon}
          sections={sections}
        />
      </main>
    </div>
    </RouteTransition>
  );
}
