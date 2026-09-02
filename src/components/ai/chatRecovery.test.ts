import { describe, expect, it } from "vitest";
import { getChatLoginUrl } from "./chatRecovery";

describe("getChatLoginUrl", () => {
  it("preserves the current path as the encoded callback URL", () => {
    expect(getChatLoginUrl("/dashboard?tab=care")).toBe(
      "/login?callbackUrl=%2Fdashboard%3Ftab%3Dcare"
    );
  });

  it("falls back to the dashboard when the current path is not absolute", () => {
    expect(getChatLoginUrl("dashboard")).toBe(
      "/login?callbackUrl=%2Fdashboard"
    );
  });
});
