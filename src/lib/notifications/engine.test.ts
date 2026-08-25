import { describe, expect, it } from "vitest";
import {
  clearAll,
  markAllAsRead,
  markAsRead,
  prune,
  remove,
  sortNewestFirst,
  unreadCount,
  upsert,
} from "./engine";
import type { AppNotification, NotificationInput } from "./types";

function makeInput(overrides: Partial<NotificationInput> = {}): NotificationInput {
  return {
    id: "n1",
    type: "daily_checkin",
    title: "notification.dailyLog.reminder.title",
    message: "notification.dailyLog.reminder.message",
    actionUrl: "/dashboard",
    ...overrides,
  };
}

describe("notification engine", () => {
  it("upserts a new notification as unread with a timestamp", () => {
    const before = Date.now();
    const list = upsert([], makeInput({ id: "a" }));
    expect(list).toHaveLength(1);
    expect(list[0].read).toBe(false);
    expect(list[0].timestamp).toBeGreaterThanOrEqual(before);
  });

  it("re-upserting the same id does not duplicate and keeps read state", () => {
    let list = upsert([], makeInput({ id: "a" }));
    list = markAsRead(list, "a");
    // Re-emitted by a trigger later in the day: same id, same read state.
    list = upsert(list, makeInput({ id: "a" }));
    expect(list).toHaveLength(1);
    expect(list[0].read).toBe(true);
  });

  it("upserting different ids appends both", () => {
    let list = upsert([], makeInput({ id: "a" }));
    list = upsert(list, makeInput({ id: "b" }));
    expect(list).toHaveLength(2);
  });

  it("marks one notification as read without touching others", () => {
    let list = upsert(upsert([], makeInput({ id: "a" })), makeInput({ id: "b" }));
    list = markAsRead(list, "a");
    expect(list.find((n) => n.id === "a")?.read).toBe(true);
    expect(list.find((n) => n.id === "b")?.read).toBe(false);
  });

  it("marks all as read", () => {
    let list = upsert(upsert([], makeInput({ id: "a" })), makeInput({ id: "b" }));
    list = markAllAsRead(list);
    expect(unreadCount(list)).toBe(0);
  });

  it("counts unread notifications", () => {
    let list = upsert(upsert([], makeInput({ id: "a" })), makeInput({ id: "b" }));
    list = markAsRead(list, "a");
    expect(unreadCount(list)).toBe(1);
  });

  it("removes a single notification", () => {
    let list = upsert(upsert([], makeInput({ id: "a" })), makeInput({ id: "b" }));
    list = remove(list, "a");
    expect(list.map((n) => n.id)).toEqual(["b"]);
  });

  it("clears everything", () => {
    const list = upsert(upsert([], makeInput({ id: "a" })), makeInput({ id: "b" }));
    expect(clearAll()).toEqual([]);
    void list;
  });

  it("sorts newest first", () => {
    const list: AppNotification[] = [
      { ...makeInput({ id: "old" }), timestamp: 100, read: false },
      { ...makeInput({ id: "new" }), timestamp: 300, read: false },
      { ...makeInput({ id: "mid" }), timestamp: 200, read: false },
    ];
    expect(sortNewestFirst(list).map((n) => n.id)).toEqual(["new", "mid", "old"]);
  });

  it("prunes to the cap, keeping the newest entries", () => {
    const list: AppNotification[] = Array.from({ length: 70 }, (_, i) => ({
      ...makeInput({ id: `n${i}` }),
      timestamp: i,
      read: true,
    }));
    const pruned = prune(list, 60);
    expect(pruned).toHaveLength(60);
    expect(Math.max(...pruned.map((n) => n.timestamp))).toBe(69);
  });
});
