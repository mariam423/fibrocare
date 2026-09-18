/**
 * Next-Day Flare Correlation Engine.
 *
 * Links evening/night food intake with the *next* morning's symptoms:
 * fatigue, joint pain, and brain-fog spikes. Purely deterministic data
 * analysis (no AI, no randomness) so the results are reproducible and
 * explainable to the patient.
 *
 * Method:
 *   1. Bucket meals by their `YYYY-MM-DD` key; keep the distinct food names
 *      eaten in the evening/late-night window (local hour >= 17).
 *   2. Score each day's *next* day from pain logs (max pain * 2) plus the
 *      severity of pain/fatigue/brain-fog symptoms.
 *   3. For every food seen in an evening meal (>= 2 evenings), compare the
 *      average next-day score of the evenings that contained it against the
 *      baseline (evenings without it) → a risk lift with a strength label.
 *   4. Surface a deterministic timing insight (late dinners vs. earlier
 *      dinners and next-day flares).
 *
 * This is correlation, not causation — the UI labels it as such.
 */

/* ------------------------------------------------------------------ */
/* Input shapes (deliberately loose so tests + actions share one type) */
/* ------------------------------------------------------------------ */

export interface MealItemLike {
  id: string;
  name: string;
}

export interface MealLogLike {
  id: string;
  date: string;
  eatenAt: Date | string;
  items: MealItemLike[];
}

export interface PainLogLike {
  loggedAt: Date | string;
  painLevel: number;
}

export interface SymptomLogLike {
  date: string;
  severity: number;
  symptom: string;
}

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

/** Local hour at or after which a meal counts as "evening/night". */
export const EVENING_WINDOW_HOUR = 17;

/** Symptom keywords that escalate the next-day flare score. */
const FLARE_SYMPTOM_PATTERNS: { re: RegExp; weight: number }[] = [
  { re: /pain|ache|stiff/i, weight: 1 },
  { re: /fatigue|exhaust|tired|low\s*energy/i, weight: 1 },
  { re: /fog|memo|focus|concen|brain|mental/i, weight: 1 },
];

/** Minimum evening occurrences before a food is even labeled. */
export const MIN_EVENING_OCCURRENCES = 2;

/** Next-day score at/above which we call the day a "flare morning". */
export const FLARE_THRESHOLD = 8;

/* ------------------------------------------------------------------ */
/* Date helpers (UTC-string safe, TZ-independent)                      */
/* ------------------------------------------------------------------ */

export function nextDay(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().slice(0, 10);
}

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function hourOf(value: Date | string | number): number {
  return new Date(value).getHours();
}

/* ------------------------------------------------------------------ */
/* Scoring                                                             */
/* ------------------------------------------------------------------ */

/** Next-day flare score for a single date key (0 = no data). */
export function flareScoreForDate(
  dateKey: string,
  painByDate: Map<string, number>,
  symptomsByDate: Map<string, SymptomLogLike[]> | undefined
): number {
  const maxPain = painByDate.get(dateKey) ?? 0;
  const symptoms = symptomsByDate?.get(dateKey) ?? [];
  let symptomScore = 0;
  for (const s of symptoms) {
    let weight = 0.5; // generic-symptom baseline weight
    for (const p of FLARE_SYMPTOM_PATTERNS) {
      if (p.re.test(s.symptom)) {
        weight = Math.max(weight, p.weight);
        break;
      }
    }
    symptomScore += s.severity * weight;
  }
  return maxPain * 2 + symptomScore;
}

/** Mean of an array (0 for empty). */
function mean(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

/* ------------------------------------------------------------------ */
/* Grade                                                               */
/* ------------------------------------------------------------------ */

export type RiskGrade = "high" | "moderate" | "watch";

export interface FoodCorrelation {
  food: string;
  occurrences: number;
  eveningOccurrences: number;
  avgNextDayScoreWhenConsumed: number;
  avgNextDayScoreWhenAbsent: number;
  lift: number;
  risk: RiskGrade;
  sampleDates: string[];
}

export interface TimingCorrelation {
  avgHourHighFlare: number | null;
  avgHourLowFlare: number | null;
  laterEveningLinkedToFlare: boolean;
  suggestedBeforeHour: number;
}

export interface FlareCorrelationReport {
  analyzedDays: number;
  baselineNextDayScore: number;
  foods: FoodCorrelation[];
  timing: TimingCorrelation;
}

/**
 * Grade a food's lift. Requires enough evening samples and a meaningful
 * absolute score — a tiny lift on an already-calm baseline is not a flare.
 */
export function gradeRisk(
  occurrences: number,
  avgWith: number,
  avgBaseline: number,
  lift: number
): RiskGrade {
  if (occurrences < MIN_EVENING_OCCURRENCES) return "watch";
  if (lift >= 1.35 && avgWith >= FLARE_THRESHOLD) return "high";
  if (lift >= 1.15 || (avgWith >= FLARE_THRESHOLD && avgBaseline < avgWith)) {
    return "moderate";
  }
  return "watch";
}

/* ------------------------------------------------------------------ */
/* Engine                                                              */
/* ------------------------------------------------------------------ */

export function analyzeFoodFlareCorrelation(
  meals: MealLogLike[],
  painLogs: PainLogLike[],
  symptomLogs: SymptomLogLike[]
): FlareCorrelationReport {
  // Index pain by local date key.
  const painByDate = new Map<string, number>();
  for (const p of painLogs) {
    const key = localDateKey(new Date(p.loggedAt));
    const current = painByDate.get(key) ?? 0;
    painByDate.set(key, Math.max(current, p.painLevel));
  }

  // Index symptoms by their string date key.
  const symptomsByDate = new Map<string, SymptomLogLike[]>();
  for (const s of symptomLogs) {
    const bucket = symptomsByDate.get(s.date) ?? [];
    bucket.push(s);
    symptomsByDate.set(s.date, bucket);
  }

  // Group meals by date; collect distinct evening foods per date.
  const mealsByDate = new Map<string, MealLogLike[]>();
  const eveningFoodsByDate = new Map<string, Set<string>>();
  const dinnerHoursByDate = new Map<string, number[]>();
  for (const meal of meals) {
    const bucket = mealsByDate.get(meal.date) ?? [];
    bucket.push(meal);
    mealsByDate.set(meal.date, bucket);

    const hour = hourOf(meal.eatenAt);
    const foods = meal.items.map((i) => i.name.trim().toLowerCase()).filter(Boolean);
    if (hour >= EVENING_WINDOW_HOUR && foods.length > 0) {
      const set = eveningFoodsByDate.get(meal.date) ?? new Set<string>();
      for (const f of foods) set.add(f);
      eveningFoodsByDate.set(meal.date, set);
      const hours = dinnerHoursByDate.get(meal.date) ?? [];
      hours.push(hour);
      dinnerHoursByDate.set(meal.date, hours);
    }
  }

  const eveningDates = [...eveningFoodsByDate.keys()].sort();
  const analyzedDays = eveningDates.length;

  // Baseline: average next-day score across all evenings with logged meals,
  // so the same cohort (people who log evening meals) is compared to itself.
  const baselineScores: number[] = [];
  const scoresWithoutFood = new Map<string, number[]>();
  const scoresWithFood = new Map<string, number[]>();
  const sampleDatesForFood = new Map<string, string[]>();
  const foodAnyDayCount = new Map<string, Set<string>>();

  // Track every food across ALL logged meals (any hour) for the total-day
  // signal; hour>=17 pushes the same food into the evening window pool.
  for (const dayMeals of mealsByDate.values()) {
    for (const dayMeal of dayMeals) {
      for (const item of dayMeal.items) {
        const name = item.name.trim().toLowerCase();
        if (!name) continue;
        const dates = foodAnyDayCount.get(name) ?? new Set<string>();
        dates.add(dayMeal.date);
        foodAnyDayCount.set(name, dates);
      }
    }
  }

  const allEveningFoods = new Set<string>();
  for (const foods of eveningFoodsByDate.values()) {
    for (const food of foods) allEveningFoods.add(food);
  }

  for (const date of eveningDates) {
    const next = nextDay(date);
    const score = flareScoreForDate(next, painByDate, symptomsByDate);
    baselineScores.push(score);

    const foodsThatDay = eveningFoodsByDate.get(date)!;
    // A day counts as "with food F" only when F was actually part of that
    // evening; otherwise it informs F's absent baseline.
    for (const food of allEveningFoods) {
      const has = foodsThatDay.has(food);
      const bucket = (has ? scoresWithFood : scoresWithoutFood).get(food) ?? [];
      bucket.push(score);
      (has ? scoresWithFood : scoresWithoutFood).set(food, bucket);
      if (has) {
        const dates = sampleDatesForFood.get(food) ?? [];
        dates.push(date);
        sampleDatesForFood.set(food, dates);
      }
    }
  }

  const baseline = mean(baselineScores);

  const scored: Array<FoodCorrelation & { riskPriority: number }> = [
    ...scoresWithFood.entries(),
  ].map(([food, withScores]) => {
    const without = scoresWithoutFood.get(food) ?? [];
    const avgWith = mean(withScores);
    // Without any "absent" evening sample there is nothing to compare
    // against → treat the comparison as neutral (lift = 1) rather than
    // inventing evidence for a flare link.
    const avgBaseline = without.length ? mean(without) : avgWith;
    const lift = avgBaseline > 0 ? avgWith / avgBaseline : 1;
    const risk = gradeRisk(withScores.length, avgWith, avgBaseline, lift);
    return {
      food,
      occurrences: foodAnyDayCount.get(food)?.size ?? withScores.length,
      eveningOccurrences: withScores.length,
      avgNextDayScoreWhenConsumed: Math.round(avgWith * 100) / 100,
      avgNextDayScoreWhenAbsent: Math.round(avgBaseline * 100) / 100,
      lift: Math.round(lift * 100) / 100,
      risk,
      riskPriority: RISK_PRIORITY[risk],
      sampleDates: (sampleDatesForFood.get(food) ?? []).slice(-5),
    };
  });

  const foods: FoodCorrelation[] = scored
    .filter((f) => f.eveningOccurrences >= MIN_EVENING_OCCURRENCES)
    .sort((a, b) => b.riskPriority - a.riskPriority || b.lift - a.lift)
    .map((food) => ({
      food: food.food,
      risk: food.risk,
      occurrences: food.occurrences,
      eveningOccurrences: food.eveningOccurrences,
      avgNextDayScoreWhenConsumed: food.avgNextDayScoreWhenConsumed,
      avgNextDayScoreWhenAbsent: food.avgNextDayScoreWhenAbsent,
      lift: food.lift,
      sampleDates: food.sampleDates,
    }));

  const timing = analyzeTimingCorrelation(dinnerHoursByDate, painByDate, symptomsByDate);

  return { analyzedDays, baselineNextDayScore: Math.round(baseline * 100) / 100, foods, timing };
}

const RISK_PRIORITY: Record<RiskGrade, number> = { high: 3, moderate: 2, watch: 1 };

function analyzeTimingCorrelation(
  dinnerHoursByDate: Map<string, number[]>,
  painByDate: Map<string, number>,
  symptomsByDate: Map<string, SymptomLogLike[]>
): TimingCorrelation {
  const highFlareHours: number[] = [];
  const lowFlareHours: number[] = [];
  for (const [date, hours] of dinnerHoursByDate) {
    const next = nextDay(date);
    const score = flareScoreForDate(next, painByDate, symptomsByDate);
    const avgHour = mean(hours);
    if (score >= FLARE_THRESHOLD) highFlareHours.push(avgHour);
    else lowFlareHours.push(avgHour);
  }

  const avgHigh = highFlareHours.length ? Math.round(mean(highFlareHours) * 10) / 10 : null;
  const avgLow = lowFlareHours.length ? Math.round(mean(lowFlareHours) * 10) / 10 : null;
  const laterEveningLinkedToFlare =
    avgHigh !== null && avgLow !== null && avgHigh >= avgLow + 1.5;

  return {
    avgHourHighFlare: avgHigh,
    avgHourLowFlare: avgLow,
    laterEveningLinkedToFlare,
    suggestedBeforeHour: laterEveningLinkedToFlare ? EVENING_WINDOW_HOUR : 21,
  };
}