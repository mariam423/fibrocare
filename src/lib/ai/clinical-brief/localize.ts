import type { ClinicalBrief } from "@/lib/ai/clinical-brief/types";
import type { Locale, TranslationKey } from "@/lib/translations";
import { cleanBriefText } from "@/lib/ai/clinical-brief/format";

export type Translate = (
  key: TranslationKey,
  params?: Record<string, string | number>
) => string;

export function flareDaysKey(count: number): TranslationKey {
  if (count === 0) return "reports.brief.flareDays.zero";
  if (count === 1) return "reports.brief.flareDays.one";
  if (count === 2) return "reports.brief.flareDays.two";
  return count <= 10 ? "reports.brief.flareDays.few" : "reports.brief.flareDays.many";
}

export const velocityKeyByValue: Record<
  ClinicalBrief["painProfile"]["velocity"],
  TranslationKey
> = {
  improving: "reports.brief.velocity.improving",
  stable: "reports.brief.velocity.stable",
  worsening: "reports.brief.velocity.worsening",
  "insufficient-data": "reports.brief.velocity.insufficientData",
};

export const trendKeyByValue: Record<
  ClinicalBrief["flareFrequency"]["trend"],
  TranslationKey
> = {
  rising: "reports.brief.trend.rising",
  falling: "reports.brief.trend.falling",
  stable: "reports.brief.trend.stable",
  "insufficient-data": "reports.brief.trend.insufficientData",
};

/** Localized headline sentence — Arabic reads the translated template. */
export function localizeBriefHeadline(
  brief: ClinicalBrief,
  locale: Locale,
  t: Translate
): string {
  if (locale !== "ar") return cleanBriefText(brief.headline);
  if (brief.painProfile.average === null) {
    return t("reports.brief.headline.noData");
  }
  const velocity =
    brief.painProfile.velocity === "insufficient-data"
      ? t(velocityKeyByValue[brief.painProfile.velocity])
      : `${t(velocityKeyByValue[brief.painProfile.velocity])}${
          brief.painProfile.velocityDelta !== null
            ? ` (Δ ${brief.painProfile.velocityDelta > 0 ? "+" : ""}${brief.painProfile.velocityDelta})`
            : ""
        }`;
  return t("reports.brief.headline", {
    days: brief.periodDays,
    avg: brief.painProfile.average,
    flares: t(flareDaysKey(brief.flareFrequency.flareDays), {
      count: brief.flareFrequency.flareDays,
    }),
    velocity,
  });
}

/**
 * Mirrors the engine's discussion-point conditions over the brief's
 * structured fields so the UI (and PDF export) can phrase them in the
 * active locale.
 */
export function buildLocalizedDiscussionPoints(
  brief: ClinicalBrief,
  t: Translate
): string[] {
  const points: string[] = [];
  const { painProfile, flareFrequency } = brief;

  if (flareFrequency.trend === "rising" || painProfile.velocity === "worsening") {
    points.push(t("reports.brief.discussion.worsening"));
  }
  if (painProfile.average !== null && painProfile.average >= 6) {
    points.push(t("reports.brief.discussion.painControl", { avg: painProfile.average }));
  }
  if (brief.patientReportedMedications.length > 0) {
    points.push(
      t("reports.brief.discussion.medicationsList", {
        meds: brief.patientReportedMedications.join(", "),
      })
    );
  } else {
    points.push(t("reports.brief.discussion.noMedications"));
  }
  const symptoms = brief.symptomProfile.mostReported;
  if (symptoms.includes("insomnia") || symptoms.includes("unrefreshing sleep")) {
    points.push(t("reports.brief.discussion.sleep"));
  }
  if (brief.topTriggers.length > 0) {
    points.push(
      t("reports.brief.discussion.weather", {
        factors: brief.topTriggers.map((trigger) => trigger.factor).join(", "),
      })
    );
  }
  if (points.length === 0) {
    points.push(t("reports.brief.discussion.default"));
  }
  return points.slice(0, 5);
}
