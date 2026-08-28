"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpen01Icon,
  Refresh01Icon,
  SparklesIcon,
  BellIcon,
  BellOffIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────────── */

type MotivationKind = "quran" | "hadith" | "dua" | "story" | "wisdom";

type MotivationItem = {
  kind: MotivationKind;
  reference: string;
  ar: string;
  en: string;
};

/* ─── Content Array ──────────────────────────────────────────────── */

const MOTIVATIONS: MotivationItem[] = [
  /* ═══════════════════════════════════════════════════════════════════
     QUR'ANIC VERSES (with full Tashkeel)
     ═══════════════════════════════════════════════════════════════════ */
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
    ar: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَى أَنْفُسِهِمْ لَا تَقْنَطُوا مِنْ رَحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ",
    en: "Say: O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful.",
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
    kind: "quran",
    reference: "سُورَةُ الإِسْرَاءِ ١٧:٨٢",
    ar: "وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِلْمُؤْمِنِينَ",
    en: "We send down the Quran as a healing and a mercy for those who believe.",
  },
  {
    kind: "quran",
    reference: "سُورَةُ فُصِّلَتْ ٤١:٣٠",
    ar: "إِنَّ الَّذِينَ قَالُوا رَبُّنَا اللَّهُ ثُمَّ اسْتَقَامُوا تَتَنَزَّلُ عَلَيْهِمُ الْمَلَائِكَةُ أَلَّا تَخَافُوا وَلَا تَحْزَنُوا وَأَبْشِرُوا بِالْجَنَّةِ الَّتِي كُنتُمْ تُوعَدُونَ",
    en: "Indeed, those who say: 'Our Lord is Allah,' and then remain steadfast—the angels descend upon them: 'Do not fear and do not grieve, but receive the glad tidings of Paradise which you were promised.'",
  },
  {
    kind: "quran",
    reference: "سُورَةُ الْأَنْبِيَاءِ ٢١:٨٣",
    ar: "وَأَيُّوبَ إِذْ نَادَىٰ رَبَّهُ أَنِّي مَسَّنِيَ الضُّرُّ وَأَنْتَ أَرْحَمُ الرَّاحِمِينَ",
    en: "And Ayyub, when he called upon his Lord: 'Indeed, adversity has touched me, and You are the Most Merciful of the merciful.'",
  },
  {
    kind: "quran",
    reference: "سُورَةُ الْبَقَرَةِ ٢:١٥٥–١٥٧",
    ar: "لَنَبْلُوَنَّكُمْ بِشَيْءٍ مِنَ الْخَوْفِ وَالْجُوعِ وَنَقْصٍ مِنَ الْأَمْوَالِ وَالْأَنْفُسِ وَالثَّمَرَاتِ ۗ وَبَشِّرِ الصَّابِرِينَ ۝ الَّذِينَ إِذَا أَصَابَتْهُمْ مُصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
    en: "We will surely test you with something of fear, hunger, and a loss of wealth, lives, and fruits. But give good tidings to the patient—who, when disaster strikes them, say: 'Indeed, we belong to Allah, and indeed, to Him we will return.'",
  },
  {
    kind: "quran",
    reference: "سُورَةُ الْبَقَرَةِ ٢:٢١٤",
    ar: "أَمْ حَسِبْتُمْ أَن تَدْخُلُوا الْجَنَّةَ وَلَمَّا يَأْتِكُمْ مَّثَلُ الَّذِينَ خَلَوْا مِن قَبْلِكُم ۖ مَّسَّتْهُمُ الْبَأْسَاءُ وَالضَّرَّاءُ وَزُلْزِلُوا حَتَّىٰ يَقُولَ الرَّسُولُ وَالَّذِينَ آمَنُوا مَعَهُ مَتَىٰ نَصْرُ اللَّهِ",
    en: "Or did you think that you would enter Paradise while such trials had not yet come to you as came to those who passed before you? They were touched by poverty and hardship and were shaken until the Messenger and those who believed with him said: 'When will the help of Allah come?'",
  },
  {
    kind: "quran",
    reference: "سُورَةُ الْعَنْكَبُوتِ ٢٩:٦٩",
    ar: "وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا ۚ وَإِنَّ اللَّهَ لَمَعَ الْمُحْسِنِينَ",
    en: "And those who strive for Us—We will surely guide them to Our ways. Indeed, Allah is with those who do good.",
  },
  {
    kind: "quran",
    reference: "سُورَةُ غَافِرٍ ٤٠:٦٠",
    ar: "وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ ۚ إِنَّ الَّذِينَ يَسْتَكْبِرُونَ عَنْ عِبَادَتِي سَيَدْخُلُونَ جَهَنَّمَ دَاخِرِينَ",
    en: "And your Lord says: 'Call upon Me; I will respond to you.' Indeed, those who disdain My worship will enter Hell humbled.",
  },

  /* ═══════════════════════════════════════════════════════════════════
     PROPHETIC HADITHS (with authentic references)
     ═══════════════════════════════════════════════════════════════════ */
  {
    kind: "hadith",
    reference: "صَحِيحُ مُسْلِمٍ ٢٩٩٩",
    ar: "عَجَبًا لِأَمْرِ الْمُؤْمِنِ، إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ، وَلَيْسَ ذَاكَ لِأَحَدٍ إِلَّا لِلْمُؤْمِنِ؛ إِنْ أَصَابَتْهُ سَرَّاءُ شَكَرَ فَكَانَ خَيْرًا لَهُ، وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ",
    en: "How wonderful is the affair of the believer. All of it is good: when ease comes, they are grateful; and when hardship comes, they are patient—and that is good for them.",
  },
  {
    kind: "hadith",
    reference: "صَحِيحُ الْبُخَارِيِّ ٥٦٤١",
    ar: "مَا يُصِيبُ الْمُسْلِمَ مِنْ نَصَبٍ وَلَا وَصَبٍ وَلَا هَمٍّ وَلَا حَزَنٍ وَلَا أَذًى وَلَا غَمٍّ، حَتَّى الشَّوْكَةِ يُشَاكُهَا، إِلَّا كَفَّرَ اللَّهُ بِهَا مِنْ خَطَايَاهُ",
    en: "No fatigue, illness, sorrow, harm, or distress befalls a Muslim—even a thorn that pricks them—except that Allah expiates some of their sins through it.",
  },
  {
    kind: "hadith",
    reference: "صَحِيحُ مُسْلِمٍ ٢٥٧٣",
    ar: "مَا يُصِيبُ الْمُؤْمِنَ مِنْ وَصَبٍ، وَلَا نَصَبٍ، وَلَا سَقَمٍ، وَلَا حَزَنٍ، حَتَّى الْهَمِّ يُهِمُّهُ، إِلَّا كُفِّرَ بِهِ مِنْ سَيِّئَاتِهِ",
    en: "No illness, exhaustion, sickness, sorrow, or distress befalls a believer—even a worry that troubles them—except that it expiates some of their sins.",
  },
  {
    kind: "hadith",
    reference: "صَحِيحُ الْبُخَارِيِّ ٥٦٤٤، مُسْلِمٍ ٢٥٧٥",
    ar: "لَا يَقْطَعُ عَمَلَ الْعَبْدِ الصَّالِحِ إِلَّا الْكِبْرُ",
    en: "Nothing cuts off the good deeds of a servant like arrogance.",
  },
  {
    kind: "hadith",
    reference: "صَحِيحُ الْبُخَارِيِّ ٧٤٠٥",
    ar: "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُصِبْ مِنْهُ",
    en: "Whomever Allah intends good for, He afflicts him with trials.",
  },
  {
    kind: "hadith",
    reference: "صَحِيحُ الْبُخَارِيِّ ٥٦٤٥",
    ar: "إِذَا مَرِضَ الْعَبْدُ أَوْ سَافَرَ كُتِبَ لَهُ مَا كَانَ يَعْمَلُ مُقِيمًا صَاحِبًا",
    en: "When a servant falls ill or travels, it is recorded for them what they used to do when they were settled and at home.",
  },
  {
    kind: "hadith",
    reference: "صَحِيحُ مُسْلِمٍ ٢٥٧٦",
    ar: "مَا يُصِيبُ الْمُؤْمِنَ أَلَمٌ وَلَا نَصَبٌ وَلَا هَمٌّ وَلَا حُزْنٌ وَلَا غَمٌّ حَتَّى الشَّوْكَةِ يُشَاكُهَا إِلَّا كَفَّرَ اللَّهُ بِهَا مِنْ خَطَايَاهُ",
    en: "No pain, exhaustion, worry, sorrow, or distress befalls a believer—including a thorn's prick—except that Allah erases some of their sins through it.",
  },

  /* ═══════════════════════════════════════════════════════════════════
     SUPPLICATIONS (أدعية الشفاء والصبر)
     ═══════════════════════════════════════════════════════════════════ */
  {
    kind: "dua",
    reference: "أَدْعِيَةُ مِنَ السُّنَّةِ",
    ar: "اللَّهُمَّ رَبَّ النَّاسِ، مُذْهِبَ الْبَاسِ، اشْفِهِ وَأَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا",
    en: "O Allah, Lord of mankind, remover of affliction, cure him, for You are the Healer. There is no healing except Your healing—a healing that leaves no illness behind.",
  },
  {
    kind: "dua",
    reference: "مُسْلِمٌ ٢٧٣٠ — دُعَاءُ الْكَهْفِ",
    ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى",
    en: "O Allah, I ask You for guidance, righteousness, chastity, and sufficiency.",
  },
  {
    kind: "dua",
    reference: "أَدْعِيَةُ مِنَ السُّنَّةِ",
    ar: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
    en: "O Allah, I seek refuge in You from anxiety, sorrow, incapacity, laziness, stinginess, cowardice, the burden of debt, and being overpowered by people.",
  },
  {
    kind: "dua",
    reference: "أَدْعِيَةُ مِنَ السُّنَّةِ",
    ar: "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا",
    en: "O Allah, nothing is easy except what You make easy, and You can make sorrow easy if You will.",
  },
  {
    kind: "dua",
    reference: "أَدْعِيَةُ مِنَ السُّنَّةِ",
    ar: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    en: "Allah is sufficient for us, and He is the best Disposer of affairs.",
  },
  {
    kind: "dua",
    reference: "أَدْعِيَةُ مِنَ السُّنَّةِ",
    ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ، اللَّهُمَّ اعْصِمْنِي مِنَ الشَّيْطَانِ الرَّجِيمِ",
    en: "O Allah, I ask You from Your bounty. O Allah, protect me from the accursed Satan.",
  },
  {
    kind: "dua",
    reference: "أَدْعِيَةُ مِنَ السُّنَّةِ",
    ar: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْكَرَبِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْهَرَمِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
    en: "O Allah, I seek refuge in You from worry and grief, incapacity and laziness, stinginess and old age, the burden of debt, and domination by others.",
  },
  {
    kind: "dua",
    reference: "أَدْعِيَةُ مِنَ السُّنَّةِ",
    ar: "اللَّهُمَّ اشْفِ سَقَمِي، وَأَصْلِحْ شَأْنِي، وَاحْفَظْنِي مِنْ بَلَائِي",
    en: "O Allah, heal my illness, rectify my affairs, and protect me from my trial.",
  },
  {
    kind: "dua",
    reference: "أَدْعِيَةُ مِنَ السُّنَّةِ",
    ar: "اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ وَأَصْلِحْ لِي شَأْنِي كُلَّهُ لَا إِلَهَ إِلَّا أَنْتَ",
    en: "O Allah, I hope for Your mercy. Do not leave me to myself for the blink of an eye. Rectify all my affairs. There is no god but You.",
  },

  /* ═══════════════════════════════════════════════════════════════════
     STORIES OF PROPHETS (قصص الأنبياء في الصبر)
     ═══════════════════════════════════════════════════════════════════ */
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
    kind: "story",
    reference: "قِصَّةُ نُوحَ عَلَيْهِ السَّلَامُ — سُورَةُ نُوحٍ ٧١:٥–٧",
    ar: "صَبَرَ نُوحُ عَلَيْهِ السَّلَامُ أَلْفَيْ عَامٍ يَدْعُو قَوْمَهُ، فَعَلَّمَنَا أَنَّ الصَّبْرَ الْمُمْتَدِّ مَعَ الدُّعَاءِ مِنْ أَعْظَمِ الْعِبَادَاتِ، وَأَنَّ الْمُحَافَظَةَ عَلَى الْأَمَلِ مَعَ طُولِ الابْتِلَاءِ نِعْمَةٌ مِنَ اللَّهِ.",
    en: "Nuh (Noah) endured 950 years calling his people, teaching us that sustained patience with supplication is among the greatest acts of worship, and that maintaining hope through prolonged trials is a blessing from Allah.",
  },
  {
    kind: "story",
    reference: "قِصَّةُ يُوسُفَ عَلَيْهِ السَّلَامُ — سُورَةُ يُوسُفَ ١٢:٨٧",
    ar: "قَالَ يَعْقُوبُ: يَا بَنِيَّ اذْهَبُوا فَتَحَسَّسُوا مِنْ يُوسُفَ وَأَخِيهِ وَلَا تَيْأَسُوا مِنْ رَوْحِ اللَّهِ ۖ إِنَّهُ لَا يَيْأَسُ مِنْ رَوْحِ اللَّهِ إِلَّا الْقَوْمُ الْكَافِرُونَ",
    en: "Yaqub said: 'O my sons, go and find out about Yusuf and his brother, and despair not of Allah's mercy. Indeed, none despairs of Allah's mercy except the disbelieving people.'",
  },

  /* ═══════════════════════════════════════════════════════════════════
     WISDOM & CONTEMPORARY REFLECTIONS (حكمة معاصرة)
     ═══════════════════════════════════════════════════════════════════ */
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
  {
    kind: "wisdom",
    reference: "حِكْمَةٌ فِي الرَّحْمَةِ بِالنَّفْسِ",
    ar: "لَيْسَ الْمَقْصُودُ مِنَ الشِّفَاءِ أَلَّا تَشْعُرَ بِالْأَلَمِ قَطّ، بَلْ أَنْ تَعِيشَ مَعَهُ وَتَجِدَ فِي كُلِّ يَوْمٍ سَبَبًا لِلرَّجَاءِ.",
    en: "Healing is not about never feeling pain, but about living with it and finding a reason for hope each day.",
  },
  {
    kind: "wisdom",
    reference: "تَذْكِيرٌ مُعَاشٌ",
    ar: "الرَّاحَةُ لَيْسَتْ فُرَاغًا؛ هِيَ حِكْمَةُ مَنْ يَعْلَمُ أَنَّ الْجِسْمَ يَحْتَاجُ إِلَى الصَّمْتِ كَمَا يَحْتَاجُ إِلَى الْحَرَكَةِ.",
    en: "Rest is not emptiness; it is the wisdom of knowing the body needs stillness as much as movement.",
  },
  {
    kind: "wisdom",
    reference: "حِكْمَةٌ فِي الصَّبْرِ",
    ar: "إِذَا أَثْقَلَكَ الْيَوْمُ، فَاذْكُرْ أَنَّ الشَّمْسَ لَا تَشْرِقُ إِلَّا بَعْدَ أَظْلَمِ لَيْلَةٍ.",
    en: "When today feels heavy, remember: the sun only rises after the darkest night.",
  },
  {
    kind: "wisdom",
    reference: "تَذْكِيرٌ بِالرَّحْمَةِ",
    ar: "لَا تُكَلِّفْ نَفْسَكَ مَا لَا تَسْتَطِيعُ؛ فَاللَّهُ يَرَاكَ وَيَعْلَمُ بِحَالِكَ.",
    en: "Do not burden yourself beyond your capacity; Allah sees you and knows your state.",
  },
  {
    kind: "wisdom",
    reference: "حِكْمَةٌ فِي الْأَمَلِ",
    ar: "كُلُّ لَحْظَةِ صَبْرٍ تَمُرُّ عَلَيْكَ هِيَ لَحْظَةٌ قَرْبٌ مِنَ اللَّهِ وَقُرْبٌ مِنَ الشِّفَاءِ.",
    en: "Every moment of patience that passes is a moment closer to Allah and closer to healing.",
  },
  {
    kind: "wisdom",
    reference: "حِكْمَةٌ يَوْمِيَّةٌ",
    ar: "الصَّبْرُ لَيْسَ سُكُوتًا عَنِ الدُّعَاءِ، بَلْ هُوَ الِاثْبَاتُ مَعَ الدُّعَاءِ.",
    en: "Patience is not silence from prayer; it is persistence in prayer.",
  },
  {
    kind: "wisdom",
    reference: "حِكْمَةٌ فِي التَّقَلُّبِ",
    ar: "لَيْسَ كُلُّ يَوْمٍ مِثْلَ الْأَخَرِ؛ فَالْيَوْمَ الْعَسِيرُ مُمْكِنٌ أَنْ يَكُونَ بَابًا لِيَوْمٍ أَحْلَى.",
    en: "Not every day is like the next; a difficult day may be the doorway to a sweeter one.",
  },
  {
    kind: "wisdom",
    reference: "تَذْكِيرٌ بِقِيمَةِ الرَّاحةِ",
    ar: "الرِّاحةُ لَيْسَتْ ضَعْفًا؛ هِيَ قُوَّةُ مَنْ يَعْرِفُ أَنَّ فِي التَّوْقِفِ حِكْمَةً وَفِي الصَّبْرِ نُورًا.",
    en: "Rest is not weakness; it is the strength of one who knows that stopping holds wisdom and patience holds light.",
  },
];

/* ─── UI Labels ──────────────────────────────────────────────────── */

const KIND_META: Record<
  MotivationKind,
  { en: string; ar: string; color: string }
> = {
  quran: {
    en: "Qur'an",
    ar: "القرآن الكريم",
    color:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  hadith: {
    en: "Hadith",
    ar: "حديث شريف",
    color: "border-primary/30 bg-primary/10 text-primary",
  },
  dua: {
    en: "Supplication",
    ar: "دعاء",
    color: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  story: {
    en: "Story of Patience",
    ar: "قصة في الصبر",
    color: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  wisdom: {
    en: "Wisdom",
    ar: "حكمة",
    color: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
};

const LABELS = {
  en: {
    title: "Motivation",
    subtitle: "A gentle reminder for this moment",
    next: "Another reminder",
    english: "English",
    arabic: "العربية",
    source: "Source",
    note: "Take what comforts you; rest is part of healing.",
    notificationsOn: "Reminders on",
    notificationsOff: "Reminders off",
    notificationTitle: "FibroCare Reminder",
    notificationBody: "Take a moment for yourself — breathe, stretch, and remember: you are stronger than you think.",
  },
  ar: {
    title: "تحفيز",
    subtitle: "تذكير لطيف لهذه اللحظة",
    next: "تذكير آخر",
    english: "English",
    arabic: "العربية",
    source: "المصدر",
    note: "خُذْ ما يُطَمْئِنُكَ؛ فالرَّاحَةُ جزءٌ من التعافي.",
    notificationsOn: "التذكيرات مفعّلة",
    notificationsOff: "التذكيرات معطّلة",
    notificationTitle: "تذكير فيبرو كير",
    notificationBody: "خصّص لحظة لنفسك — تنفّس، تمطّج، وتذكّر: أقوى مما تظن.",
  },
} as const;

/* ─── Notification Interval (ms) ────────────────────────────────── */

const NOTIFICATION_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

/* ─── Component ──────────────────────────────────────────────────── */

export function MotivationWidget() {
  const { locale } = useLanguage();
  const [index, setIndex] = useState(0);
  const [showArabic, setShowArabic] = useState(locale === "ar");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(
    () =>
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
  );
  const notificationTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const copy = LABELS[locale];
  const item = useMemo(() => MOTIVATIONS[index], [index]);
  const kindMeta = KIND_META[item.kind];

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Sync toggle to locale changes
  useEffect(() => setShowArabic(locale === "ar"), [locale]);

  // ── Auto-rotate every 20 seconds ──
  useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((v) => (v + 1) % MOTIVATIONS.length),
      20_000
    );
    return () => window.clearInterval(timer);
  }, []);

  // ── Browser Notification scheduling ──
  useEffect(() => {
    if (!notificationsEnabled || !hasNotificationPermission) {
      if (notificationTimerRef.current) {
        clearInterval(notificationTimerRef.current);
        notificationTimerRef.current = null;
      }
      return;
    }

    // Fire one immediately when enabled
    showNotification(copy.notificationTitle, copy.notificationBody);

    notificationTimerRef.current = setInterval(() => {
      showNotification(copy.notificationTitle, copy.notificationBody);
    }, NOTIFICATION_INTERVAL_MS);

    return () => {
      if (notificationTimerRef.current) {
        clearInterval(notificationTimerRef.current);
        notificationTimerRef.current = null;
      }
    };
  }, [notificationsEnabled, hasNotificationPermission, locale]); // eslint-disable-line react-hooks/exhaustive-deps

  const showNotification = useCallback(
    (title: string, body: string) => {
      if (
        typeof Notification === "undefined" ||
        Notification.permission !== "granted"
      )
        return;
      // eslint-disable-next-line no-new
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        tag: "fibrocare-motivation",
      });
    },
    []
  );

  const next = useCallback(
    () => setIndex((v) => (v + 1) % MOTIVATIONS.length),
    []
  );

  const toggleNotifications = useCallback(async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      return;
    }

    // Request permission if needed
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      try {
        const permission = await Notification.requestPermission();
        setHasNotificationPermission(permission === "granted");
        if (permission !== "granted") return;
      } catch {
        return;
      }
    }

    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      setHasNotificationPermission(true);
      setNotificationsEnabled(true);
    }
  }, [notificationsEnabled]);

  return (
    <Card
      className="overflow-hidden border-primary/20 bg-primary/[0.035] shadow-beautiful-md"
      aria-live="polite"
    >
      <CardHeader className="gap-3 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="icon-badge h-10 w-10 rounded-xl"
              aria-hidden="true"
            >
              <HugeiconsIcon icon={SparklesIcon} className="h-5 w-5" />
            </span>
            <div>
              <CardTitle className="text-lg">{copy.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {copy.subtitle}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium",
              kindMeta.color
            )}
          >
            {locale === "ar" ? kindMeta.ar : kindMeta.en}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* ── Content Display ──────────────────────────── */}
        <div className="min-h-[14rem] rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-7">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${index}-${showArabic ? "ar" : "en"}`}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.35,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="space-y-4"
            >
              {showArabic ? (
                <p
                  lang="ar"
                  dir="rtl"
                  className="text-center text-2xl font-medium leading-[2.15] text-foreground sm:text-3xl"
                  style={{ unicodeBidi: "isolate" }}
                >
                  <bdi>{item.ar}</bdi>
                </p>
              ) : (
                <p
                  lang="en"
                  dir="ltr"
                  className="text-center text-lg leading-relaxed text-foreground sm:text-xl"
                >
                  &ldquo;{item.en}&rdquo;
                </p>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <HugeiconsIcon
                  icon={BookOpen01Icon}
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
                <span>
                  {copy.source}: {item.reference}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Controls Row ─────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Language toggle */}
          <div
            className="inline-flex rounded-full border border-border bg-muted/60 p-1"
            role="group"
            aria-label={
              locale === "ar" ? "لغة التذكير" : "Reminder language"
            }
          >
            <button
              type="button"
              onClick={() => setShowArabic(false)}
              aria-pressed={!showArabic}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                !showArabic
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {copy.english}
            </button>
            <button
              type="button"
              onClick={() => setShowArabic(true)}
              aria-pressed={showArabic}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                showArabic
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {copy.arabic}
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Notification bell toggle */}
            <button
              type="button"
              onClick={toggleNotifications}
              aria-label={
                notificationsEnabled
                  ? copy.notificationsOn
                  : copy.notificationsOff
              }
              aria-pressed={notificationsEnabled}
              className={cn(
                "inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                notificationsEnabled
                  ? "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                  : "border-border bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <HugeiconsIcon
                icon={notificationsEnabled ? BellIcon : BellOffIcon}
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  notificationsEnabled && "animate-[bellRing_0.5s_ease-in-out]"
                )}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">
                {notificationsEnabled
                  ? copy.notificationsOn
                  : copy.notificationsOff}
              </span>
            </button>

            {/* Refresh / next */}
            <button
              type="button"
              onClick={next}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-primary/25 px-3.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <HugeiconsIcon
                icon={Refresh01Icon}
                className="h-4 w-4"
                aria-hidden="true"
              />
              {copy.next}
            </button>
          </div>
        </div>

        {/* ── Footer note ──────────────────────────────── */}
        <p className="text-center text-xs text-muted-foreground">
          {copy.note}
        </p>
      </CardContent>
    </Card>
  );
}
