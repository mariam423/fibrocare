/**
 * Decoder for the AI SDK v7 UI-message wire protocol.
 *
 * The server streams the reply as a plain SSE stream where each `data:` line
 * is a JSON-encoded `UIMessageChunk`, terminated by `data: [DONE]`. The
 * client-side `readUIMessageStream` helper only accepts an in-memory stream of
 * *already-parsed* chunks (not the raw HTTP body), so feature components parse
 * the SSE events themselves and accumulate the `text-delta` payloads.
 */

export interface UiMessageSseDelta {
  delta: string;
}

/**
 * Parses one complete SSE event (already split on `\n\n`) and returns the
 * streamed text delta when the event is a `text-delta` chunk. Returns `null`
 * for every other event type, the `[DONE]` sentinel, or malformed payloads,
 * so callers can safely skip it.
 */
export function parseUiMessageSseEvent(event: string): UiMessageSseDelta | null {
  const payload = event
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n");
  if (!payload || payload === "[DONE]") return null;
  try {
    const chunk = JSON.parse(payload) as { type?: string; delta?: string };
    if (chunk.type === "text-delta" && typeof chunk.delta === "string") {
      return { delta: chunk.delta };
    }
  } catch {
    // Malformed event — ignore it and keep streaming.
  }
  return null;
}

/**
 * Convenience: parses a complete SSE body string (as received from a fetch
 * response) into the full accumulated text. Used by tests and by callers that
 * don't need live streaming updates.
 */
export function parseUiMessageSseText(body: string): string {
  let text = "";
  for (const event of body.split("\n\n")) {
    const delta = parseUiMessageSseEvent(event);
    if (delta) text += delta.delta;
  }
  return text;
}
