/**
 * Medication adherence ↔ symptom correlation.
 *
 * Pure function: adherence + morning pain + sleep quality series in,
 * Zod-validated deltas out. A negative painDelta / positive sleepDelta means
 * on-schedule days are objectively better for this patient.
 */

import {
  adherenceCorrelationSchema,
  adherenceSeriesSchema,
} from "./types";

function mean(xs: number[]): number | null {
  if (xs.length === 0) return null;
  return Math.round((xs.reduce((s, v) => s + v, 0) / xs.length) * 10) / 10;
}

export function correlateAdherence(rawSeries: unknown) {
  const series = adherenceSeriesSchema.parse(rawSeries);

  const adherent = series.filter((d) => d.takenOnSchedule);
  const missed = series.filter((d) => !d.takenOnSchedule);

  const painAdherent = mean(adherent.map((d) => d.morningPain).filter((v): v is number => v !== null));
  const painMissed = mean(missed.map((d) => d.morningPain).filter((v): v is number => v !== null));
  const sleepAdherent = mean(adherent.map((d) => d.sleepQuality).filter((v): v is number => v !== null));
  const sleepMissed = mean(missed.map((d) => d.sleepQuality).filter((v): v is number => v !== null));

  const painDelta =
    painAdherent !== null && painMissed !== null
      ? Math.round((painAdherent - painMissed) * 10) / 10
      : null;
  const sleepDelta =
    sleepAdherent !== null && sleepMissed !== null
      ? Math.round((sleepAdherent - sleepMissed) * 10) / 10
      : null;

  const r1 = (x: number | null) => (x === null ? "n/a" : x.toFixed(1));
  let interpretation: string;
  if (painDelta === null && sleepDelta === null) {
    interpretation =
      "Not enough days with both adherent and missed doses to compare yet — keep logging.";
  } else if ((painDelta !== null && painDelta < -0.5) || (sleepDelta !== null && sleepDelta > 0.5)) {
    interpretation = `On-schedule days look better for you (pain Δ ${r1(painDelta)}, sleep Δ ${r1(sleepDelta)}) — consistency seems to pay off.`;
  } else if ((painDelta !== null && painDelta > 0.5) || (sleepDelta !== null && sleepDelta < -0.5)) {
    interpretation = `On-schedule days do not look better (pain Δ ${r1(painDelta)}, sleep Δ ${r1(sleepDelta)}) — worth discussing timing or regimen with your care team.`;
  } else {
    interpretation = `No clear difference yet between on-schedule and missed days (pain Δ ${r1(painDelta)}, sleep Δ ${r1(sleepDelta)}).`;
  }

  return adherenceCorrelationSchema.parse({
    comparedDays: Math.min(adherent.length, missed.length),
    painDelta,
    sleepDelta,
    interpretation,
  });
}
