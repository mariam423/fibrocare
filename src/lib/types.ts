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
