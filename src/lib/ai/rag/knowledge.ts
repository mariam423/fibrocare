/**
 * Clinical knowledge base for RAG retrieval.
 *
 * Chunks are hand-curated, conservative plain-language summaries of
 * well-established fibromyalgia guidance (ACR diagnostic criteria, EULAR
 * management recommendations, and widely-accepted self-management practice).
 * They deliberately avoid dosages, specific drug regimens, and anything a
 * care team must individualize — the companion cites them as background,
 * never as instructions to act on.
 *
 * To extend: append a chunk here. Every chunk is schema-validated at module
 * load so a malformed entry fails fast in tests/build rather than mid-chat.
 */

import { knowledgeChunkSchema, type KnowledgeChunk } from "./types";

const RAW_CHUNKS: Array<Record<string, unknown>> = [
  {
    id: "acr-criteria-2010",
    title: "How fibromyalgia is diagnosed (ACR 2010 criteria)",
    source: "FibroCare clinical summary of ACR diagnostic criteria",
    domains: ["diagnosis"],
    keywords: [
      "diagnosis", "diagnosed", "criteria", "widespread", "tender",
      "points", "wpi", "ss", "test", "blood",
    ],
    content:
      "The American College of Rheumatology's 2010 criteria define fibromyalgia by a Widespread Pain Index (pain in at least 7 of 19 body areas) combined with symptom severity (fatigue, unrefreshing sleep, cognitive difficulty) lasting at least 3 months. There is no blood test or scan that confirms fibromyalgia; diagnosis is clinical and partly one of exclusion, which is why doctors often order labs to rule out other conditions first. Many people wait years for a diagnosis because symptoms overlap with other conditions.",
  },
  {
    id: "eular-management-overview",
    title: "General management approach (EULAR recommendations)",
    source: "FibroCare clinical summary of EULAR management recommendations",
    domains: ["diagnosis", "medications", "exercise", "mental-health"],
    keywords: [
      "treatment", "manage", "management", "guidelines", "eular",
      "therapy", "options", "help",
    ],
    content:
      "EULAR (European Alliance of Associations for Rheumatology) recommendations emphasize that fibromyalgia care should start with non-drug approaches: patient education, graded exercise, and cognitive behavioral therapy are first-line. Medications are considered when non-drug strategies are not enough, and choices are highly individual — a care team should guide them. The overall goal is improving function and quality of life rather than eliminating pain entirely.",
  },
  {
    id: "flare-management",
    title: "Managing a fibromyalgia flare",
    source: "FibroCare clinical summary of flare self-management practice",
    domains: ["flares", "pacing"],
    keywords: [
      "flare", "flaring", "flare-up", "worse", "crash", "bad day",
      "pain spike", "episode",
    ],
    content:
      "A fibromyalgia flare is a temporary period of sharply increased pain, fatigue, or cognitive symptoms, often triggered by stress, poor sleep, overexertion, illness, or weather changes. During a flare the generally recommended approach is to lower demands rather than push through: cancel or postpone non-essential tasks, prioritize rest in a comfortable sensory environment, keep gentle movement (short walks, stretching) if tolerable, stay hydrated, and resume normal activity gradually afterward to avoid a crash-rebound cycle. If a flare is severe, unusually long, or accompanied by new symptoms (fever, numbness, chest pain), contacting a care team is advised.",
  },
  {
    id: "exercise-protocols",
    title: "Exercise and movement for fibromyalgia",
    source: "FibroCare clinical summary of graded exercise evidence",
    domains: ["exercise", "pacing"],
    keywords: [
      "exercise", "walking", "movement", "stretch", "yoga", "swimming",
      "pool", "strength", "physiotherapy", "active",
    ],
    content:
      "Graded aerobic and strengthening exercise has the strongest evidence of any non-drug intervention for fibromyalgia. The key principle is starting far below capacity and increasing very slowly (for example, a few minutes of walking or warm-water pool sessions), because sudden ambitious routines commonly trigger flares and dropout. Low-impact options — walking, swimming, water aerobics, tai chi, yoga — tend to be better tolerated than high-impact activity. Mild, temporary symptom increases when starting are normal; sharp multi-day worsening means scaling back and progressing more slowly.",
  },
  {
    id: "sleep-hygiene",
    title: "Sleep and fibromyalgia",
    source: "FibroCare clinical summary of sleep hygiene practice",
    domains: ["sleep"],
    keywords: [
      "sleep", "insomnia", "tired", "fatigue", "rest", "bed", "night",
      "awake", "unrefreshed", "nap",
    ],
    content:
      "Most people with fibromyalgia experience non-restorative sleep, and poor sleep both mimics and worsens fibromyalgia symptoms. Commonly recommended sleep hygiene practices: keep a consistent sleep-wake schedule including weekends; reserve the bed for sleep only; get morning daylight and limit screens before bed; avoid caffeine late in the day; keep the bedroom cool, dark, and quiet; and time daytime naps early and short (20–30 minutes) when needed. If sleep problems persist despite good habits, they are worth raising with a care team, as treating sleep is one of the highest-leverage interventions for overall symptoms.",
  },
  {
    id: "pacing-spoon-theory",
    title: "Pacing and energy management",
    source: "FibroCare clinical summary of activity pacing practice",
    domains: ["pacing", "flares"],
    keywords: [
      "pacing", "energy", "spoons", "overdo", "overexert", "boom",
      "bust", "activity", "rest breaks", "burnout",
    ],
    content:
      "Activity pacing — spreading effort across the day with planned rests instead of doing everything on good days — is a core self-management skill for fibromyalgia. The 'boom-bust' cycle (overdoing on better days, then crashing for several) is one of the most common patterns reported. Practical pacing: break tasks into small steps with short rest breaks, alternate physical and mental tasks, set time-based (not finish-based) stopping points, and keep daily activity roughly even rather than swinging with how you feel. Tracking energy (as FibroCare's spoon tracker does) makes the personal boom-bust pattern visible.",
  },
  {
    id: "medication-overview",
    title: "What to know about fibromyalgia medications",
    source: "FibroCare clinical summary of medication evidence categories",
    domains: ["medications"],
    keywords: [
      "medication", "medicine", "drug", "pills", "amitriptyline",
      "duloxetine", "pregabalin", "side effects", "dose",
    ],
    content:
      "Medications used in fibromyalgia fall mainly into three evidence categories: certain antidepressants (such as amitriptyline and duloxetine), certain anticonvulsants (such as pregabalin), and simple analgesics. Response is highly individual — what helps one person may do nothing or cause side effects in another — and guidelines consistently recommend combining any medication with exercise and sleep management rather than relying on medication alone. Dose changes, combinations, and stopping should always be coordinated with the prescribing care team; abruptly stopping some of these medications can cause withdrawal effects.",
  },
  {
    id: "cognitive-symptoms-fibro-fog",
    title: "Cognitive symptoms ('fibro fog')",
    source: "FibroCare clinical summary of fibro fog research",
    domains: ["diagnosis", "mental-health", "sleep"],
    keywords: [
      "fog", "fibro fog", "memory", "forget", "concentration", "focus",
      "brain", "word finding", "confusion", "cognitive",
    ],
    content:
      "'Fibro fog' refers to the cognitive difficulties many people with fibromyalgia report: trouble concentrating, word-finding problems, short-term memory lapses, and mental sluggishness. Research links it to pain intensity and poor sleep rather than to dementia or permanent damage, and it typically fluctuates with symptom activity. Commonly suggested coping strategies: external memory aids (notes, lists, reminders), single-tasking instead of multitasking, scheduling demanding mental work during personal peak hours, and treating sleep and pain — which usually improves the fog as well.",
  },
  {
    id: "complementary-approaches",
    title: "Complementary and mind-body approaches",
    source: "FibroCare clinical summary of complementary therapy evidence",
    domains: ["complementary", "mental-health", "exercise"],
    keywords: [
      "meditation", "mindfulness", "yoga", "tai chi", "acupuncture",
      "massage", "breathing", "relaxation", "cbt", "therapy",
    ],
    content:
      "Among complementary approaches, the better-studied options for fibromyalgia include tai chi, yoga, mindfulness-based stress reduction, and cognitive behavioral therapy (CBT), several of which show moderate benefit for pain and function in clinical trials. Slow breathing and relaxation techniques help many people during acute symptom spikes, which is why FibroCare's Calming Mode uses paced breathing. Evidence for acupuncture and massage is mixed but risk is generally low. Complementary approaches work best alongside — not instead of — the plan agreed with a care team.",
  },
  {
    id: "weather-triggers",
    title: "Weather and fibromyalgia symptoms",
    source: "FibroCare clinical summary of weather-sensitivity research",
    domains: ["flares"],
    keywords: [
      "weather", "rain", "humidity", "pressure", "cold", "heat",
      "season", "temperature", "climate",
    ],
    content:
      "Many people with fibromyalgia report that weather changes — especially drops in barometric pressure, high humidity, and cold — worsen pain and fatigue. Research findings are mixed: studies generally confirm that a substantial subgroup is weather-sensitive, but the effect varies greatly between individuals, and no single weather variable reliably predicts flares for everyone. Tracking personal symptoms against local conditions (as FibroCare's weather insights do) is the most practical way to identify an individual's own triggers, which can then inform planning around high-risk days.",
  },
];

/** Validated knowledge base — a malformed chunk throws at module load. */
export const KNOWLEDGE_BASE: KnowledgeChunk[] = RAW_CHUNKS.map((c) =>
  knowledgeChunkSchema.parse(c)
);
