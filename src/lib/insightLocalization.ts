import type { Insight } from "@/lib/insightEngine";
import type { TranslationKey } from "@/lib/translations";

/**
 * Shared AI-insight localization.
 *
 * The insight engine emits language-neutral `id`s plus raw `params`; these
 * maps turn them into localized titles/messages (with a graceful fallback to
 * the engine's English copy when an id isn't known). Used by the dashboard's
 * AI Insights widget and the Reports page's Key Insights list.
 */

const INSIGHT_TITLE_KEYS: Partial<Record<string, TranslationKey>> = {
  "high-pain-avg": "insight.highPainAvg.title",
  "low-pain-avg": "insight.lowPainAvg.title",
  "freq-flares": "insight.frequentFlares.title",
  "flares-rising": "insight.recurringFlares.title",
  "trend-worsening": "insight.trendWorsening.title",
  "trend-improving": "insight.trendImproving.title",
  "weekday-pattern": "insight.weekdayPattern.title",
};

const INSIGHT_MESSAGE_KEYS: Partial<Record<string, TranslationKey>> = {
  "high-pain-avg": "insight.highPainAvg.message",
  "low-pain-avg": "insight.lowPainAvg.message",
  "freq-flares": "insight.frequentFlares.message",
  "flares-rising": "insight.recurringFlares.message",
  "trend-worsening": "insight.trendWorsening.message",
  "trend-improving": "insight.trendImproving.message",
  "weekday-pattern": "insight.weekdayPattern.message",
};

const SYMPTOM_KEYS: Record<string, TranslationKey> = {
  "widespread-pain": "logging.symptoms.widespreadPain",
  fatigue: "logging.symptoms.fatigue",
  "sleep-problems": "logging.symptoms.sleepProblems",
  "fibro-fog": "logging.symptoms.fibroFog",
  headache: "logging.symptoms.headache",
  "tender-points": "logging.symptoms.tenderPoints",
  stiffness: "logging.symptoms.stiffness",
  sensitivity: "logging.symptoms.sensitivity",
};

export function localizeInsight(
  insight: Insight,
  locale: string,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
): { title: string; message: string } {
  const params: Record<string, string | number> = { ...(insight.params ?? {}) };

  // Day-of-week: the engine stores the numeric weekday (0–6); format it in
  // the active locale so Arabic reads الأحد/الاثنين/… (Jan 1 2024 = Monday).
  if (typeof params.dayOfWeek === "number") {
    params.day = new Date(2024, 0, params.dayOfWeek).toLocaleDateString(
      locale === "ar" ? "ar" : "en-US",
      { weekday: "long" }
    );
  }
  // Symptom ids are stored in English; map them to localized symptom names.
  if (typeof params.symptom === "string" && SYMPTOM_KEYS[params.symptom]) {
    params.symptom = t(SYMPTOM_KEYS[params.symptom]);
  }

  if (insight.id === "symptom-correlation") {
    const positive = typeof params.delta === "number" ? params.delta > 0 : true;
    if (!positive) params.delta = Math.abs(Number(params.delta));
    return {
      title: t(
        positive
          ? "insight.symptomCorrelation.positive.title"
          : "insight.symptomCorrelation.negative.title"
      ),
      message: t(
        positive
          ? "insight.symptomCorrelation.positive.message"
          : "insight.symptomCorrelation.negative.message",
        params
      ),
    };
  }

  const titleKey = INSIGHT_TITLE_KEYS[insight.id];
  const messageKey = INSIGHT_MESSAGE_KEYS[insight.id];
  if (!titleKey || !messageKey) {
    return { title: insight.title, message: insight.message };
  }
  return { title: t(titleKey, params), message: t(messageKey, params) };
}
