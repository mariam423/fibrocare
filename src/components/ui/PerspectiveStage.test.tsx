// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PerspectiveStage } from "./PerspectiveStage";

/**
 * jsdom lacks matchMedia; framer-motion's useReducedMotion (used inside
 * useMotionEnabled) requires it. `reduced` flips the system preference.
 */
function installMatchMedia(reduced = false) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduced && query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => installMatchMedia(false));

afterEach(() => {
  // No vitest globals → RTL auto-cleanup is off; unmount explicitly.
  cleanup();
  // useMotionEnabled reads html.motion-reduce; keep tests isolated.
  document.documentElement.className = "";
  vi.useRealTimers();
});

describe("PerspectiveStage", () => {
  it("renders children with a resting 3D pose and preserve-3d", () => {
    render(
      <PerspectiveStage resting={{ rotateX: 8, rotateY: -6 }} data-testid="stage">
        <div>volumetric figure</div>
      </PerspectiveStage>
    );
    const stage = screen.getByTestId("stage");
    expect(stage).toHaveTextContent("volumetric figure");
    expect(stage.style.transformStyle).toBe("preserve-3d");
    // Resting pose is baked into the transform so the static view reads 3D.
    expect(stage.style.transform).toMatch(/rotateX\(8deg\)/);
    expect(stage.style.transform).toMatch(/rotateY\(-6deg\)/);
    expect(stage.style.transform).toMatch(/perspective\(1100px\)/);
  });

  it("engages drag on mouse press and releases on pointerup", () => {
    render(
      <PerspectiveStage data-testid="stage">
        <div />
      </PerspectiveStage>
    );
    const stage = screen.getByTestId("stage");
    expect(stage.className).not.toContain("cursor-grabbing");

    fireEvent.pointerDown(stage, { pointerType: "mouse", pointerId: 1, clientX: 10, clientY: 10 });
    expect(stage.className).toContain("cursor-grabbing");

    fireEvent.pointerUp(stage, { pointerType: "mouse", pointerId: 1 });
    expect(stage.className).not.toContain("cursor-grabbing");
  });

  it("gates touch rotation behind a deliberate long-press", () => {
    vi.useFakeTimers();
    render(
      <PerspectiveStage data-testid="stage">
        <div />
      </PerspectiveStage>
    );
    const stage = screen.getByTestId("stage");

    // Immediate press-and-move must NOT hijack the gesture (taps/scroll pass through).
    fireEvent.pointerDown(stage, { pointerType: "touch", pointerId: 1, clientX: 10, clientY: 10 });
    expect(stage.className).not.toContain("cursor-grabbing");

    // After the 200 ms deliberate-press window, rotation engages.
    act(() => {
      vi.advanceTimersByTime(220);
    });
    expect(stage.className).toContain("cursor-grabbing");

    fireEvent.pointerUp(stage, { pointerType: "touch", pointerId: 1 });
    expect(stage.className).not.toContain("cursor-grabbing");
  });

  it("cancels the pending long-press timer on unmount (no leaks)", () => {
    vi.useFakeTimers();
    const utils = render(
      <PerspectiveStage data-testid="stage">
        <div />
      </PerspectiveStage>
    );
    fireEvent.pointerDown(utils.getByTestId("stage"), {
      pointerType: "touch",
      pointerId: 2,
      clientX: 0,
      clientY: 0,
    });
    const clearSpy = vi.spyOn(window, "clearTimeout");
    utils.unmount();
    expect(clearSpy).toHaveBeenCalled();
  });

  it("renders a fixed pose and ignores pointer input under reduced motion", () => {
    installMatchMedia(true);
    document.documentElement.classList.add("motion-reduce"); // manual kill-switch
    render(
      <PerspectiveStage resting={{ rotateX: 8, rotateY: 0 }} data-testid="stage">
        <div />
      </PerspectiveStage>
    );
    const stage = screen.getByTestId("stage");
    expect(stage.style.transform).toContain("rotateX(8deg)");

    fireEvent.pointerDown(stage, { pointerType: "mouse", clientX: 5, clientY: 5 });
    expect(stage.className).not.toContain("cursor-grabbing");
  });

  it("mirrors the resting pose through 180° when flipped (back view)", () => {
    render(
      <PerspectiveStage resting={{ rotateX: 8, rotateY: -6 }} flipped data-testid="stage">
        <div />
      </PerspectiveStage>
    );
    // -6 + 180 = 174° — the flip composes with the resting yaw.
    expect(screen.getByTestId("stage").style.transform).toMatch(/rotateY\(174deg\)/);
  });
});
