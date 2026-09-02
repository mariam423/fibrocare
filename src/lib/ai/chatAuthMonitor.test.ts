import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CHAT_AUTH_ALERT_THRESHOLD,
  CHAT_AUTH_WINDOW_MS,
  recordChatAuthFailure,
  resetChatAuthMonitor,
} from "./chatAuthMonitor";

describe("chat auth failure monitor", () => {
  afterEach(() => {
    resetChatAuthMonitor();
    vi.useRealTimers();
  });

  it("counts failures without retaining user identifiers", () => {
    expect(recordChatAuthFailure()).toEqual({
      count: 1,
      repeated: false,
      shouldAlert: false,
    });
    expect(recordChatAuthFailure()).toEqual({
      count: 2,
      repeated: true,
      shouldAlert: false,
    });
  });

  it("alerts once when failures cross the threshold", () => {
    for (let i = 0; i < CHAT_AUTH_ALERT_THRESHOLD - 1; i++) {
      recordChatAuthFailure();
    }

    expect(recordChatAuthFailure()).toEqual({
      count: CHAT_AUTH_ALERT_THRESHOLD,
      repeated: true,
      shouldAlert: true,
    });
    expect(recordChatAuthFailure().shouldAlert).toBe(false);
  });

  it("starts a fresh window after the monitoring interval", () => {
    vi.useFakeTimers();
    recordChatAuthFailure();
    vi.advanceTimersByTime(CHAT_AUTH_WINDOW_MS + 1);

    expect(recordChatAuthFailure()).toEqual({
      count: 1,
      repeated: false,
      shouldAlert: false,
    });
  });
});
