// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { SymptomMapWidget } from "./SymptomMapWidget";

/**
 * SymptomMapWidget reads the language context through useLanguage() and the
 * motion kill-switch through useMotionEnabled(); neither provider is
 * exported for tests. The translator returns the key itself so labels stay
 * deterministic, and motion is reported enabled so PerspectiveStage takes
 * its animated path (matchMedia stub required for useReducedMotion).
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

/**
 * The Slider is a Base UI primitive whose pointer/keyboard behavior is not
 * reproducible in jsdom. This double keeps the contract the widget relies
 * on — controlled `value` array plus `onValueChange(number[])` — and steps
 * by 1 per click so tests drive the real state-update logic.
 */
vi.mock("@/components/ui/slider", () => ({
  Slider: ({
    value,
    min = 0,
    max = 100,
    onValueChange,
  }: {
    value?: number[];
    min?: number;
    max?: number;
    onValueChange?: (v: number[]) => void;
  }) => {
    const current = value?.[0] ?? min;
    return (
      <div data-slider-stub="">
        <button
          type="button"
          data-testid="slider-inc"
          onClick={() => onValueChange?.([Math.min(max, current + 1)])}
        >
          +
        </button>
        <button
          type="button"
          data-testid="slider-dec"
          onClick={() => onValueChange?.([Math.max(min, current - 1)])}
        >
          −
        </button>
      </div>
    );
  },
}));

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

// No vitest globals → RTL auto-cleanup is off; unmount between tests.
afterEach(cleanup);

/** Severity hue stops used by VolumetricBody's ramp (mirrors its contract). */
const HUE = {
  emerald: "52,211,153", // ≤3
  amber: "250,204,21", // ≤5
  orange: "251,146,60", // ≤7
  rose: "251,113,133", // >7
} as const;

function glowStops(container: HTMLElement, region: string): string {
  const gradient = container.querySelector(
    `radialGradient[id*="glow-${region}"]`
  );
  return gradient
    ? Array.from(gradient.querySelectorAll("stop"))
        .map((s) => s.getAttribute("stop-color") ?? "")
        .join(" ")
    : "";
}

/** The slider stub + value badge inside the row for a category label key. */
function categoryRow(labelKey: string) {
  const label = screen.getByText(labelKey);
  // label div → justify-between div → category row (which holds the Slider).
  const row = label.closest("div")?.parentElement?.parentElement;
  if (!row) throw new Error(`row for ${labelKey} not found`);
  return {
    inc: within(row).getByTestId("slider-inc"),
    dec: within(row).getByTestId("slider-dec"),
    badge: within(row).getByText(/^\d+ \/ 10$/),
  };
}

function clickTimes(button: HTMLElement, times: number) {
  for (let i = 0; i < times; i += 1) fireEvent.click(button);
}

describe("SymptomMapWidget slider-driven glow mapping", () => {
  it("starts at 5/10 everywhere: mapped regions glow amber", () => {
    const { container } = render(<SymptomMapWidget />);

    // Physical → lowerBack, ribs, hips, thighs, knees, ankles, upperArms, joints
    // Cognitive → neck, shoulders, upperArms, forearms
    // Mood → upperArms, forearms, joints, shoulders, hips
    // With all at 5/10, every lit region glows amber (the 5/10 stop in the
    // ramp is rgba(250,204,21,...) — pure amber). Assert on the regions the
    // widget actually maps and the test can name with certainty.
    expect(glowStops(container, "lowerBack")).toContain(HUE.amber);
    expect(glowStops(container, "ribs")).toContain(HUE.amber);
    expect(glowStops(container, "hips")).toContain(HUE.amber);
    expect(glowStops(container, "lowerAbdomen")).toContain(HUE.amber);
    expect(glowStops(container, "knees")).toContain(HUE.amber);
    // ankles is deliberately attenuated (physical − 2): at the 5/10 default
    // it sits at 3 → emerald, unlike the full-strength amber zones.
    expect(glowStops(container, "ankles")).toContain(HUE.emerald);
    expect(glowStops(container, "upperArms")).toContain(HUE.amber);
    expect(glowStops(container, "joints")).toContain(HUE.amber);
    expect(glowStops(container, "neck")).toContain(HUE.amber);
    expect(glowStops(container, "shoulders")).toContain(HUE.amber);
    expect(glowStops(container, "forearms")).toContain(HUE.amber);

    for (const key of [
      "health.category.physical",
      "health.category.cognitive",
      "health.category.mood",
    ]) {
      expect(categoryRow(key).badge).toHaveTextContent("5 / 10");
    }
  });

  it("raising PHYSICAL to max turns its regions rose while COGNITIVE stays amber", () => {
    const { container } = render(<SymptomMapWidget />);
    const physical = categoryRow("health.category.physical");

    clickTimes(physical.inc, 5); // 5 → 10
    expect(physical.badge).toHaveTextContent("10 / 10");

    // Physical zones at 10 → rose; cognitive zones untouched → amber.
    expect(glowStops(container, "lowerBack")).toContain(HUE.rose);
    expect(glowStops(container, "lowerAbdomen")).toContain(HUE.rose);
    expect(glowStops(container, "knees")).toContain(HUE.rose);
    expect(glowStops(container, "ankles")).toContain(HUE.rose);
    expect(glowStops(container, "joints")).toContain(HUE.rose);
    expect(glowStops(container, "neck")).toContain(HUE.amber);
  });

  it("eases regions toward emerald as their category slider drops", () => {
    const { container } = render(<SymptomMapWidget />);
    const cognitive = categoryRow("health.category.cognitive");

    clickTimes(cognitive.dec, 4); // 5 → 1
    expect(cognitive.badge).toHaveTextContent("1 / 10");

    expect(glowStops(container, "neck")).toContain(HUE.emerald);
    expect(glowStops(container, "shoulders")).toContain(HUE.emerald);
  });

  it("blends the joints glow from the PHYSICAL and MOOD averages", () => {
    const { container } = render(<SymptomMapWidget />);
    const physical = categoryRow("health.category.physical");
    const mood = categoryRow("health.category.mood");

    clickTimes(physical.inc, 5); // 5 → 10
    clickTimes(mood.dec, 3);     // 5 → 2

    // joints = round((10 + 2) / 2) = 6 → orange band.
    expect(glowStops(container, "joints")).toContain(HUE.orange);
    expect(mood.badge).toHaveTextContent("2 / 10");
    expect(physical.badge).toHaveTextContent("10 / 10");
  });

  it("quick-log posts the slider's live severity for its category", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<SymptomMapWidget />);
    // Bump cognitive 5 → 7, then log brain-fog (a COGNITIVE symptom).
    const cognitive = categoryRow("health.category.cognitive");
    clickTimes(cognitive.inc, 2);

    fireEvent.click(
      screen.getByRole("button", { name: "health.quickLog.brainFog" })
    );

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as {
      symptom: string;
      severity: number;
      category: string;
    };
    expect(body).toMatchObject({
      symptom: "brain-fog",
      severity: 7,
      category: "cognitive",
    });

    vi.unstubAllGlobals();
  });
});
