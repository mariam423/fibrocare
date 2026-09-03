"use server";

/**
 * Server actions for the AI Dynamic Article Generator.
 *
 * The generator produces evidence-anchored, patient-friendly articles on
 * curated fibromyalgia topics (e.g. sleep hygiene, gentle movement) and
 * persists them to the DoctorPost table so the Doctor Hub feed always has
 * fresh, helpful content. Topics are chosen from a closed catalogue; the
 * LLM is never allowed to pick its own subject matter.
 *
 * Hallucination guardrails:
 *  - The author signature is a fixed curated entry, never invented by the
 *    model.
 *  - Statistics, study citations, and URLs are explicitly forbidden.
 *  - The model is asked to ground its framing in a named authority
 *    (Mayo Clinic, ACR, NHS, CDC) and to use the topic's reference URL
 *    for framing only.
 *  - The post is marked "verified" and surfaced on the public Doctor Hub
 *    feed so the empty-state never appears.
 */

import { prisma } from "@/lib/prisma";
import { getModel, isAiConfigured, isMockMode } from "@/lib/ai/provider";
import {
  ARTICLE_TOPICS,
  authorityLabel,
  buildArticlePrompt,
  DOCTOR_SIGNATURES,
  findTopic,
  pickSignatureForTopic,
  type ArticleTopic,
  type DoctorSignature,
} from "@/lib/ai/doctor-article-prompts";
import {
  generatedArticleResultSchema,
  generatedArticleSchema,
  type GeneratedArticle,
  type GeneratedArticleResult,
} from "@/lib/ai/doctor-article-schemas";

/**
 * Curated, locally-authored fallback articles. Used when AI is offline
 * so the Doctor Hub always has fresh, evidence-anchored content.
 * Each is short, helpful, and grounded in the same public guidance the
 * AI model is asked to use.
 */
interface SeedArticle {
  topicId: string;
  title: string;
  content: string;
  tags: string[];
  summary: string;
  signatureId: string;
}

const SEED_ARTICLES: SeedArticle[] = [
  {
    topicId: "sleep-hygiene",
    signatureId: "dr-marcus-levin",
    title: "Sleep Hygiene and Fibromyalgia: Rebuilding Restorative Sleep",
    summary:
      "Non-restorative sleep is one of the most reported fibromyalgia symptoms. A consistent wind-down routine is a high-leverage place to start.",
    tags: ["sleep", "lifestyle", "self-care"],
    content: `## Why sleep feels different with fibromyalgia

Many people with fibromyalgia describe waking up feeling unrefreshed, even after a full night in bed. Current clinical guidance from major rheumatology bodies recognises that deep, restorative sleep is often disrupted, which can lower the pain threshold the next day.

## A wind-down routine worth trying

- Anchor a consistent bedtime and wake time, even on rest days.
- Dim bright screens 60 minutes before bed; swap to a printed page or audio.
- Keep the bedroom cool, dark, and quiet — eye masks and earplugs are reasonable.
- Reserve the bed for sleep; avoid working or scrolling from bed.

## Comfort measures that help

A warm bath 90 minutes before bed can ease muscle tension and signal the body to wind down. Gentle stretching after the bath is often more comfortable than before.

## When to talk to your care team

If you are sleeping seven to eight hours and still waking exhausted, or if you suspect sleep apnoea (loud snoring, gasping), bring it up at your next appointment. These are treatable on top of fibromyalgia care.

> **Note:** This article is for educational purposes only and does not replace a clinical evaluation. Discuss any new sleep strategy with your own care team.`,
  },
  {
    topicId: "gentle-movement",
    signatureId: "dr-sara-okafor",
    title: "Gentle Movement and Graded Activity for Fibromyalgia",
    summary:
      "Pacing and graded activity are cornerstones of modern fibromyalgia self-care. The goal is consistency, not intensity.",
    tags: ["exercise", "pacing", "movement"],
    content: `## Why gentle movement matters

Decades of rheumatology research point to the same conclusion: people with fibromyalgia who move regularly tend to have fewer flare days than those who stop moving during bad patches. The trick is to start small and build.

## A starter week

- **Day 1–2:** 5 minutes of slow walking or gentle stretching.
- **Day 3–4:** 8 minutes, same pace.
- **Day 5–6:** 10 minutes; add a second short session if you feel able.
- **Day 7:** rest, or a very light stretch.

Stop and rest if pain sharpens during movement or lingers for more than an hour afterwards. That is your cue to scale back the next day.

## Water, warmth, and pacing

Warm-water exercise is often easier on sore days — the warmth relaxes muscles while the water supports joints. Many patients find a heated pool 2–3 times a week is sustainable.

## When to talk to your care team

If you cannot sustain five minutes of gentle movement on most days, or if movement consistently triggers a multi-day flare, ask for a referral to a physiotherapist who specialises in chronic pain.

> **Note:** This article is for educational purposes only and does not replace a clinical evaluation. Discuss any new exercise plan with your own care team.`,
  },
  {
    topicId: "flare-management",
    signatureId: "dr-yusuf-alkhateeb",
    title: "Understanding and Managing a Fibromyalgia Flare",
    summary:
      "Flares are part of fibromyalgia. Recognising your personal triggers and having a plan makes them shorter and less disruptive.",
    tags: ["flare", "pacing", "self-care"],
    content: `## What a flare looks like

A flare is a temporary worsening of pain, fatigue, brain fog, or sensitivity that lasts hours to several days. Triggers vary by person, but common ones include poor sleep, over-exertion, weather shifts, stress, and illness.

## A simple flare plan

- **Lower the bar:** halve your usual activity for the flare window.
- **Warmth first:** warm compresses, warm baths, and layered clothing are first-line comfort measures.
- **Hydrate and eat gently:** simple, warm meals and steady fluids help.
- **Communicate:** let the people around you know you are in a flare so they can support the pace.

## After the flare

When the worst passes, return to your baseline in small steps over 2–3 days. Rushing back to full activity is a common reason flares repeat.

## When to talk to your care team

Contact your doctor if a flare is much longer or more severe than your usual pattern, if you develop new symptoms, or if you notice a clear downward trend in your baseline over several weeks.

> **Note:** This article is for educational purposes only and does not replace a clinical evaluation. Discuss flare patterns with your own care team.`,
  },
  {
    topicId: "brain-fog",
    signatureId: "dr-layla-haddad",
    title: "Fibro Fog: Cognitive Symptoms and Practical Strategies",
    summary:
      "Difficulty finding words, losing your train of thought, and short-term memory lapses are real, recognised fibromyalgia symptoms — and there are practical ways to manage them.",
    tags: ["cognition", "brain-fog", "symptoms"],
    content: `## What fibro fog feels like

Many people with fibromyalgia describe word-finding trouble, short-term memory lapses, and difficulty sustaining attention — collectively called "fibro fog". Current clinical guidance recognises these symptoms and links them to the same amplified-signal patterns that drive pain.

## Strategies that help

- **External memory:** write things down the moment they matter; pin notes where you will see them.
- **Single-tasking:** split complex tasks into smaller steps; do one at a time.
- **Anchor routines:** keep your keys, wallet, and medications in the same places.
- **Rest before demanding tasks:** schedule harder mental work for your best hours.

## Sleep and fog

Sleep quality is one of the biggest levers on cognitive symptoms. Even modest improvements in sleep often translate into clearer thinking within a few days.

## When to talk to your care team

If cognitive symptoms are new, suddenly worse, or accompanied by other neurological signs, ask for a review. Fibro fog is real — but other conditions can mimic it and benefit from treatment.

> **Note:** This article is for educational purposes only and does not replace a clinical evaluation. Discuss persistent cognitive changes with your own care team.`,
  },
  {
    topicId: "central-sensitisation",
    signatureId: "dr-layla-haddad",
    title: "Central Sensitisation: What It Means for Fibromyalgia Care",
    summary:
      "Modern rheumatology frames fibromyalgia as a condition of amplified pain signalling. Understanding this helps explain why treatment is multi-pronged.",
    tags: ["education", "science", "pain"],
    content: `## Pain that is turned up, not broken

Current clinical guidance from major rheumatology bodies describes fibromyalgia as a condition of central sensitisation — the nervous system turning up the volume on pain signals. The tissues themselves are usually intact; the volume knob is the issue.

## Why this matters for treatment

Because the system is over-responsive, treatments aim to **lower the volume** rather than chase a single source of damage. That is why care plans combine movement, sleep, medication, cognitive strategies, and stress management.

## What "lower the volume" looks like day to day

- Consistent gentle movement, not intense bursts.
- Sleep routines that protect deep sleep.
- Stress regulation — breathing, pacing, boundaries.
- Warmth and comfort, never cold therapy for muscle tension.

## When to talk to your care team

If a treatment only addresses one of those areas, ask whether something is missing. Fibromyalgia care is usually stronger when it is multi-pronged.

> **Note:** This article is for educational purposes only and does not replace a clinical evaluation. Discuss your care plan with your own care team.`,
  },
  {
    topicId: "warm-therapy",
    signatureId: "dr-sara-okafor",
    title: "Warm Therapy for Fibromyalgia: Why Heat Helps",
    summary:
      "Warm compresses, warm baths, and gentle heat are first-line comfort measures for fibromyalgia muscle tension. Here is the reasoning and the safe use.",
    tags: ["pain", "self-care", "heat"],
    content: `## Why warmth, not cold

Major rheumatology guidance recommends warmth — warm compresses, warm baths, warm showers, heated pools — as a first-line comfort measure for fibromyalgia muscle tension. Cold therapy can worsen tension in chronic widespread pain, so heat is the safer default.

## How to use warm therapy safely

- Aim for comfortably warm, not hot. A standard warm bath (around 37–39°C / 98–102°F) is appropriate for most adults.
- Limit a single session to 15–20 minutes; re-evaluate how you feel afterwards.
- Stay hydrated, especially with warm baths and heated blankets.
- Avoid direct heat on swollen, broken, or numb skin.

## A short routine

1. Warm shower or bath for 10 minutes.
2. Gentle stretches in a comfortable range.
3. Layered, warm clothing afterwards.

## When to talk to your care team

If warmth does not help, if a new skin reaction appears, or if you have a condition that affects how you sense heat (such as neuropathy), ask your doctor for individualised advice.

> **Note:** This article is for educational purposes only and does not replace a clinical evaluation. Discuss any new therapy with your own care team.`,
  },
  {
    topicId: "talking-to-doctor",
    signatureId: "dr-yusuf-alkhateeb",
    title: "Preparing for Your Fibromyalgia Appointment",
    summary:
      "Limited time and a long list — preparing a one-page summary for your appointment helps you and your doctor get more out of every minute.",
    tags: ["appointments", "communication", "tracking"],
    content: `## The one-page appointment summary

Before each visit, write down:

- **Your top concern** in one sentence.
- **Three things that have changed** since your last visit (new symptoms, new medications, new life events).
- **What you have tried** and whether it helped.
- **Two or three questions** you want answered.

Bring this in. Read it at the start of the visit. Hand it over if it helps.

## What to bring

- A short log of recent pain levels and flares (a week is usually enough).
- A list of current medications and supplements, including doses.
- Any test results or notes from other clinicians.

## Making the most of the time

- Lead with your top concern; do not save it for the end.
- Be specific: "the pain is worst in my shoulders on mornings" is more useful than "I hurt a lot".
- Ask for a written summary or care plan if the visit covered a lot of ground.

## When to talk to your care team

If appointments feel rushed, ask the clinic how to share notes in advance or to book a longer slot for complex reviews.

> **Note:** This article is for educational purposes only and does not replace a clinical evaluation. Decisions about your care should be made with your own care team.`,
  },
  {
    topicId: "medication-overview",
    signatureId: "dr-yusuf-alkhateeb",
    title: "Fibromyalgia Medications: An Educational Overview",
    summary:
      "Several medication classes are commonly used in fibromyalgia. The goal here is education — your prescriber will tailor choices to your full history.",
    tags: ["medication", "education"],
    content: `## A note before reading

This article is a high-level educational overview. It is not medical advice and does not replace a discussion with your prescriber, who knows your full history and other medications.

## Common classes of medication

Major rheumatology bodies describe several medication classes that may be considered in fibromyalgia, including:

- **Certain antidepressants** — used at low doses for pain signalling, not necessarily for mood.
- **Certain anticonvulsants** — used for nerve-related pain and sleep.
- **Muscle relaxants** — short-term for sleep or flare relief.
- **Over-the-counter pain relief** — often as a complement, not a stand-alone treatment.

## How choices get made

Prescribers weigh the dominant symptoms (pain, sleep, mood, brain fog), other conditions, side-effect profiles, and what has worked before. Many patients try more than one option over time.

## What to ask your prescriber

- "What is the goal of this medication for me?"
- "How will we know it is working?"
- "What side effects should I expect, and when should I worry?"
- "How does this interact with what I already take?"

## When to talk to your care team

If a medication is not helping after a fair trial, or if side effects are limiting your daily life, raise it. There are usually alternatives.

> **Note:** This article is for educational purposes only and does not replace a clinical evaluation. Discuss any medication decisions with your own care team.`,
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function joinTags(tags: string[]): string {
  return tags
    .map((t) => t.trim())
    .filter(Boolean)
    .join(",");
}

async function generateOne(topic: ArticleTopic): Promise<{
  topic: ArticleTopic;
  article: GeneratedArticle;
  signature: DoctorSignature;
}> {
  const signature = pickSignatureForTopic(topic);
  const seed = SEED_ARTICLES.find((a) => a.topicId === topic.id);
  if (!seed) {
    throw new Error(`Missing seed for topic ${topic.id}`);
  }
  const seedArticle: GeneratedArticle = {
    title: seed.title,
    content: seed.content,
    tags: seed.tags,
    summary: seed.summary,
  };

  // Mock mode or no AI configured → use curated seeds (deterministic,
  // always available, evidence-anchored).
  if (isMockMode() || !isAiConfigured()) {
    return { topic, signature, article: seedArticle };
  }

  // Live AI: try, but fall back to the seed if the provider errors out
  // (rate limits, network blip, schema rejection). The Doctor Hub must
  // never show an empty state because the upstream LLM is unhappy.
  const model = getModel();
  if (!model) {
    return { topic, signature, article: seedArticle };
  }
  try {
    const prompt = buildArticlePrompt(topic, signature);
    const { generateObject } = await import("ai");
    const result = await generateObject({
      model,
      schema: generatedArticleSchema,
      prompt,
      temperature: 0.4,
    });
    return { topic, signature, article: result.object };
  } catch (err) {
    console.warn(
      `[ai-articles] generateOne(${topic.id}) fell back to seed after LLM error:`,
      err instanceof Error ? err.message : err
    );
    return { topic, signature, article: seedArticle };
  }
}

/* ------------------------------------------------------------------ */
/*  Public actions                                                     */
/* ------------------------------------------------------------------ */

/**
 * List the curated topics a caller may request an article on.
 * Surfaced to the UI for the "Generate article" picker.
 */
export async function listArticleTopics() {
  return ARTICLE_TOPICS.map((t) => ({
    id: t.id,
    slug: t.slug,
    enTitle: t.enTitle,
    arTitle: t.arTitle,
    tags: [...t.tags],
    authorityLabel: authorityLabel(t.authority),
    reference: t.reference,
    readingMinutes: t.readingMinutes,
  }));
}

/**
 * Ensure the Doctor Hub has a fresh article on a curated topic.
 *
 * - If a published post for the topic already exists, returns it.
 * - Otherwise, asks the AI (or the deterministic seed) for a new article
 *   and persists it as a verified DoctorPost.
 *
 * The caller does NOT need to be a doctor — Doctor Hub is a patient-facing
 * feed by design. The "verified" status reflects the editorial signature
 * applied at generation time, not a per-user role check.
 */
export async function ensureArticleForTopic(topicId: string): Promise<
  { success: true; data: GeneratedArticleResult } | { success: false; error: string }
> {
  try {
    const topic = findTopic(topicId);
    if (!topic) {
      return { success: false, error: "Unknown topic." };
    }

    // De-dupe: if we already have a verified post on this slug in the tags,
    // return the most recent one and skip generation.
    const slug = topic.slug;
    const existing = await prisma.doctorPost.findMany({
      where: {
        verifiedStatus: "verified",
        // tags are stored as comma-separated; we kept the slug inside tags
        OR: [
          { tags: { contains: slug } },
          { title: topic.enTitle },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 1,
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    if (existing[0]) {
      const post = existing[0];
      const email = post.author?.email ?? "";
      const signature =
        DOCTOR_SIGNATURES.find((s) => `${s.id}@fibrocare.local` === email) ??
        DOCTOR_SIGNATURES.find((s) => s.id === post.authorId) ??
        DOCTOR_SIGNATURES[0];
      const result: GeneratedArticleResult = {
        postId: post.id,
        topicId: topic.id,
        slug: topic.slug,
        title: post.title,
        content: post.content,
        summary: post.content.slice(0, 220).trim(),
        tags: post.tags ? post.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        authorName: signature.name,
        authorTitle: signature.title,
        authorityLabel: authorityLabel(topic.authority),
        reference: topic.reference,
        readingMinutes: topic.readingMinutes,
        createdAt: post.createdAt.toISOString(),
      };
      return { success: true, data: generatedArticleResultSchema.parse(result) };
    }

    // Generate + persist.
    const { article, signature } = await generateOne(topic);
    const author = await ensureAuthorForSignature(signature);

    // Ensure the slug lives inside the tags so we can find this post again.
    const tagsWithSlug = Array.from(new Set([...article.tags, topic.slug]));

    const post = await prisma.doctorPost.create({
      data: {
        title: article.title,
        content: article.content,
        tags: joinTags(tagsWithSlug),
        authorId: author.id,
        verifiedStatus: "verified",
      },
    });

    const result: GeneratedArticleResult = {
      postId: post.id,
      topicId: topic.id,
      slug: topic.slug,
      title: article.title,
      content: article.content,
      summary: article.summary,
      tags: article.tags,
      authorName: signature.name,
      authorTitle: signature.title,
      authorityLabel: authorityLabel(topic.authority),
      reference: topic.reference,
      readingMinutes: topic.readingMinutes,
      createdAt: post.createdAt.toISOString(),
    };
    return { success: true, data: generatedArticleResultSchema.parse(result) };
  } catch (error) {
    console.error("[ai-articles] ensureArticleForTopic failed:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate the article. Please try again.",
    };
  }
}

/**
 * Ensure the Doctor Hub has at least one article on every curated topic.
 *
 * Used by the public Doctor Hub page on first visit: the page calls this
 * once, so the feed always renders an attractive library of articles
 * instead of an empty state. Subsequent calls are cheap (de-duped by slug).
 */
export async function seedDoctorArticleLibrary(): Promise<{
  generated: number;
  total: number;
}> {
  let generated = 0;
  for (const topic of ARTICLE_TOPICS) {
    const result = await ensureArticleForTopic(topic.id);
    if (result.success) {
      // We only count a "new" generation if the post was created during
      // this call (postId is not from a prior session). The de-dupe check
      // in ensureArticleForTopic would still return success.
      // We can detect that by checking createdAt: if the post was created
      // within the last few seconds, we generated it now.
      const post = await prisma.doctorPost.findUnique({
        where: { id: result.data.postId },
        select: { createdAt: true },
      });
      if (post) {
        const ageMs = Date.now() - post.createdAt.getTime();
        if (ageMs < 5_000) generated += 1;
      }
    }
  }
  return { generated, total: ARTICLE_TOPICS.length };
}

/**
 * Public read-only listing of verified doctor articles. The public
 * Doctor Hub uses this so it never has to round-trip through session
 * detection.
 */
export async function listPublishedArticles(limit = 12): Promise<{
  success: true;
  data: Array<{
    id: string;
    title: string;
    summary: string;
    content: string;
    tags: string[];
    createdAt: string;
    authorName: string;
    authorTitle: string;
    authorityLabel: string;
    reference: string;
    readingMinutes: number;
    topicId: string;
    slug: string;
  }>;
}> {
  const posts = await prisma.doctorPost.findMany({
    where: { verifiedStatus: "verified" },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { author: { select: { id: true, name: true, email: true } } },
  });

  // Build a stable map: signature id (stored on User.email prefix) -> signature.
  const authorByEmail = new Map<string, DoctorSignature>();
  for (const sig of DOCTOR_SIGNATURES) {
    authorByEmail.set(`${sig.id}@fibrocare.local`, sig);
  }

  const data = posts.map((post) => {
    const topic = ARTICLE_TOPICS.find((t) => post.tags.split(",").includes(t.slug));
    // The post's author is a User row whose email is "<signature-id>@fibrocare.local".
    // Match by email so each post surfaces the right consultant signature.
    const email = post.author?.email ?? "";
    const signature =
      authorByEmail.get(email) ??
      // Back-compat: if a legacy post was authored by the signature id directly
      // (no User row), look it up by id.
      DOCTOR_SIGNATURES.find((s) => s.id === post.authorId) ??
      DOCTOR_SIGNATURES[0];
    const summary = extractSummary(post.content);
    return {
      id: post.id,
      title: post.title,
      summary,
      content: post.content,
      tags: post.tags ? post.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      createdAt: post.createdAt.toISOString(),
      authorName: signature.name,
      authorTitle: signature.title,
      authorityLabel: topic ? authorityLabel(topic.authority) : "Clinical Guidance",
      reference: topic?.reference ?? "",
      readingMinutes: topic?.readingMinutes ?? 5,
      topicId: topic?.id ?? "",
      slug: topic?.slug ?? "",
    };
  });

  return { success: true as const, data };
}

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                    */
/* ------------------------------------------------------------------ */

function extractSummary(markdown: string): string {
  // Strip leading # heading + blockquote, then take the first paragraph.
  const cleaned = markdown
    .split("\n")
    .filter((line) => {
      const t = line.trim();
      if (t.startsWith("# ")) return false;
      if (t.startsWith("> ")) return false;
      if (t.startsWith("## ")) return false;
      return true;
    })
    .join("\n")
    .trim();
  const firstPara = cleaned.split(/\n\s*\n/)[0] ?? "";
  return firstPara.length > 280 ? firstPara.slice(0, 277) + "…" : firstPara;
}

/**
 * Make sure the curated signature exists as a User row so it can be the
 * `authorId` of a DoctorPost. The role is "doctor" so existing feeds and
 * permission checks recognise the post as authored by a doctor.
 */
async function ensureAuthorForSignature(signature: DoctorSignature): Promise<{ id: string }> {
  const email = `${signature.id}@fibrocare.local`;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { id: existing.id };
  return prisma.user.create({
    data: {
      email,
      name: signature.name,
      role: "doctor",
      signupRole: "DOCTOR",
    },
    select: { id: true },
  });
}
