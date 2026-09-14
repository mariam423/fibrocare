// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AnatomicalBody3D } from "./AnatomicalBody3D";

/**
 * jsdom has no WebGL, so these tests exercise the progressive-enhancement
 * fallback: the SVG figure (VolumetricBody) + the same accessible hotspot
 * buttons that drive the WebGL scene on capable devices. The motion hook is
 * stubbed; a controllable spy lets one suite also assert the reduced-motion
 * path renders the figure without a WebGL upgrade.
 */
const motionSpy = vi.fn().mockReturnValue(true);
vi.mock("@/hooks/useMotionEnabled", () => ({
  useMotionEnabled: () => motionSpy(),
}));

const HOTSPOTS = [
  { id: "a", label: "Point A", position: [0, 1.85, 0.3] as const },
  { id: "b", label: "Point B", position: [0.35, 2.68, 0.21] as const },
];

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

describe("AnatomicalBody3D fallback (SVG, no WebGL in jsdom)", () => {
  it("renders the SVG figure instead of a canvas when WebGL is unavailable", () => {
    const { container } = render(<AnatomicalBody3D severity={{ knees: 5 }} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("canvas")).toBeNull();
  });

  it("lights severity pools on the fallback figure", () => {
    const { container } = render(<AnatomicalBody3D severity={{ neck: 5 }} />);
    expect(
      container.querySelector('radialGradient[id*="glow-neck"]')
    ).toBeInTheDocument();
  });

  it("renders accessible hotspot buttons with labels and pressed state", () => {
    render(
      <AnatomicalBody3D
        hotspots={HOTSPOTS}
        selected={new Set(["b"])}
      />
    );
    expect(
      screen.getByRole("button", { name: "Point A", pressed: false })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Point B", pressed: true })
    ).toBeInTheDocument();
  });

  it("calls onSelect with the hotspot id on click", () => {
    const onSelect = vi.fn();
    render(<AnatomicalBody3D hotspots={HOTSPOTS} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: "Point A" }));
    expect(onSelect).toHaveBeenCalledWith("a");
  });

  it("reports hover and blur through onHover", () => {
    const onHover = vi.fn();
    render(<AnatomicalBody3D hotspots={HOTSPOTS} onHover={onHover} />);
    fireEvent.focus(screen.getByRole("button", { name: "Point A" }));
    expect(onHover).toHaveBeenCalledWith("a");
    fireEvent.blur(screen.getByRole("button", { name: "Point A" }));
    expect(onHover).toHaveBeenCalledWith(null);
  });

  it("keeps the accessible figure when motion is disabled", () => {
    motionSpy.mockReturnValue(false);
    const { container } = render(
      <AnatomicalBody3D severity={{ hips: 8 }} hotspots={HOTSPOTS} />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("canvas")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Point B", pressed: false })
    ).toBeInTheDocument();
  });
});