import { describe, expect, it } from "vitest";
import { breakdownTask } from "./microTasks";

/**
 * The splitter must stay deterministic and privacy-safe: given the same raw
 * text it always returns the same up-to-three micro-steps, long run-ons get
 * opened up, and blank input yields an empty array (the UI pads to three).
 */

describe("breakdownTask", () => {
  it("returns an empty array for blank or whitespace input", () => {
    expect(breakdownTask("")).toEqual([]);
    expect(breakdownTask("   ")).toEqual([]);
  });

  it("splits a single sentence into its clause micro-steps", () => {
    const steps = breakdownTask(
      "Prepare for tomorrow's appointment and pack my bag and check the route."
    );
    expect(steps.length).toBeGreaterThanOrEqual(2);
    expect(steps.length).toBeLessThanOrEqual(3);
    for (const step of steps) {
      expect(step.label.length).toBeGreaterThan(0);
    }
  });

  it("caps output at three steps", () => {
    const manyClauses =
      "Write the email. Book the taxi. Reply to Sarah. Pay the rent. Buy groceries. Call the lab.";
    expect(breakdownTask(manyClauses)).toHaveLength(3);
  });

  it("opens up a long run-on clause when fewer than three pieces exist", () => {
    const gobbledygook =
      "Complete the huge report for tomorrow and also the slides and then the spreadsheet";
    const steps = breakdownTask(gobbledygook);
    expect(steps).toHaveLength(3);
    // The whole task is still covered textually.
    expect(steps.map((s) => s.label).join(" ").length).toBeGreaterThan(20);
  });

  it("normalizes whitespace and truncates absurdly long input", () => {
    const longInput = "  a ".repeat(400) + "task  ";
    const steps = breakdownTask(longInput);
    for (const step of steps) {
      expect(step.label).not.toContain("  ");
      expect(step.label.length).toBeLessThanOrEqual(300);
    }
  });

  it("is deterministic — same input, same steps", () => {
    const raw = "Fix the bathroom tap and wipe the counter and sweep the floor";
    expect(breakdownTask(raw)).toEqual(breakdownTask(raw));
  });
});