export interface HealthLog {
  id: string;
  painLevel: number;
  moodTag: string;
  notes: string | null;
  loggedAt: string | Date;
}

export interface PainTrendPoint {
  date: string;
  level: number;
}

export interface ServerActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}
