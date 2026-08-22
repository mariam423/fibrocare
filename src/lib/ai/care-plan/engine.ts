/**
 * Deterministic Adaptive Daily Care Plan engine.
 *
 * Pure function: today's check-in (spoons + pain + optional mood) in, a
 * schema-validated micro-plan out. Higher pain shrinks the energy budget and
 * swaps movement for rest/sensory blocks; a good day adds gentle movement
 * and hydration prompts. The LLM (when configured) only re-words blocks —
 * it never decides the budget.
 */

import { carePlanSchema, type CarePlan } from "./types";

export interface CarePlanInput {
  /** ISO date key for the plan. */
  date: string;
  /** Spoons the user reports waking up with (1–12). */
  totalSpoons: number;
  /** Spoons already spent today (0–12). */
  spentSpoons: number;
  /** Current pain 0–10. */
  painLevel: number;
  mood?: string | null;
}

/** Pain adjustment: every 2 pain points above 3 costs roughly one spoon. */
export function computeEnergyBudget(input: CarePlanInput) {
  const totalSpoons = Math.max(1, Math.min(12, Math.round(input.totalSpoons)));
  const spentSpoons = Math.max(0, Math.min(12, Math.round(input.spentSpoons)));
  const pain = Math.max(0, Math.min(10, input.painLevel));

  const painPenalty = Math.max(0, Math.floor((pain - 3) / 2));
  const availableSpoons = Math.max(
    0,
    Math.min(12, totalSpoons - spentSpoons - painPenalty)
  );

  const rationale =
    pain >= 7
      ? `Pain ${pain}/10 is in flare range — the plan protects your remaining ${availableSpoons} spoon(s) and favors rest.`
      : pain >= 4
        ? `Pain ${pain}/10 trims the budget by ${painPenalty} spoon(s); the plan keeps effort light.`
        : `Pain ${pain}/10 is manageable — a balanced plan across your ${availableSpoons} available spoon(s).`;

  return { totalSpoons, spentSpoons, availableSpoons, adjustedForPain: pain, rationale };
}

type Block = CarePlan["blocks"][number];
type BlockDraft = Omit<Block, "id">;

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Build the adaptive plan for today's check-in. */
export function buildCarePlan(input: CarePlanInput): CarePlan {
  const budget = computeEnergyBudget(input);
  const low = budget.availableSpoons <= 2; // flare / near-empty day
  const moderate = budget.availableSpoons <= 5;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(input.date) ? input.date : todayKey();

  const drafts: BlockDraft[] = low
    ? [
        {
          type: "rest",
          timeOfDay: "morning",
          title: "Protected slow start",
          detail:
            "Stay in bed 15 extra minutes, then one small thing only. Everything else can wait.",
          spoonCost: 0,
          minutes: 15,
        },
        {
          type: "sensory-management",
          timeOfDay: "midday",
          title: "Dim the inputs",
          detail:
            "Lower lights, silence notifications, comfortable temperature — give your nervous system less to process.",
          spoonCost: 0,
          minutes: 10,
        },
        {
          type: "hydration",
          timeOfDay: "afternoon",
          title: "Small, steady sips",
          detail: "A glass of water within reach; dehydration quietly worsens pain and fog.",
          spoonCost: 0,
          minutes: 2,
        },
        {
          type: "mindful-break",
          timeOfDay: "evening",
          title: "Paced breathing",
          detail: "5 minutes of slow breathing (Calming Mode) before bed to down-shift pain signals.",
          spoonCost: 1,
          minutes: 5,
        },
      ]
    : moderate
      ? [
          {
            type: "gentle-movement",
            timeOfDay: "morning",
            title: "Easy warm-up",
            detail: "5 minutes of slow stretching or an easy indoor walk — stop before it feels like effort.",
            spoonCost: 1,
            minutes: 5,
          },
          {
            type: "rest",
            timeOfDay: "midday",
            title: "Planned horizontal pause",
            detail: "A real 20-minute lie-down with eyes closed, before you need it, not after.",
            spoonCost: 0,
            minutes: 20,
          },
          {
            type: "hydration",
            timeOfDay: "afternoon",
            title: "Water checkpoint",
            detail: "Two glasses across the afternoon; keep tasks single-stepped with breaks between.",
            spoonCost: 0,
            minutes: 3,
          },
          {
            type: "mindful-break",
            timeOfDay: "evening",
            title: "Unwind ritual",
            detail: "Screens off 30 minutes early; slow breathing or a warm shower to protect tonight's sleep.",
            spoonCost: 1,
            minutes: 10,
          },
        ]
      : [
          {
            type: "gentle-movement",
            timeOfDay: "morning",
            title: "Graded movement",
            detail: "10–15 minutes of walking, swimming, or yoga — slightly less than you feel you could do.",
            spoonCost: 2,
            minutes: 15,
          },
          {
            type: "hydration",
            timeOfDay: "midday",
            title: "Hydration + single-tasking",
            detail: "Steady water through the day; one task at a time keeps the budget from leaking.",
            spoonCost: 0,
            minutes: 3,
          },
          {
            type: "rest",
            timeOfDay: "afternoon",
            title: "Pre-emptive rest",
            detail: "15 minutes of proper rest mid-afternoon so the evening stays within budget.",
            spoonCost: 0,
            minutes: 15,
          },
          {
            type: "mindful-break",
            timeOfDay: "evening",
            title: "Wind-down",
            detail: "Light stretching plus calm breathing; bank the good day without over-spending it.",
            spoonCost: 1,
            minutes: 10,
          },
        ];

  const summary = low
    ? `Flare-level day — ${budget.availableSpoons} spoon(s) left. Rest is the plan.`
    : moderate
      ? `Take-it-steady day — ${budget.availableSpoons} spoon(s) to spend, gently.`
      : `Capacity day — ${budget.availableSpoons} spoon(s) available for graded activity.`;

  const safetyNote = low
    ? "If pain stays at this level for more than 2–3 days or new symptoms appear, contact your care team."
    : "Mild, temporary symptom increases are normal; sharp multi-day worsening means scale back.";

  return carePlanSchema.parse({
    date,
    budget,
    blocks: drafts.map((d, i) => ({ ...d, id: `plan-${date}-${i + 1}` })),
    summary,
    safetyNote,
  });
}
