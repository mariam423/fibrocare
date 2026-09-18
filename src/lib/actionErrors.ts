import type { Translate } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

/**
 * Maps raw server-action error strings to translation keys so clients
 * never render English error text into Arabic UI.
 *
 * Server actions return stable English error strings (they run outside a
 * locale context); each new feature's UI should funnel action errors
 * through this helper instead of rendering `result.error` verbatim.
 */
const ERROR_KEY_BY_TEXT: Record<string, TranslationKey> = {
  "You must be signed in.": "common.signInRequired",
  "Unlock FibroCare to save your fog log.": "fog.save.locked",
  "Please complete the fog log correctly.": "fog.save.invalid",
  "Failed to save your fog log. Please try again.": "fog.save.failed",
  "Unlock FibroCare to save your energy check-in.": "spoon.checkin.locked",
  "Spoons must be between 1 and 10.": "spoon.checkin.invalid",
  "Could not save your energy check-in.": "spoon.checkin.failed",
};

/** Localize an action error string; unknown strings fall back to a key. */
export function localizeActionError(
  raw: string,
  fallback: TranslationKey,
  t: Translate
): string {
  return t(ERROR_KEY_BY_TEXT[raw] ?? fallback);
}