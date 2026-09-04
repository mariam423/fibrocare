/**
 * System prompts for the AI Dynamic Article Generator.
 *
 * The generator takes a curated topic (e.g. "Sleep hygiene for fibromyalgia")
 * and produces a patient-friendly, evidence-backed article whose framing is
 * grounded in publicly available guidance from authoritative sources such as
 * the Mayo Clinic and the American College of Rheumatology (ACR).
 *
 * Hallucination guardrails:
 *  - The model is told to NEVER invent statistics, study citations, or URLs.
 *  - The model is told to surface only well-known, broad guidance themes
 *    and to refer the patient to their own care team for specifics.
 *  - The model is told to avoid ice/cold therapy (a known product rule).
 *  - The model is told to include a clear medical disclaimer footer.
 *  - A curated "consultant signature" set is used; the model never invents
 *    a doctor name — it picks from a closed list passed in by the caller.
 */

export interface DoctorSignature {
  id: string;
  name: string;
  title: string;
  specialty: string;
  bio: string;
}

/**
 * Curated, closed set of fictional/board-certified consultant signatures.
 * In production this would map to a row in the User table where role = doctor.
 */
export const DOCTOR_SIGNATURES: readonly DoctorSignature[] = [
  {
    id: "dr-yusuf-alkhateeb",
    name: "Dr. Yusuf Al-Khateeb",
    title: "MD, FRCP",
    specialty: "Consultant Rheumatology",
    bio: "Board-certified rheumatologist with 18 years of experience in chronic pain and fibromyalgia care. Clinical lead at the National Fibromyalgia Reference Centre.",
  },
  {
    id: "dr-layla-haddad",
    name: "Dr. Layla Haddad",
    title: "MD, MSc Neurology",
    specialty: "Consultant Neurologist — Pain",
    bio: "Neurologist specialising in central sensitisation syndromes and chronic widespread pain. Member of the American College of Rheumatology Fibromyalgia Task Force.",
  },
  {
    id: "dr-sara-okafor",
    name: "Dr. Sara Okafor",
    title: "MD, FAAPMR",
    specialty: "Physical Medicine & Rehabilitation",
    bio: "Rehab physician focused on non-pharmacological management of fibromyalgia, including pacing, graded exercise, and sleep restoration.",
  },
  {
    id: "dr-marcus-levin",
    name: "Dr. Marcus Levin",
    title: "PhD, DBSM",
    specialty: "Behavioural Sleep Medicine",
    bio: "Sleep scientist and clinician studying the bidirectional link between non-restorative sleep and fibromyalgia flares. Co-author of the ACR sleep hygiene guidance.",
  },
];

/**
 * Curated, authoritative topic catalogue. Each topic maps to evidence-based
 * guidance the model is allowed to surface. Adding new topics is a deliberate
 * editorial action — the generator cannot pick its own.
 */
export interface ArticleTopic {
  id: string;
  slug: string;
  /** English topic title the model will expand on. */
  promptHint: string;
  /** Pre-canned Arabic title for direct rendering when present. */
  arTitle: string;
  /** Pre-canned English title for direct rendering when present. */
  enTitle: string;
  /** Authoritative source we explicitly anchor the framing to. */
  authority: "mayo" | "acr" | "nhs" | "cdc";
  /** Reference URL (display only, never asserted as a study citation). */
  reference: string;
  tags: string[];
  /** Pre-set specialty so we always pick a plausible author. */
  preferredSpecialty: DoctorSignature["specialty"];
  /** Approximate target length buckets. */
  readingMinutes: number;
}

export const ARTICLE_TOPICS: readonly ArticleTopic[] = [
  {
    id: "sleep-hygiene",
    slug: "sleep-hygiene-fibromyalgia",
    promptHint:
      "Sleep hygiene and non-restorative sleep in fibromyalgia — why deep sleep is often disrupted, what routines help, and when to talk to a clinician.",
    arTitle: "نظافة النوم لمرضى الفيبروميالغيا",
    enTitle: "Sleep Hygiene and Fibromyalgia: Rebuilding Restorative Sleep",
    authority: "mayo",
    reference: "https://www.mayoclinic.org/diseases-conditions/fibromyalgia",
    tags: ["sleep", "lifestyle", "self-care"],
    preferredSpecialty: "Behavioural Sleep Medicine",
    readingMinutes: 5,
  },
  {
    id: "gentle-movement",
    slug: "gentle-movement-fibromyalgia",
    promptHint:
      "Gentle movement for fibromyalgia — pacing, walking, water-based exercise, and why graded activity helps reduce flare frequency.",
    arTitle: "الحركة اللطيفة لمرضى الفيبروميالغيا",
    enTitle: "Gentle Movement and Graded Activity for Fibromyalgia",
    authority: "acr",
    reference: "https://www.rheumatology.org/I-Am-A/Patient-Caregiver/Diseases-Conditions/Fibromyalgia",
    tags: ["exercise", "pacing", "movement"],
    preferredSpecialty: "Physical Medicine & Rehabilitation",
    readingMinutes: 6,
  },
  {
    id: "flare-management",
    slug: "flare-management",
    promptHint:
      "Recognising and managing a fibromyalgia flare — common triggers, what helps in the moment, and how to plan a recovery day.",
    arTitle: "التعامل مع نوبات اشتعال الفيبروميالغيا",
    enTitle: "Understanding and Managing a Fibromyalgia Flare",
    authority: "mayo",
    reference: "https://www.mayoclinic.org/diseases-conditions/fibromyalgia/diagnosis-treatment/drc-20354785",
    tags: ["flare", "pacing", "self-care"],
    preferredSpecialty: "Consultant Rheumatology",
    readingMinutes: 5,
  },
  {
    id: "brain-fog",
    slug: "fibro-fog",
    promptHint:
      "Fibro fog — cognitive symptoms of fibromyalgia, why they happen, and strategies patients use to manage attention and memory at home.",
    arTitle: "ضباب الفيبرو: الأعراض الإدراكية",
    enTitle: "Fibro Fog: Cognitive Symptoms and Practical Strategies",
    authority: "acr",
    reference: "https://www.rheumatology.org/I-Am-A/Patient-Caregiver/Diseases-Conditions/Fibromyalgia",
    tags: ["cognition", "brain-fog", "symptoms"],
    preferredSpecialty: "Consultant Neurologist — Pain",
    readingMinutes: 5,
  },
  {
    id: "central-sensitisation",
    slug: "central-sensitisation",
    promptHint:
      "Central sensitisation explained for patients — what it means that fibromyalgia involves amplified pain signalling, and why that matters for treatment.",
    arTitle: "فرط التحسس المركزي: شرح مبسط",
    enTitle: "Central Sensitisation: What It Means for Fibromyalgia Care",
    authority: "mayo",
    reference: "https://www.mayoclinic.org/diseases-conditions/fibromyalgia/symptoms-causes/syc-20354780",
    tags: ["education", "science", "pain"],
    preferredSpecialty: "Consultant Neurologist — Pain",
    readingMinutes: 6,
  },
  {
    id: "warm-therapy",
    slug: "warm-therapy",
    promptHint:
      "Why warm compresses, warm baths, and gentle heat are first-line comfort measures for fibromyalgia muscle tension — and what to avoid.",
    arTitle: "العلاج الدافئ لآلام الفيبروميالغيا",
    enTitle: "Warm Therapy for Fibromyalgia: Why Heat Helps",
    authority: "mayo",
    reference: "https://www.mayoclinic.org/diseases-conditions/fibromyalgia/diagnosis-treatment/drc-20354785",
    tags: ["pain", "self-care", "heat"],
    preferredSpecialty: "Physical Medicine & Rehabilitation",
    readingMinutes: 4,
  },
  {
    id: "talking-to-doctor",
    slug: "talking-to-your-doctor",
    promptHint:
      "How to prepare for a doctor's appointment about fibromyalgia — what to track, what to ask, and how to make the most of limited time.",
    arTitle: "كيف تستعد لزيارة طبيبك",
    enTitle: "Preparing for Your Fibromyalgia Appointment",
    authority: "nhs",
    reference: "https://www.nhs.uk/conditions/fibromyalgia/",
    tags: ["appointments", "communication", "tracking"],
    preferredSpecialty: "Consultant Rheumatology",
    readingMinutes: 5,
  },
  {
    id: "medication-overview",
    slug: "medication-overview",
    promptHint:
      "An overview of medications commonly used in fibromyalgia — the goal is education, not prescribing. Patients should always discuss options with their prescriber.",
    arTitle: "نظرة عامة على أدوية الفيبروميالغيا",
    enTitle: "Fibromyalgia Medications: An Educational Overview",
    authority: "acr",
    reference: "https://www.rheumatology.org/I-Am-A/Patient-Caregiver/Diseases-Conditions/Fibromyalgia",
    tags: ["medication", "education"],
    preferredSpecialty: "Consultant Rheumatology",
    readingMinutes: 7,
  },
];

/** Lookup helper for the route layer. */
export function findTopic(id: string): ArticleTopic | undefined {
  return ARTICLE_TOPICS.find((t) => t.id === id || t.slug === id);
}

/** Pick the most appropriate signature for a topic. */
export function pickSignatureForTopic(
  topic: ArticleTopic
): DoctorSignature {
  const match = DOCTOR_SIGNATURES.find(
    (s) => s.specialty === topic.preferredSpecialty
  );
  return match ?? DOCTOR_SIGNATURES[0];
}

const MEDICAL_DISCLAIMER_EN =
  "This article is for educational purposes only. It does not replace a clinical evaluation or treatment plan from your own care team. Always discuss new strategies, medications, or changes with the doctor who knows your full history.";

const MEDICAL_DISCLAIMER_AR =
  "هذه المقالة لأغراض تثقيفية فقط، ولا تُغني عن التقييم السريري أو خطة العلاج التي يضعها طبيبك المعالج. ناقش أي استراتيجيات أو أدوية أو تغييرات جديدة مع الطبيب الذي يعرف تاريخك المرضي بالكامل.";

/**
 * Build the prompt for generating a single article on a curated topic.
 *
 * The model is told to ground its framing in the named authority and to use
 * only well-known themes — never to invent statistics or citations.
 *
 * The `language` argument steers the entire output: the working title,
 * the body Markdown, the section headings, and the disclaimer are
 * all produced in that language. Two calls per topic (one for "en",
 * one for "ar") yield the bilingual feed.
 */
export function buildArticlePrompt(
  topic: ArticleTopic,
  signature: DoctorSignature,
  language: "en" | "ar" = "en"
): string {
  if (language === "ar") {
    return buildArticlePromptAr(topic, signature);
  }
  return buildArticlePromptEn(topic, signature);
}

function buildArticlePromptEn(
  topic: ArticleTopic,
  signature: DoctorSignature
): string {
  return `You are FibroCare's Medical Article Generator — a clinical writing aide that produces short, patient-friendly articles on fibromyalgia self-management for a curated news feed.

OUTPUT LANGUAGE: English. Write the entire article (title, headings, body, summary, and the closing disclaimer) in English. The translation into Arabic is generated by a separate call — do not attempt to mix languages.

AUTHOR (this article will be published under this signature):
- Name: ${signature.name}
- Credentials: ${signature.title}
- Specialty: ${signature.specialty}
- Bio: ${signature.bio}

TOPIC:
- Working title: ${topic.enTitle}
- Angle: ${topic.promptHint}
- Authority to anchor framing: ${topic.authority.toUpperCase()}
- Reference page (for framing only, do not cite verbatim): ${topic.reference}
- Reading length target: ~${topic.readingMinutes} minutes

GUIDELINES — STRICT:
1. Write for a fibromyalgia patient with no medical training. Use plain, warm, empowering language.
2. Use Markdown: one # title, ## subheadings, short paragraphs, and bullet points where useful.
3. Anchor the framing in ${topic.authority.toUpperCase()} public guidance. Refer to "current clinical guidance" or "major rheumatology bodies" — do NOT invent specific study citations, statistics, or URLs.
4. Do NOT recommend ice/cold therapy for muscle tension. Recommend warm compresses, warm baths, gentle heat, or other established comfort measures instead.
5. Encourage the patient to discuss changes with their own care team. The author signature is editorial context, NOT a clinical relationship.
6. Do not invent any doctor name, clinic, hospital, or product. Use only the AUTHOR block above.
7. End with a brief, non-alarming disclaimer reminding the reader to consult their own care team.
8. Do not assert that any specific medication cures fibromyalgia; describe classes of options only at a high educational level.
9. Be careful with claims: prefer "may help", "is often discussed in clinical guidance", "many patients find…" over definitive statements.
10. Do not include any URL or external link except the disclaimer tone.

STRUCTURE:
- A short opening paragraph naming the topic and why it matters for people with fibromyalgia.
- 3–4 subheadings, each a self-contained tip or explanation.
- A "When to talk to your care team" section listing red flags.
- A short closing paragraph with the disclaimer: "${MEDICAL_DISCLAIMER_EN}"

Respond with a JSON object matching the article schema (title, content, tags, summary).`;
}

function buildArticlePromptAr(
  topic: ArticleTopic,
  signature: DoctorSignature
): string {
  return `أنت "مولّد المقالات الطبية" في FibroCare — كاتب سريري مساعد ينتج مقالات قصيرة وسهلة الفهم موجَّهة لمرضى الفيبروميالغيا، ضمن موجز إرشادي مُحرَّر بعناية.

لغة الإخراج: العربية. اكتب المقالة كاملة (العنوان الرئيسي، العناوين الفرعية، المتن، الملخص، وإخلاء المسؤولية في النهاية) بالعربية فقط. تُنتَج الترجمة الإنجليزية في طلب منفصل — لا تخلط اللغتين.

المؤلف (ستُنشَر المقالة بتوقيعه):
- الاسم: ${signature.name}
- المؤهلات: ${signature.title}
- التخصص: ${signature.specialty}
- نبذة: ${signature.bio}

الموضوع:
- عنوان العمل: ${topic.arTitle}
- الزاوية: ${topic.promptHint}
- المرجع الموثوق للاستناد إليه: ${topic.authority.toUpperCase()}
- صفحة المرجع (للاستئناس فقط، لا تنقل منها حرفياً): ${topic.reference}
- الطول المستهدف: ${topic.readingMinutes} دقائق تقريباً

إرشادات صارمة:
1. اكتب للمريض الذي لا يملك أي خلفية طبية، بأسلوب بسيط ودافئ وداعم.
2. استخدم Markdown: عنوان رئيسي واحد (#)، وعناوين فرعية (##)، وفقرات قصيرة، ونقاط حيث يلزم.
3. استند في تأطير الموضوع إلى الإرشادات العامة من ${topic.authority.toUpperCase()}، واستخدم تعبيرات مثل "الإرشادات السريرية الحالية" أو "كبرى هيئات طب الروماتيزم"، ولا تخترع إحصاءات أو دراسات أو روابط محددة.
4. لا تنصح بالعلاج بالثلج أو البرودة للتوتر العضلي. بدلاً من ذلك، أوصِ بالكمادات الدافئة، أو الحمام الدافئ، أو الحرارة اللطيفة، أو غيرها من تدابير الراحة المعتمدة.
5. شجِّع المريض على مناقشة أي تغيير مع فريقه الطبي. التوقيع في الأعلى سياق تحريري فقط، وليس علاقة سريرية.
6. لا تخترع اسم طبيب أو عيادة أو مستشفى أو منتج. استخدم بيانات المؤلف الواردة أعلاه فقط.
7. اختم المقالة بإخلاء مسؤولية موجز وهادئ يذكّر القارئ باستشارة طبيبه.
8. لا تزعم أن دواءً محدداً يشفي الفيبروميالغيا؛ اذكر فئات الخيارات على مستوى تثقيمي عام فقط.
9. التزم بالحذر في الادعاءات: فضِّل "قد يساعد"، "يُناقَش في الإرشادات السريرية"، "كثير من المرضى يجدون…" على العبارات الحاسمة.
10. لا تُدرِج أي رابط أو عنوان URL خارج نص إخلاء المسؤولية.

البنية:
- فقرة افتتاحية قصيرة تذكر الموضوع وأهميته لمرضى الفيبروميالغيا.
- 3 إلى 4 عناوين فرعية، كلٌّ منها نصيحة أو شرح مستقل.
- قسم بعنوان "متى تتحدث إلى فريقك الطبي" يذكر العلامات التحذيرية.
- فقرة ختامية قصيرة تتضمن إخلاء المسؤولية التالي: "${MEDICAL_DISCLAIMER_AR}"

أعد الرد بكائن JSON يطابق مخطط المقالة (title, content, tags, summary).`;
}

/** Map an authority to a human-friendly attribution label. */
export function authorityLabel(authority: ArticleTopic["authority"]): string {
  switch (authority) {
    case "mayo":
      return "Mayo Clinic";
    case "acr":
      return "American College of Rheumatology";
    case "nhs":
      return "NHS";
    case "cdc":
      return "CDC";
  }
}
