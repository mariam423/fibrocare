import { describe, expect, it } from "vitest";
import { decideSeedAction } from "./doctor-article-cache";

/**
 * The seed-state gate is the client's only defense against a POST
 * stampede on a fresh deploy, so its truth table is locked in:
 *
 *  - populated library  → never POST (render the list)
 *  - empty + seed running → skip POST, re-list shortly
 *  - empty + idle       → POST the seed endpoint
 */
describe("decideSeedAction", () => {
  it("says skip-listed when the library has rows, regardless of seed state", () => {
    expect(decideSeedAction({ needsSeed: false, seedInFlight: false })).toBe(
      "skip-listed"
    );
    expect(decideSeedAction({ needsSeed: false, seedInFlight: true })).toBe(
      "skip-listed"
    );
  });

  it("says skip-inflight when the library is empty but a seed just started", () => {
    expect(decideSeedAction({ needsSeed: true, seedInFlight: true })).toBe(
      "skip-inflight"
    );
  });

  it("says seed when the library is empty and nobody is seeding", () => {
    expect(decideSeedAction({ needsSeed: true, seedInFlight: false })).toBe(
      "seed"
    );
  });
});
