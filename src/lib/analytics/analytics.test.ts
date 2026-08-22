import { describe, expect, it } from "vitest";
import { isOptedOut, isProviderConfigured, track } from "./index";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => data.set(k, v),
    removeItem: (k: string) => data.delete(k),
  };
}

describe("analytics privacy wrapper", () => {
  it("respects the opt-out preference", () => {
    expect(isOptedOut(memoryStorage({ "fibrocare-analytics-opt-out": "true" }))).toBe(true);
    expect(isOptedOut(memoryStorage())).toBe(false);
  });

  it("is disabled by default: track never dispatches without a provider", async () => {
    expect(isProviderConfigured()).toBe(false);
    const dispatched = await track({ event: "page_view", page: "toolkit", locale: "en" });
    expect(dispatched).toBe(false);
  });
});
