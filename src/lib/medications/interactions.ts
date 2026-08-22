/**
 * AI Interaction Alert Engine — drug interaction checks for common
 * fibromyalgia medications and supplements.
 *
 * A curated, referenced rule table + deterministic matcher. This is a
 * safety *screening aid*, not a substitute for a pharmacist or prescriber —
 * every alert carries a "confirm with your care team" recommendation.
 */

import { interactionAlertSchema, medicationListSchema } from "./types";
import type { MedicationAlert, MedicationEntry } from "@/types/extended-health";

/** Interaction rule: fired when both generic names (or aliases) are present. */
interface InteractionRule {
  a: string[];
  b: string[];
  severity: MedicationAlert["severity"];
  effect: string;
  recommendation: string;
}

const RULES: InteractionRule[] = [
  {
    a: ["duloxetine", "cymbalta", "milnacipran", "savella", "venlafaxine"],
    b: ["tramadol", "ultram"],
    severity: "critical",
    effect:
      "Serotonin syndrome risk: both increase serotonin; combined use can cause agitation, rapid heart rate, high blood pressure, fever, and tremor.",
    recommendation:
      "Contact your prescriber before combining these. If you already take both and develop fever, confusion, muscle twitching, or a racing heart, seek urgent care.",
  },
  {
    a: ["duloxetine", "cymbalta", "milnacipran", "savella"],
    b: ["amitriptyline", "elavil", "cyclobenzaprine", "flexeril"],
    severity: "warning",
    effect:
      "Two serotonin-modulating drugs together raise the risk of serotonin syndrome and compound drowsiness.",
    recommendation:
      "This combination is sometimes prescribed deliberately — confirm the plan with your care team and report any new tremor, sweating, or restlessness.",
  },
  {
    a: ["pregabalin", "lyrica", "gabapentin", "neurontin"],
    b: ["amitriptyline", "elavil", "cyclobenzaprine", "flexeril", "tramadol", "ultram"],
    severity: "warning",
    effect:
      "Enhanced drowsiness, dizziness, and impaired concentration; fall risk increases, especially at night.",
    recommendation:
      "Avoid driving until you know the combined effect; take bedtime doses at bedtime, and mention any morning grogginess to your care team.",
  },
  {
    a: ["tramadol", "ultram"],
    b: ["amitriptyline", "elavil"],
    severity: "warning",
    effect:
      "Increased risk of seizures and serotonin syndrome with this tricyclic + opioid-like combination.",
    recommendation:
      "Only use under close supervision; report any jerking movements, confusion, or overheating promptly.",
  },
  {
    a: ["naltrexone"],
    b: ["tramadol", "ultram"],
    severity: "warning",
    effect:
      "Naltrexone can block opioid-like pain relief and may precipitate withdrawal symptoms.",
    recommendation:
      "Low-dose naltrexone and opioids/opioid-like drugs are usually not combined — ask your prescriber to review.",
  },
  {
    a: ["magnesium"],
    b: ["gabapentin", "neurontin", "pregabalin", "lyrica"],
    severity: "caution",
    effect:
      "Magnesium may slightly increase dizziness or sedation with these drugs; timing matters more than the combination.",
    recommendation:
      "Spacing doses a few hours apart usually resolves this — confirm timing with your pharmacist.",
  },
  {
    a: ["ibuprofen", "advil", "naproxen"],
    b: ["duloxetine", "cymbalta"],
    severity: "caution",
    effect:
      "NSAIDs with duloxetine slightly increase the risk of stomach bleeding.",
    recommendation:
      "Occasional use is common; take with food and tell your doctor about any stomach pain or black stools.",
  },
];

/** Check a medication list for interactions. Pure, deterministic, Zod-validated in/out. */
export function checkInteractions(rawEntries: unknown): MedicationAlert[] {
  const entries = medicationListSchema.parse(rawEntries) as MedicationEntry[];
  const names = entries.map((e) => e.name);

  const alerts: MedicationAlert[] = [];
  for (const rule of RULES) {
    const hitA = rule.a.find((alias) => names.includes(alias));
    const hitB = rule.b.find((alias) => names.includes(alias));
    if (hitA && hitB && hitA !== hitB) {
      alerts.push(
        interactionAlertSchema.parse({
          pair: [hitA, hitB],
          severity: rule.severity,
          effect: rule.effect,
          recommendation: rule.recommendation,
        }) as MedicationAlert
      );
    }
  }

  // Critical alerts always surface first.
  const order = { critical: 0, warning: 1, caution: 2 } as const;
  return alerts.sort((x, y) => order[x.severity] - order[y.severity]);
}

/** All generic names + aliases the rule table knows — used by UI autocomplete. */
export function knownMedicationNames(): string[] {
  return [...new Set(RULES.flatMap((r) => [...r.a, ...r.b]))].sort();
}
