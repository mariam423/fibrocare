// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { FogClearingSphere3D } from "./FogClearingSphere3D";

/**
 * jsdom has no WebGL, so these tests exercise the progressive-enhancement
 * fallback: the static SVG fog→clear graphic. The motion hook is stubbed
 * with a controllable spy so the reduced-motion path is asserted too.
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
  motionSpy.mockReturnValue(true);
});

afterEach(cleanup);

describe("FogClearingSphere3D fallback (no WebGL in jsdom)", () => {
  it("renders the static fog/clear graphic without the live canvas upgrader", () => {
    const { container } = render(<FogClearingSphere3D />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    // Fog particles + settling rings + core are all present.
    expect(container.querySelectorAll("svg circle").length).toBeGreaterThan(4);
    expect(container.querySelectorAll("svg ellipse").length).toBeGreaterThan(2);
  });

  it("exposes the element as purely decorative", () => {
    const { container } = render(<FogClearingSphere3D />);
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
    expect(wrapper).toHaveAttribute("role", "presentation");
  });

  it("keeps the static icon when motion is disabled", () => {
    motionSpy.mockReturnValue(false);
    const { container } = render(<FogClearingSphere3D className="max-w-[320px]" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(
      container.querySelector("[class*='max-w-\\[320px\\]']")
    ).toBeInTheDocument();
  });

  it("reserves a fixed height so the layout never shifts", () => {
    const { container } = render(<FogClearingSphere3D />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.height).toBe("190px");
  });
});