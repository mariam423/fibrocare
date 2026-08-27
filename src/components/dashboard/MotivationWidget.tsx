"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { BookOpen01Icon, Refresh01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";

/** Content is intentionally cited and translated conservatively. */
type MotivationItem = {
  kind: "quran" | "hadith" | "story" | "wisdom";
  reference: string;
  ar: string;
  en: string;
};

const MOTIVATIONS: MotivationItem[] = [
  {
    kind: "quran",
    reference: "سُورَةُ الشَّرْحِ ٩٤:٥–٦",
    ar: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    en: "So, surely with hardship comes ease. Surely with hardship comes ease.",
  },
  {
    kind: "quran",
    reference: "سُورَةُ الْبَقَرَةِ ٢:٢٨٦",
    ar: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    en: "Allah does not burden a soul beyond what it can bear.",
  },
  {
    kind: "quran",
    reference: "سُورَةُ الزُّمَرِ ٣٩:٥٣",
    ar: "لَا تَقْنَطُوا مِنْ رَحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا",
    en: "Do not despair of the mercy of Allah. Indeed, Allah forgives all sins.",
  },
  {
    kind: "quran",
    reference: "سُورَةُ الرَّعْدِ ١٣:٢٨",
    ar: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    en: "Surely, in the remembrance of Allah do hearts find comfort.",
  },
  {
    kind: "quran",
    reference: "سُورَةُ الضُّحَى ٩٣:٣–٥",
    ar: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ ۝ وَلَلْآخِرَةُ خَيْرٌ لَكَ مِنَ الْأُولَىٰ ۝ وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ",
    en: "Your Lord has not abandoned you, nor has He become displeased. And the Hereafter is better for you than the first life. And your Lord is going to give you, and you will be satisfied.",
  },
  {
    kind: "hadith",
    reference: "صَحِيحُ مُسْلِمٍ ٢٩٩٩",
    ar: "عَجَبًا لِأَمْرِ الْمُؤْمِنِ، إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ، وَلَيْسَ ذَاكَ لِأَحَدٍ إِلَّا لِلْمُؤْمِنِ؛ إِنْ أَصَابَتْهُ سَرَّاءُ شَكَرَ فَكَانَ خَيْرًا لَهُ، وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ",
    en: "How wonderful is the affair of the believer. All of it is good: when ease comes, they are grateful; and when hardship comes, they are patient—and that is good for them.",
  },
  {
    kind: "hadith",
    reference: "صَحِيحُ الْبُخَارِيِّ ٥٦٤١، ٥٦٤٢",
    ar: "مَا يُصِيبُ الْمُسْلِمَ مِنْ نَصَبٍ وَلَا وَصَبٍ وَلَا هَمٍّ وَلَا حَزَنٍ وَلَا أَذًى وَلَا غَمٍّ، حَتَّى الشَّوْكَةِ يُشَاكُهَا، إِلَّا كَفَّرَ اللَّهُ بِهَا مِنْ خَطَايَاهُ",
    en: "No fatigue, illness, sorrow, harm, or distress befalls a Muslim—even a thorn that pricks them—except that Allah expiates some of their sins through it.",
  },
  {
    kind: "quran",
    reference: "سُورَةُ الْبَقَرَةِ ٢:١٥٣",
    ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    en: "O believers! Seek comfort in patience and prayer. Surely Allah is with those who patiently endure.",
  },
  {
    kind: "quran",
    reference: "سُورَةُ الطَّلَاقِ ٦٥:٢–٣",
    ar: "وَمَنْ يَتَّقِ اللَّهَ يَجْعَلْ لَهُ مَخْرَجًا ۝ وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
    en: "Whoever is mindful of Allah, He will make a way out for them and provide for them from sources they could never expect.",
  },
  {
    kind: "hadith",
    reference: "صَحِيحُ مُسْلِمٍ ٢٥٧٣",
    ar: "مَا يُصِيبُ الْمُؤْمِنَ مِنْ وَصَبٍ، وَلَا نَصَبٍ، وَلَا سَقَمٍ، وَلَا حَزَنٍ، حَتَّى الْهَمِّ يُهِمُّهُ، إِلَّا كُفِّرَ بِهِ مِنْ سَيِّئَاتِهِ",
    en: "No illness, exhaustion, sickness, sorrow, or distress befalls a believer—even a worry that troubles them—except that it expiates some of their sins.",
  },
  {
    kind: "story",
    reference: "قِصَّةُ أَيُّوبَ عَلَيْهِ السَّلَامُ — سُورَةُ الْأَنْبِيَاءِ ٢١:٨٣",
    ar: "يَدْعُونَا قِصَّةُ أَيُّوبَ عَلَيْهِ السَّلَامُ إِلَى رَفْعِ الشَّكْوَى إِلَى اللَّهِ بِأَدَبٍ، وَالتَّمَسُّكِ بِالرَّجَاءِ فِي أَثْقَلِ الأَيَّامِ.",
    en: "The story of Ayyub teaches us to bring our pain to Allah with humility and to hold on to hope through the heaviest days.",
  },
  {
    kind: "story",
    reference: "قِصَّةُ يَعْقُوبَ عَلَيْهِ السَّلَامُ — سُورَةُ يُوسُفَ ١٢:٨٦",
    ar: "يُذَكِّرُنَا صَبْرُ يَعْقُوبَ عَلَيْهِ السَّلَامُ أَنَّ الْحُزْنَ لَا يُنْقِصُ الإِيمَانَ، وَأَنَّ بَثَّ الْهَمِّ إِلَى اللَّهِ بَابٌ مِنْ أَبْوَابِ الرَّجَاءِ.",
    en: "The patience of Yaqub reminds us that grief does not diminish faith, and that turning our sorrow to Allah can be an opening to hope.",
  },
  {
    kind: "story",
    reference: "قِصَّةُ مُوسَى عَلَيْهِ السَّلَامُ — سُورَةُ الْقَصَصِ ٢٨:٢٤",
    ar: "فِي قِصَّةِ مُوسَى عَلَيْهِ السَّلَامُ نَرَى أَنَّ بَعْدَ التَّعَبِ قَدْ تَأْتِيَ الرِّعَايَةُ مِنْ حَيْثُ لَا نَحْتَسِبُ؛ فَالْخُطْوَةُ الصَّغِيرَةُ مَعَ الدُّعَاءِ لَيْسَتْ ضَائِعَةً.",
    en: "In the story of Musa, care arrives from an unexpected place after exhaustion; a small step joined with prayer is never wasted.",
  },
  {
    kind: "wisdom",
    reference: "حِكْمَةٌ مُعَاصِرَةٌ",
    ar: "لَيْسَ كُلُّ تَقَدُّمٍ يُقَاسُ بِالسُّرْعَةِ؛ أَحْيَانًا يَكُونُ الصُّمُودُ نَفْسُهُ إِنْجَازًا.",
    en: "Not all progress is measured by speed; sometimes continuing to stand is an achievement itself.",
  },
  {
    kind: "wisdom",
    reference: "تَذْكِيرٌ لِلْيَوْمِ",
    ar: "خُذْ يَوْمَكَ بِرِفْقٍ؛ فَالْخُطْوَةُ الصَّغِيرَةُ مَعَ الصَّبْرِ تَصِلُ.",
    en: "Hold today gently; a small step, taken with patience, still carries you forward.",
  },
];

const LABELS = {
  en: { title: "Motivation", subtitle: "A gentle reminder for this moment", quran: "Qur'an", hadith: "Hadith", story: "A story of patience", wisdom: "Wisdom", next: "Another reminder", english: "English", arabic: "العربية", source: "Source", note: "Take what comforts you; rest is part of healing." },
  ar: { title: "تحفيز", subtitle: "تذكير لطيف لهذه اللحظة", quran: "القرآن الكريم", hadith: "حديث", story: "قصة في الصبر", wisdom: "حكمة", next: "تذكير آخر", english: "English", arabic: "العربية", source: "المصدر", note: "خُذْ ما يُطَمْئِنُكَ؛ فالرَّاحَةُ جزءٌ من التعافي." },
} as const;

export function MotivationWidget() {
  const { locale } = useLanguage();
  const [index, setIndex] = useState(0);
  const [showArabic, setShowArabic] = useState(locale === "ar");
  const copy = LABELS[locale];
  const item = useMemo(() => MOTIVATIONS[index], [index]);
  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => setShowArabic(locale === "ar"), [locale]);

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % MOTIVATIONS.length), 18_000);
    return () => window.clearInterval(timer);
  }, []);

  const next = useCallback(() => setIndex((value) => (value + 1) % MOTIVATIONS.length), []);
  const typeLabel = copy[item.kind];

  return (
    <Card className="overflow-hidden border-primary/20 bg-primary/[0.035] shadow-beautiful-md" aria-live="polite">
      <CardHeader className="gap-3 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="icon-badge h-10 w-10 rounded-xl" aria-hidden="true">
              <HugeiconsIcon icon={SparklesIcon} className="h-5 w-5" />
            </span>
            <div>
              <CardTitle className="text-lg">{copy.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            {typeLabel}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="min-h-[12rem] rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-7">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${index}-${showArabic ? "ar" : "en"}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: reducedMotion ? 0 : 0.28 }}
              className="space-y-4"
            >
              {showArabic ? (
                <p lang="ar" dir="rtl" className="text-center text-2xl font-medium leading-[2.15] text-foreground sm:text-3xl">
                  {item.ar}
                </p>
              ) : (
                <p lang="en" dir="ltr" className="text-center text-lg leading-relaxed text-foreground sm:text-xl">
                  “{item.en}”
                </p>
              )}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <HugeiconsIcon icon={BookOpen01Icon} className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{copy.source}: {item.reference}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-full border border-border bg-muted/60 p-1" role="group" aria-label={locale === "ar" ? "لغة التذكير" : "Reminder language"}>
            <button type="button" onClick={() => setShowArabic(false)} aria-pressed={!showArabic} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!showArabic ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {copy.english}
            </button>
            <button type="button" onClick={() => setShowArabic(true)} aria-pressed={showArabic} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${showArabic ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {copy.arabic}
            </button>
          </div>
          <button type="button" onClick={next} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-primary/25 px-3.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <HugeiconsIcon icon={Refresh01Icon} className="h-4 w-4" aria-hidden="true" />
            {copy.next}
          </button>
        </div>
        <p className="text-center text-xs text-muted-foreground">{copy.note}</p>
      </CardContent>
    </Card>
  );
}
