import { describe, expect, it } from "vitest";
import { searchFaq, type FaqSearchEntry } from "./faqSearch";

const ENTRIES: FaqSearchEntry[] = [
  {
    question: "Is fibromyalgia a chronic condition?",
    answer: "Yes, fibromyalgia is considered a chronic (long-term) condition.",
    keywords: ["chronic", "long term", "مزمن", "طويلة الأمد"],
  },
  {
    question: "Is there a cure for fibromyalgia?",
    answer: "Currently, there is no known cure.",
    keywords: ["cure", "heal", "علاج نهائي", "شفاء"],
  },
  {
    question: "Does fibromyalgia affect pregnancy?",
    answer: "Fibromyalgia does not typically cause complications during pregnancy.",
    keywords: ["pregnancy", "pregnant", "حمل", "حامل"],
  },
  {
    question: "Is exercise safe with fibromyalgia?",
    answer:
      "Yes, gentle exercise is one of the most effective treatments. Walking, swimming, and stretching reduce pain and stiffness.",
    keywords: [
      "exercise",
      "safe",
      "stiff",
      "stiffness",
      "walking",
      "yoga",
      "تمارين",
      "آمنة",
      "تيبس",
    ],
  },
  {
    question: "How long does diagnosis take?",
    answer: "Diagnosis can take time because symptoms overlap with other conditions.",
    keywords: ["diagnosis", "diagnose", "test", "doctor", "تشخيص", "فحص", "طبيب"],
  },
  {
    question: "What treatments work best?",
    answer:
      "The most effective approach combines medications, physical therapy, and CBT.",
    keywords: ["treatment", "medication", "therapy", "cbt", "علاج", "أدوية"],
  },
];

/** The same entries in Arabic — the search runs against localized text. */
const AR_ENTRIES: FaqSearchEntry[] = [
  ...ENTRIES.slice(0, 3),
  {
    question: "هل التمارين آمنة مع التهاب العضلات الليفية؟",
    answer: "نعم، التمارين اللطيفة من أكثر العلاجات فعالية. المشي والسباحة والتمطيط تقلل الألم والتيبس.",
    keywords: ENTRIES[3].keywords,
  },
  {
    question: "كم يستغرق التشخيص؟",
    answer: "قد يستغرق التشخيص وقتًا لأن الأعراض تتداخل مع حالات أخرى.",
    keywords: ENTRIES[4].keywords,
  },
  {
    question: "ما هي أفضل العلاجات؟",
    answer: "يجمع النهج الأكثر فعالية بين الأدوية والعلاج الطبيعي والعلاج السلوكي المعرفي.",
    keywords: ENTRIES[5].keywords,
  },
];

describe("searchFaq", () => {
  it("returns every entry in order for an empty query", () => {
    expect(searchFaq("", ENTRIES)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(searchFaq("   ", ENTRIES)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("ranks the exercise entry for a heat/stiffness question", () => {
    const results = searchFaq("Is heat therapy safe for morning stiffness?", ENTRIES);
    expect(results[0]).toBe(3); // exercise — matches safe + stiffness keywords
    expect(results).toContain(5); // treatment still surfaces via "therapy"
  });

  it("ranks the exercise entry for 'is exercise safe'", () => {
    expect(searchFaq("is exercise safe", ENTRIES)[0]).toBe(3);
  });

  it("matches the treatment entry by keyword even off-screen text", () => {
    expect(searchFaq("medication therapy cbt", ENTRIES)[0]).toBe(5);
  });

  it("matches Arabic diagnosis questions", () => {
    expect(searchFaq("كم يستغرق التشخيص", AR_ENTRIES)[0]).toBe(4);
  });

  it("matches Arabic exercise questions", () => {
    expect(searchFaq("هل التمارين آمنة", AR_ENTRIES)[0]).toBe(3);
  });

  it("returns an empty list when nothing matches", () => {
    expect(searchFaq("zzz qqq vvv", ENTRIES)).toEqual([]);
  });

  it("does not match 'hip' inside unrelated words", () => {
    expect(searchFaq("shipping", ENTRIES)).toEqual([]);
  });
});
