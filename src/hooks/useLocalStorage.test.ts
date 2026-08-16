// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalStorage } from "@/hooks/useLocalStorage";

beforeEach(() => {
  window.localStorage.clear();
});

describe("useLocalStorage", () => {
  it("returns the initial value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorage("key-a", 42));
    expect(result.current[0]).toBe(42);
  });

  it("reads an existing stored value", () => {
    window.localStorage.setItem("key-b", JSON.stringify("stored"));
    const { result } = renderHook(() => useLocalStorage("key-b", "fallback"));
    expect(result.current[0]).toBe("stored");
  });

  it("persists a new value to localStorage and updates the hook state", () => {
    const { result } = renderHook(() => useLocalStorage("key-c", 0));
    act(() => {
      result.current[1](7);
    });
    expect(result.current[0]).toBe(7);
    expect(window.localStorage.getItem("key-c")).toBe("7");
  });

  it("supports functional updates based on previous state", () => {
    const { result } = renderHook(() => useLocalStorage("key-d", 1));
    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    expect(result.current[0]).toBe(2);
  });

  it("shares state across hooks using the same key", () => {
    const first = renderHook(() => useLocalStorage("key-e", 0));
    const second = renderHook(() => useLocalStorage("key-e", 0));
    act(() => {
      first.result.current[1](10);
    });
    expect(second.result.current[0]).toBe(10);
  });

  it("falls back to the initial value if the stored value is malformed JSON", () => {
    window.localStorage.setItem("key-f", "{not-json");
    const { result } = renderHook(() => useLocalStorage("key-f", "safe"));
    expect(result.current[0]).toBe("safe");
  });

  it("keeps in-memory state when localStorage.setItem throws (private mode)", () => {
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceeded");
      });
    try {
      const { result } = renderHook(() => useLocalStorage("key-g", "start"));
      act(() => {
        result.current[1]("updated");
      });
      expect(result.current[0]).toBe("updated");
    } finally {
      spy.mockRestore();
    }
  });
});
