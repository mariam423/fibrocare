// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { CycleOrbit3D } from "./CycleOrbit3D";

/**
 * jsdom has no WebGL, so these tests exercise the progressive-enhancement
 * fallback: the static SVG orbit graphic. The motion hook is stubbed with a
 * controllable spy so the reduced-motion path can be asserted too.
 */
const motionSpy = vi.fn().mockReturnValue(true);
vi.mock("@/hooks/useMotionEnabled", () => ({
  useMotionEnabled: () => motionSpy(),
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

afterEach(cleanup);

describe("CycleOrbit3D fallback (no WebGL in jsdom)", () => {
  it("renders the static orbit icon without a live canvas upgrader", () => {
    const { container } = render(<CycleOrbit3D />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("svg ellipse")).toBeInTheDocument();
  });

  it("exposes the element as purely decorative", () => {
    const { container } = render(<CycleOrbit3D />);
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
    expect(wrapper).toHaveAttribute("role", "presentation");
  });

  it("keeps the static icon when motion is disabled", () => {
    motionSpy.mockReturnValue(false);
    const { container } = render(<CycleOrbit3D className="max-w-[210px]" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(
      container.querySelector("[class*='max-w-\\[210px\\]']")
    ).toBeInTheDocument();
  });

  it("reserves the fixed icon height so the layout never shifts", () => {
    const { container } = render(<CycleOrbit3D />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.height).toBe("132px");
  });
});