export interface HealthLog {
  id: string;
  painLevel: number;
  moodTag: string;
  notes: string | null;
  loggedAt: string | Date;
  encryptedNotes?: string; // encrypted for sensitive data protection
}

export interface PainTrendPoint {
  date: string;
  level: number | null;
}

export interface ServerActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MealItemEntry {
  id?: string;
  name: string;
  amount?: string | null;
}

/** Client-side meal log row (warnings parsed, notes decrypted). */
export interface MealLogEntry {
  id: string;
  date: string;
  mealType: MealType;
  eatenAt: Date | string;
  energyBefore: number;
  warningsJson: string;
  notes: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  items: MealItemEntry[];
}

/** Patient's personal trigger-food row. */
export interface TriggerFoodEntry {
  id: string;
  name: string;
  severity: number;
  reactionNote: string | null;
  createdAt: Date | string;
}

/** Fog Shield coping tool a patient reached for during an episode. */
export type FogCopingTool = "BREATH" | "DUMP" | "MICROTASK" | "SOS" | "NONE";

/** Client-side fibro-fog log row (brain-dump text decrypted server-side). */
export interface FogLogEntry {
  id: string;
  intensity: number;
  triggers: string[];
  brainDumpText: string | null;
  copingToolUsed: FogCopingTool;
  createdAt: Date | string;
}
