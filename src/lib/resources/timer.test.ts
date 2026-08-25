import { describe, expect, it } from "vitest";
import { formatCountdown, nextTick } from "./timer";

describe("formatCountdown", () => {
  it("formats whole minutes and padded seconds", () => {
    expect(formatCountdown(0)).toBe("0:00");
    expect(formatCountdown(59)).toBe("0:59");
    expect(formatCountdown(60)).toBe("1:00");
    expect(formatCountdown(65)).toBe("1:05");
    expect(formatCountdown(180)).toBe("3:00");
    expect(formatCountdown(300)).toBe("5:00");
    expect(formatCountdown(3599)).toBe("59:59");
  });

  it("clamps negative input to 0:00", () => {
    expect(formatCountdown(-5)).toBe("0:00");
  });

  it("floors fractional input", () => {
    expect(formatCountdown(89.9)).toBe("1:29");
  });
});

describe("nextTick", () => {
  it("decrements by one", () => {
    expect(nextTick(5)).toBe(4);
  });

  it("never drops below zero", () => {
    expect(nextTick(0)).toBe(0);
    expect(nextTick(-2)).toBe(0);
  });
});
