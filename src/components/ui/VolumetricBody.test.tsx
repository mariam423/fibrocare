// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { VolumetricBody } from "./VolumetricBody";

/** Collect every stop color inside the radial gradient for a region. */
function glowStops(container: HTMLElement, region: string): string[] {
  const gradient = container.querySelector(
    `radialGradient[id*="glow-${region}"]`
  );
  if (!gradient) return [];
  return Array.from(gradient.querySelectorAll("stop")).map(
    (stop) => stop.getAttribute("stop-color") ?? ""
  );
}

// No vitest globals → RTL auto-cleanup is off; unmount between tests.
afterEach(cleanup);

describe("VolumetricBody", () => {
  it("renders the figure with contact shadow and floor glow", () => {
    const { container } = render(<VolumetricBody />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    // Floor anchor: shadow ellipse sits at cy=96
    const shadow = container.querySelector('ellipse[cy="96"]');
    expect(shadow).toBeInTheDocument();
  });

  it("emits no region glow gradients when severity is empty", () => {
    const { container } = render(<VolumetricBody />);
    expect(
      container.querySelectorAll('radialGradient[id*="glow-"]')
    ).toHaveLength(0);
  });

  it("creates glow gradients only for lit regions", () => {
    const { container } = render(
      <VolumetricBody severity={{ knees: 6, neck: 2 }} />
    );
    expect(glowStops(container, "knees")).not.toHaveLength(0);
    expect(glowStops(container, "neck")).not.toHaveLength(0);
    expect(glowStops(container, "hips")).toHaveLength(0);
  });

  it("colors glows by severity ramp: emerald → amber → orange → rose", () => {
    const { container } = render(
      <VolumetricBody
        severity={{ neck: 2, knees: 5, hips: 7, lowerBack: 9 }}
      />
    );
    const neck = glowStops(container, "neck").join(" ");
    const knees = glowStops(container, "knees").join(" ");
    const hips = glowStops(container, "hips").join(" ");
    const lowerBack = glowStops(container, "lowerBack").join(" ");
    expect(neck).toContain("52,211,153"); // emerald  ≤3
    expect(knees).toContain("250,204,21"); // amber    ≤5
    expect(hips).toContain("251,146,60"); // orange   ≤7
    expect(lowerBack).toContain("251,113,133"); // rose >7
  });

  it("clamps out-of-range severity values", () => {
    const over = render(<VolumetricBody severity={{ neck: 42 }} />).container;
    const under = render(<VolumetricBody severity={{ neck: -7 }} />).container;
    // 42 clamps to 10 → rose; -7 clamps to 0 → region not lit at all.
    expect(glowStops(over, "neck").join(" ")).toContain("251,113,133");
    expect(
      under.querySelectorAll('radialGradient[id*="glow-"]')
    ).toHaveLength(0);
  });

  it("scales glow size with severity", () => {
    const mild = render(<VolumetricBody severity={{ hips: 2 }} />).container;
    const severe = render(<VolumetricBody severity={{ hips: 9 }} />).container;
    const mildRx = Number(mild.querySelector('ellipse[class*="body-glow-pulse"]')?.getAttribute("rx"));
    const severeRx = Number(severe.querySelector('ellipse[class*="body-glow-pulse"]')?.getAttribute("rx"));
    expect(severeRx).toBeGreaterThan(mildRx);
  });

  it("shows the rotating highlight ring only for the lit, selected region", () => {
    const { container, rerender } = render(
      <VolumetricBody severity={{ knees: 5 }} highlight={null} />
    );
    expect(container.querySelector('circle[stroke-dasharray="2 1.4"]')).toBeNull();

    rerender(<VolumetricBody severity={{ knees: 5 }} highlight="knees" />);
    expect(
      container.querySelector('circle[stroke-dasharray="2 1.4"]')
    ).toBeInTheDocument();

    // Highlighting an unlit region must not render a ring.
    rerender(<VolumetricBody severity={{}} highlight="knees" />);
    expect(container.querySelector('circle[stroke-dasharray="2 1.4"]')).toBeNull();
  });

  it("switches anatomy lines between front and back views", () => {
    const front = render(<VolumetricBody />).container;
    const back = render(<VolumetricBody backView />).container;
    // Front shows the sternum dash line; back shows the spine dash line.
    expect(front.querySelector('path[stroke-dasharray="0.4 1.1"]')).toBeInTheDocument();
    expect(back.querySelector('path[stroke-dasharray="1.6 1.2"]')).toBeInTheDocument();
    expect(front.querySelector('path[stroke-dasharray="1.6 1.2"]')).toBeNull();
  });

  it("names gradient ids uniquely per instance to avoid SVG collisions", () => {
    const first = render(<VolumetricBody severity={{ hips: 5 }} />).container;
    const second = render(<VolumetricBody severity={{ hips: 5 }} />).container;
    const firstId = first.querySelector('radialGradient[id*="glow-"]')?.id;
    const secondId = second.querySelector('radialGradient[id*="glow-"]')?.id;
    expect(firstId).toBeTruthy();
    expect(secondId).toBeTruthy();
    expect(firstId).not.toBe(secondId);
  });
});
