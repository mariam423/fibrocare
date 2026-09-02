/**
 * Small process-local monitor for chat authentication failures.
 *
 * This intentionally stores no user IDs, cookies, or request payloads. It is
 * useful for detecting a broken auth secret or a stale-cookie wave in a
 * single server instance; multi-instance deployments should forward this
 * signal to their existing metrics provider.
 */

export const CHAT_AUTH_WINDOW_MS = 5 * 60_000;
export const CHAT_AUTH_ALERT_THRESHOLD = 5;

let windowStartedAt = 0;
let failureCount = 0;
let alertedInWindow = false;

export interface ChatAuthFailureResult {
  count: number;
  repeated: boolean;
  shouldAlert: boolean;
}

export function recordChatAuthFailure(now = Date.now()): ChatAuthFailureResult {
  if (!windowStartedAt || now - windowStartedAt >= CHAT_AUTH_WINDOW_MS) {
    windowStartedAt = now;
    failureCount = 0;
    alertedInWindow = false;
  }

  failureCount += 1;
  const repeated = failureCount > 1;
  const shouldAlert =
    failureCount >= CHAT_AUTH_ALERT_THRESHOLD && !alertedInWindow;
  if (shouldAlert) alertedInWindow = true;

  return { count: failureCount, repeated, shouldAlert };
}

/** Reset state for tests and controlled process reinitialization. */
export function resetChatAuthMonitor() {
  windowStartedAt = 0;
  failureCount = 0;
  alertedInWindow = false;
}
