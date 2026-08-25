import type { AppNotification, NotificationInput } from "./types";

/**
 * Pure, framework-free store operations for the notification list. Keeping
 * these functions free of React/localStorage lets the full behavior (upsert,
 * read-state, pruning, sorting) be unit-tested in isolation.
 */

/** Newest-first display order. */
export function sortNewestFirst(
  notifications: AppNotification[]
): AppNotification[] {
  return [...notifications].sort((a, b) => b.timestamp - a.timestamp);
}

export function unreadCount(notifications: AppNotification[]): number {
  return notifications.reduce((sum, n) => sum + (n.read ? 0 : 1), 0);
}

/**
 * Insert or update a notification. Notifications are keyed by `id`, so the
 * trigger engine can re-emit the same logical alert (e.g. "pressure drop
 * today") without duplicating it. A re-emitted alert keeps its read state.
 */
export function upsert(
  notifications: AppNotification[],
  input: NotificationInput
): AppNotification[] {
  const existing = notifications.find((n) => n.id === input.id);
  const next: AppNotification = existing
    ? { ...existing, ...input }
    : {
        ...input,
        timestamp: Date.now(),
        read: false,
      };
  return [...notifications.filter((n) => n.id !== input.id), next];
}

export function markAsRead(
  notifications: AppNotification[],
  id: string
): AppNotification[] {
  return notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
}

export function markAllAsRead(
  notifications: AppNotification[]
): AppNotification[] {
  return notifications.map((n) => (n.read ? n : { ...n, read: true }));
}

export function remove(
  notifications: AppNotification[],
  id: string
): AppNotification[] {
  return notifications.filter((n) => n.id !== id);
}

export function clearAll(): AppNotification[] {
  return [];
}

/**
 * Cap the stored list. Oldest read notifications are dropped first so the
 * user never loses an unread alert to the cap.
 */
export function prune(
  notifications: AppNotification[],
  max = 60
): AppNotification[] {
  if (notifications.length <= max) return notifications;
  // Keep the newest `max` entries (newest-first ordering). Read-state is
  // already preserved by upsert, so the cap simply bounds storage growth.
  return sortNewestFirst(notifications).slice(0, max);
}
