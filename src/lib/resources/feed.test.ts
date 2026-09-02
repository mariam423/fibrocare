import { describe, expect, it } from "vitest";
import {
  buildResourceFeed,
  filterResourceCatalog,
  type ResourceFeedInput,
} from "./feed";

const baseInput: ResourceFeedInput = {
  painLevel: 3,
  energyRemaining: 6,
  weatherTriggers: ["calm"],
  category: "all",
  refreshSeed: 0,
};

describe("buildResourceFeed", () => {
  it("prioritizes low-effort comfort resources for a high-pain, low-energy day", () => {
    const feed = buildResourceFeed({
      ...baseInput,
      painLevel: 8,
      energyRemaining: 1,
    });

    expect(feed).toHaveLength(3);
    expect(feed[0].resourceId).toBe("flare-breathwork");
    expect(feed.map((item) => item.effort)).toEqual(["low", "low", "low"]);
    expect(feed[0].reason).toContain("pain");
  });

  it("includes heat and hydration guidance when weather triggers are active", () => {
    const feed = buildResourceFeed({
      ...baseInput,
      weatherTriggers: ["pressure-drop", "humidity-high"],
    });

    expect(feed.map((item) => item.resourceId)).toEqual(
      expect.arrayContaining(["flare-heat", "nutri-hydration"])
    );
    expect(feed.some((item) => item.reason.toLowerCase().includes("weather"))).toBe(true);
  });

  it("changes the recommendation order when the user refreshes the feed", () => {
    const first = buildResourceFeed({ ...baseInput, refreshSeed: 0 });
    const refreshed = buildResourceFeed({ ...baseInput, refreshSeed: 1 });

    expect(refreshed.map((item) => item.resourceId)).not.toEqual(
      first.map((item) => item.resourceId)
    );
  });
});

describe("filterResourceCatalog", () => {
  it("keeps mental-support results available when that category is selected", () => {
    const feed = filterResourceCatalog("mentalSupport");

    expect(feed.length).toBeGreaterThan(0);
    expect(feed.every((item) => item.category === "mentalSupport")).toBe(true);
  });

  it("falls back to the selected category when a body selection has no intersection", () => {
    const feed = filterResourceCatalog("mentalSupport", "hips");

    expect(feed.length).toBeGreaterThan(0);
    expect(feed.every((item) => item.category === "mentalSupport")).toBe(true);
  });
});
