"use client";

import React from "react";
import {
  RunningShoesIcon,
  Yoga01Icon,
  FootprintsIcon,
  SwimmingIcon,
  LightbulbOffIcon,
} from "@hugeicons/core-free-icons";
import AppHeader from "@/components/layout/AppHeader";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { ContentPageLayout } from "@/components/resources/ContentPageLayout";
import { useLanguage } from "@/context/LanguageContext";

export default function ExercisesPage() {
  const { t, locale } = useLanguage();

  const sections = [
    {
      title: t("exercises.stretching"),
      icon: Yoga01Icon,
      content: locale === "ar"
        ? "التمطيط اللطيف يقلل التيبس ويحسن المرونة:\n\nتمطيط الرقبة: أميل رأسك ببطء إلى كل جانب، احتفظ لمدة 15-30 ثانية.\n\nتمطيط الكتف: حرك كتفيك للأعلى ثم للخلف ببطء.\n\nتمطيط الظهر السفلي: اجلس على حافة الكرسي وميل للأمام بلطف.\n\nتمطيط الفخذ: وقف واحتفظ بقدم واحدة للخلف.\n\nتمطيط ربل الساق: وقف أمام جدار وادفع جدار ببطء.\n\nمدة: احتفظ بكل تمطيط لمدة 15-30 ثانية، تكرار 2-3 مرات.\n\nتنفس بعمق أثناء كل تمطيط."
        : "Gentle stretching reduces stiffness and improves flexibility:\n\nNeck stretch: Slowly tilt your head to each side, hold for 15-30 seconds.\n\nShoulder stretch: Roll your shoulders up and back slowly.\n\nLower back stretch: Sit on the edge of a chair and lean forward gently.\n\nHamstring stretch: Stand and hold one foot behind you.\n\nCalf stretch: Stand facing a wall and gently push against it.\n\nDuration: Hold each stretch for 15-30 seconds, repeat 2-3 times.\n\nBreathe deeply during each stretch.",
      highlights: locale === "ar"
        ? ["15-30 ثانية لكل تمطيط", "تنفس بعمق", "لا تتحرك بسرعة"]
        : ["15-30 seconds per stretch", "Breathe deeply", "Move slowly"],
    },
    {
      title: t("exercises.yoga"),
      icon: Yoga01Icon,
      content: locale === "ar"
        ? "اليوجا الاسترخائية ممتازة لالتهاب العضلات الليفية:\n\nوضعية الطفل: استرخِ على ركبتيك مع مد الذراعين للأمام.\n\nالقطة-البقرة: تحرك ببطء بين وضعية الانثناء والثني للخلف.\n\nوضعية الشجرة: وقف على قدم واحدة مع توازن.\n\nالتمطيط الجانبي: وقف وميل جانبيًا ببطء.\n\nوضعية الطفل المبتسم: استرخِ على ظهرك مع رفع الركبتين.\n\nيوجا التنفس: تمارين تنفس بسيطة للاسترخاء.\n\nيجب أن تكون الحركات لطيفة وبدون ألم."
        : "Restorative yoga is excellent for fibromyalgia:\n\nChild's Pose: Rest on your knees with arms extended forward.\n\nCat-Cow: Slowly move between arching and rounding your back.\n\nTree Pose: Stand on one foot for balance.\n\nSide stretch: Stand and lean sideways slowly.\n\nHappy Baby Pose: Lie on your back with knees raised.\n\nBreathing exercises: Simple breathing techniques for relaxation.\n\nMovements should be gentle and pain-free.",
    },
    {
      title: t("exercises.walking"),
      icon: FootprintsIcon,
      content: locale === "ar"
        ? "المشي منخفض التأثير وممتاز للتمارين اليومية:\n\nابدأ بـ 5-10 دقائق يوميًا.\n\nزد المدة تدريجيًا بمعدل 1-2 دقيقة كل أسبوع.\n\nاستهدف 20-30 دقيقة في الجلسة الواحدة.\n\nالمشي على أسطح مسطحة أفضل في البداية.\n\nارتدِ حذاءً مريحًا بدعم جيد.\n\nاستخدم عكاز المشي إذا لزم الأمر.\n\nالمشي في الصباح الباكر أو المساء يتجنب الحرارة.\n\nاستمع لجسمك وتوقف إذا شعرت بألم."
        : "Low-impact walking is excellent for daily exercise:\n\nStart with 5-10 minutes daily.\n\nGradually increase duration by 1-2 minutes per week.\n\nAim for 20-30 minutes per session.\n\nFlat surfaces are best when starting.\n\nWear comfortable, supportive shoes.\n\nUse a walking cane if needed.\n\nWalking in early morning or evening avoids heat.\n\nListen to your body and stop if you feel pain.",
    },
    {
      title: t("exercises.swimming"),
      icon: SwimmingIcon,
      content: locale === "ar"
        ? "التمارين المائية ممتازة لالتهاب العضلات الليفية:\n\nالماء الدافئ (84-88 درجة فهرنهايت) مريح للعضلات.\n\nتمارين المشي في الماء: مشي في الماء العميق.\n\nتمارين الإطالة في الماء: حركات لطيفة في الماء.\n\nالسباحة الخفيفة: سباحة بضربات بطة.\n\nتمارين الماء الدافئ: في بركة دافئة.\n\nفترة: ابدأ بـ 10-15 دقيقة وزد تدريجيًا.\n\nالسباحة تقلل الضغط على المفاصل وتحسن المرونة."
        : "Aquatic exercise is excellent for fibromyalgia:\n\nWarm water (84-88°F) is soothing for muscles.\n\nWater walking: Walking in chest-deep water.\n\nWater stretching: Gentle movements in water.\n\nLight swimming: Swimming with easy strokes.\n\nWarm pool exercises: In a heated pool.\n\nDuration: Start with 10-15 minutes and gradually increase.\n\nSwimming reduces joint pressure and improves flexibility.",
    },
    {
      title: t("exercises.tips"),
      icon: LightbulbOffIcon,
      content: locale === "ar"
        ? "نصائح مهمة لممارسة التمارين مع التهاب العضلات الليفية:\n\nابدأ ببطء: ابدأ بفترات قصيرة وزد تدريجيًا.\n\nاستمع لجسمك: توقف إذا شعرت بألم أكثر من المعتاد.\n\nالانتظام أهم من الشدة: التمارين المنتظمة اللطيفة أفضل من التمارين العنيفة.\n\nالراحة بعد التمرين: خذ وقتًا كافيًا للاسترخاء.\n\nالتمطيط قبل وبعد: داوم على التمطيط قبل وبعد التمرين.\n\nتجنب التمارين في أيام التفاقم.\n\nاشرب الماء بانتظام.\n\nتحدث مع طبيبك قبل بدء أي برنامج تمارين جديد."
        : "Important tips for exercising with fibromyalgia:\n\nStart slowly: Begin with short sessions and increase gradually.\n\nListen to your body: Stop if you feel more pain than usual.\n\nConsistency over intensity: Regular gentle exercise is better than intense workouts.\n\nRest after exercise: Take adequate time to recover.\n\nStretch before and after: Always stretch before and after exercise.\n\nAvoid exercise during flare-ups.\n\nDrink water regularly.\n\nTalk to your doctor before starting any new exercise program.",
    },
  ];

  return (
    <RouteTransition>
    <div className="min-h-[100dvh]">
      <AppHeader backHref="/resources" backLabel={t("nav.backToDashboard")} />
      <main className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 pb-48 mb-20">
        <ContentPageLayout
          titleKey="exercises.title"
          subtitleKey="exercises.subtitle"
          icon={RunningShoesIcon}
          sections={sections}
        />
      </main>
    </div>
    </RouteTransition>
  );
}
