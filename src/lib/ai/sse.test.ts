import { describe, expect, it } from "vitest";
import { parseUiMessageSseEvent, parseUiMessageSseText } from "./sse";

describe("parseUiMessageSseEvent", () => {
  it("returns the delta for a text-delta chunk", () => {
    const event = 'data: {"type":"text-delta","id":"abc","delta":"hello"}\n';
    expect(parseUiMessageSseEvent(event)).toEqual({ delta: "hello" });
  });

  it("ignores the [DONE] sentinel", () => {
    expect(parseUiMessageSseEvent("data: [DONE]")).toBeNull();
  });

  it("ignores empty events", () => {
    expect(parseUiMessageSseEvent("")).toBeNull();
    expect(parseUiMessageSseEvent("\n")).toBeNull();
  });

  it("ignores non text-delta chunks (start, text-start, finish, etc.)", () => {
    expect(parseUiMessageSseEvent('data: {"type":"start","messageId":"m1"}')).toBeNull();
    expect(parseUiMessageSseEvent('data: {"type":"text-start","id":"abc"}')).toBeNull();
    expect(
      parseUiMessageSseEvent('data: {"type":"finish","finishReason":"stop"}')
    ).toBeNull();
  });

  it("ignores malformed JSON without throwing", () => {
    expect(parseUiMessageSseEvent("data: {not json")).toBeNull();
  });

  it("handles multi-line SSE events by joining data lines", () => {
    const event = 'data: {"type":"text-delta","id":"abc"\ndata: ,"delta":"line\\nbreak"}';
    expect(parseUiMessageSseEvent(event)).toEqual({ delta: "line\nbreak" });
  });
});

describe("parseUiMessageSseText", () => {
  it("accumulates all text-delta deltas in order", () => {
    const body = [
      'data: {"type":"start","messageId":"m1"}',
      'data: {"type":"text-start","id":"abc"}',
      'data: {"type":"text-delta","id":"abc","delta":"You "}',
      'data: {"type":"text-delta","id":"abc","delta":"logged "}',
      'data: {"type":"text-delta","id":"abc","delta":"pain."}',
      'data: {"type":"text-end","id":"abc"}',
      'data: {"type":"finish","finishReason":"stop"}',
      "data: [DONE]",
    ].join("\n\n");
    expect(parseUiMessageSseText(body)).toBe("You logged pain.");
  });

  it("returns an empty string when there is no text", () => {
    expect(parseUiMessageSseText("data: [DONE]")).toBe("");
    expect(parseUiMessageSseText("")).toBe("");
  });
});
