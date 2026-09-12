// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BodySymptomMap } from "./BodySymptomMap";
import { BODY_PARTS, type BodyPartId } from "@/lib/resources/engine";

/**
 * BodySymptomMap reads the language context through useLanguage() and the
 * motion kill-switch through useMotionEnabled(). Neither provider is
 * exported for tests, so both hooks are mocked: the translator returns the
 * key itself (which also makes aria-labels deterministic), and motion is
 * reported enabled.
 */
vi.mock("@/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    locale: "en",
    setLocale: vi.fn(),
    dir: "ltr" as const,
  }),
}));

vi.mock("@/hooks/useMotionEnabled", () => ({
  useMotionEnabled: () => true,
}));

// No vitest globals → RTL auto-cleanup is off; unmount between tests.
afterEach(cleanup);

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

const ALL_PARTS = Object.keys(BODY_PARTS) as BodyPartId[];
/** Two hotspots exist per bilateral region; every part has ≥1 hotspot. */
const HOTSPOT_COUNT = 9;

describe("BodySymptomMap hotspots (accessibility)", () => {
  it("renders one tappable hotspot per mapped position with a real label", () => {
    render(<BodySymptomMap selected={null} onSelect={() => {}} />);
    const hotspots = screen.getAllByRole("button", { pressed: false });
    expect(hotspots).toHaveLength(HOTSPOT_COUNT);
    for (const spot of hotspots) {
      expect(spot).toHaveAttribute("aria-label");
      const label = spot.getAttribute("aria-label")!;
      expect(ALL_PARTS.map((p) => `resources.bodyMap.part.${p}`)).toContain(label);
    }
  });

  it("labels every hotspot from the BODY_PARTS profiles (EN/AR parity source)", () => {
    render(<BodySymptomMap selected={null} onSelect={() => {}} />);
    // Bilateral regions (shoulders, knees, joints) have two hotspots each.
    for (const part of ALL_PARTS) {
      const spots = screen.getAllByRole("button", {
        name: BODY_PARTS[part].labelKey,
      });
      expect(spots.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("selects a region on click and reports it via aria-pressed", async () => {
    const onSelect = vi.fn();
    render(<BodySymptomMap selected={null} onSelect={onSelect} />);
    fireEvent.click(
      screen.getByRole("button", { name: "resources.bodyMap.part.neck" })
    );
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith("neck"));
  });

  it("deselects the active region when its hotspot is clicked again", () => {
    const onSelect = vi.fn();
    render(<BodySymptomMap selected="neck" onSelect={onSelect} />);
    const active = screen.getByRole("button", {
      name: "resources.bodyMap.part.neck",
      pressed: true,
    });
    expect(active).toBeInTheDocument();
    fireEvent.click(active);
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("marks exactly the hotspots of the selected part as pressed", () => {
    // "shoulders" maps to two hotspots — both must report pressed.
    render(<BodySymptomMap selected="shoulders" onSelect={() => {}} />);
    expect(screen.getAllByRole("button", { pressed: true })).toHaveLength(2);
  });

  it("raises a clear-selection action from the header when a region is active", () => {
    const onSelect = vi.fn();
    render(<BodySymptomMap selected="knees" onSelect={onSelect} />);
    fireEvent.click(screen.getByText("resources.bodyMap.clear"));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("shows heat and movement hints for regions where they apply", () => {
    render(<BodySymptomMap selected="lowerBack" onSelect={() => {}} />);
    expect(screen.getByText("resources.bodyMap.heatHint")).toBeInTheDocument();
    expect(screen.getByText("resources.bodyMap.movementHint")).toBeInTheDocument();
  });

  it("omits the heat hint for regions without a heat match (hips, knees)", () => {
    render(<BodySymptomMap selected="hips" onSelect={() => {}} />);
    expect(screen.queryByText("resources.bodyMap.heatHint")).not.toBeInTheDocument();
    expect(screen.getByText("resources.bodyMap.movementHint")).toBeInTheDocument();
  });

  it("supports ArrowLeft to select the first region", () => {
    const onSelect = vi.fn();
    render(<BodySymptomMap selected={null} onSelect={onSelect} />);
    const first = screen.getAllByRole("button", { pressed: false })[0];
    fireEvent.keyDown(first, { key: "ArrowLeft" });
    expect(onSelect).toHaveBeenCalledWith("neck");
  });
});
