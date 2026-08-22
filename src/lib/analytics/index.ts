/**
 * Privacy-first analytics wrapper.
 *
 * Ships disabled. Principles:
 *  - ZERO PII: events carry only a page name and a coarse category. No
 *    user ids, no health data, no notes, no free text, no IP retention.
 *  - OPT-OUT FIRST: the existing `fibrocare-analytics-opt-out` preference
 *    (Privacy & Security card) silences everything, and it is checked on
 *    every call so toggling takes effect immediately.
 *  - PROVIDER OPTIONAL: with no provider configured (default), `track`
 *    returns false and nothing leaves the device. When a provider is added,
 *    only `send()` needs an implementation — call sites never change.
 */

export const ANALYTICS_OPT_OUT_KEY = "fibrocare-analytics-opt-out";

/** Coarse, PII-free event categories. */
export const ANALYTICS_EVENTS = [
  "page_view",
  "checkin_completed",
  "toolkit_opened",
  "audio_session",
  "report_exported",
  "pricing_viewed",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export interface AnalyticsContext {
  event: AnalyticsEvent;
  /** Page/route name only — never a URL query string. */
  page: string;
  locale: "en" | "ar";
}

export function isOptedOut(
  storage: Pick<Storage, "getItem"> = typeof localStorage !== "undefined" ? localStorage : undefined as unknown as Storage
): boolean {
  return storage.getItem(ANALYTICS_OPT_OUT_KEY) === "true";
}

export function isProviderConfigured(): boolean {
  return false; // No external provider wired; flip when one is added.
}

/** Provider transport. No-op until a real provider (Vercel/PostHog) is wired. */
async function send(_ctx: AnalyticsContext): Promise<void> {
  void _ctx;
}

/**
 * Track an event. Returns true only when an event was actually dispatched
 * (provider configured AND not opted out AND running in the browser).
 */
export async function track(ctx: AnalyticsContext): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (isOptedOut()) return false;
  if (!isProviderConfigured()) return false;
  await send(ctx);
  return true;
}
