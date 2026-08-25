import type { TranslationKey } from "@/lib/translations";

/**
 * Categories of smart notifications the engine can produce. Each maps to a
 * distinct icon, accent color, and copy template in the notification center.
 */
export type NotificationType =
  | "weather_trigger"
  | "medication_reminder"
  | "daily_checkin"
  | "zen_recommendation"
  | "ai_prediction";

/**
 * A persisted notification. `title` and `message` are *translation keys*
 * (plus `params` for interpolation), so the same object renders fully in
 * Arabic when the locale is `ar` and English when it is `en` — nothing is
 * baked in at creation time.
 */
export interface AppNotification {
  id: string;
  title: TranslationKey;
  message: TranslationKey;
  /** Interpolation params passed to `t()` for `title`/`message`. */
  params?: Record<string, string | number>;
  type: NotificationType;
  /** Epoch ms when the notification was created. */
  timestamp: number;
  read: boolean;
  /** Optional in-app route (e.g. "/zen") opened when the card is clicked. */
  actionUrl?: string;
}

/** Everything needed to create a notification (id/timestamp/read derived). */
export interface NotificationInput {
  id: string;
  title: TranslationKey;
  message: TranslationKey;
  params?: Record<string, string | number>;
  type: NotificationType;
  actionUrl?: string;
}

/**
 * A registered medication/supplement dose time. Mirrors the app's tracker
 * card schedule (morning supplement, mid-day pain relief, evening dose) so
 * reminders fire when a dose becomes due.
 */
export interface MedicationScheduleEntry {
  id: string;
  /** Display name, passed to the message template as `{name}`. */
  name: string;
  /** 0–23 local hour of the dose. */
  hour: number;
  /** 0–59 local minute of the dose. */
  minute: number;
  actionUrl?: string;
}
