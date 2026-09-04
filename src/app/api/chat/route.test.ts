// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { getServerSession } from "next-auth";
import { streamText } from "ai";
import { POST } from "./route";
import {
  getModel,
  isAiConfigured,
  isMockMode,
} from "@/lib/ai/provider";
import { assembleCompanionContext } from "@/lib/ai/companion";
import { createGuardrailStreamTransform } from "@/lib/ai/guardrails";
import {
  CHAT_AUTH_ALERT_THRESHOLD,
  resetChatAuthMonitor,
} from "@/lib/ai/chatAuthMonitor";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

vi.mock("ai", async () => {
  const actual = await vi.importActual<typeof import("ai")>("ai");
  return { ...actual, streamText: vi.fn() };
});

vi.mock("@/lib/ai/provider", () => ({
  getModel: vi.fn(),
  getProviderDisplayName: vi.fn(() => "Test Provider"),
  isAiConfigured: vi.fn(),
  isMockMode: vi.fn(),
  recordAiFailure: vi.fn(),
  recordAiSuccess: vi.fn(),
}));

vi.mock("@/lib/ai/memory", () => ({
  buildShortTermMemory: vi.fn((messages: unknown[]) => ({
    messages: [],
    lastUserText:
      (messages[0] as { parts?: Array<{ text?: string }> } | undefined)?.parts?.[0]
        ?.text ?? "",
  })),
  buildLongTermMemory: vi.fn(async () => ({
    currentPain: 4,
    avgPain7d: 4,
    avgPain30d: 4,
    flareDays30d: 0,
    logCount30d: 3,
    topSymptoms: ["fatigue"],
    streakDays: 2,
    mood: "Okay",
    lastLogAt: null,
    trend: "stable",
    medications: [],
    weather: null,
  })),
}));

vi.mock("@/lib/ai/ratelimit", () => ({
  checkChatRateLimit: vi.fn(async () => ({ ok: true, resetAt: Date.now() + 60_000 })),
}));

vi.mock("@/lib/ai/companion", () => ({
  assembleCompanionContext: vi.fn(async () => ({
    systemPrompt: "test system prompt",
    messages: [],
    lastUserText: "",
    ragRoute: { needsRetrieval: false, domains: [], reason: "test" },
    ragChunkCount: 0,
    userFacts: null,
  })),
}));

vi.mock("@/lib/ai/guardrails", () => ({
  createGuardrailStreamTransform: vi.fn(() => new TransformStream()),
}));

const session = { user: { id: "user-1", name: "Maya" } };

function chatRequest(body: Record<string, unknown> = {}) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          parts: [{ type: "text", text: "Any patterns in my logs?" }],
        },
      ],
      ...body,
    }),
  });
}

function configureLiveMode() {
  vi.mocked(getServerSession).mockResolvedValue(session as never);
  vi.mocked(isMockMode).mockReturnValue(false);
  vi.mocked(isAiConfigured).mockReturnValue(true);
  vi.mocked(getModel).mockReturnValue({} as never);
}

afterEach(() => {
  vi.resetAllMocks();
  resetChatAuthMonitor();
});

describe("POST /api/chat", () => {
  it("returns 401 when the session is missing", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await POST(chatRequest());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "Please sign in first." });
    expect(response.headers.get("set-cookie")).toContain(
      "next-auth.session-token=;"
    );
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("converts an undecryptable session into a recoverable 401", async () => {
    vi.mocked(getServerSession).mockRejectedValueOnce(
      new Error("JWEDecryptionFailed")
    );

    const response = await POST(chatRequest());

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Please sign in first." });
    expect(response.headers.get("set-cookie")).toContain(
      "next-auth.session-token=;"
    );
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("logs one privacy-safe alert after repeated chat auth failures", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.mocked(getServerSession).mockResolvedValue(null);

    for (let i = 0; i < CHAT_AUTH_ALERT_THRESHOLD; i++) {
      await POST(chatRequest());
    }

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain(
      "repeated chat authentication failures detected"
    );
    expect(String(warn.mock.calls[0]?.[0])).not.toContain("user-1");
    expect(String(warn.mock.calls[0]?.[0])).not.toContain("session-token");
    warn.mockRestore();
  });

  it("streams a deterministic reply in mock mode", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session as never);
    vi.mocked(isMockMode).mockReturnValue(true);
    vi.mocked(isAiConfigured).mockReturnValue(false);

    const response = await POST(chatRequest());
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(body).toContain('"type":"text-delta"');
    expect(body).toContain('"delta":"recent "');
    expect(body).toContain('"delta":"logs: "');
  });

  it("returns a safe 502 response when provider setup fails", async () => {
    configureLiveMode();
    vi.mocked(streamText).mockImplementation(() => {
      throw new Error("provider credentials rejected");
    });

    const response = await POST(chatRequest());
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data).toEqual({ error: "The AI provider is unavailable right now." });
  });

  it("forwards provider stream errors to the server error callback", async () => {
    configureLiveMode();
    const providerError = new Error("provider stream interrupted");
    vi.mocked(streamText).mockReturnValue({
      toUIMessageStreamResponse: () =>
        new Response("data: {\"type\":\"finish\"}\n\n", {
          headers: { "content-type": "text/event-stream" },
        }),
    } as never);

    await POST(chatRequest());
    const options = vi.mocked(streamText).mock.calls[0]?.[0] as {
      onError?: (event: { error: unknown }) => void;
    };
    expect(options.onError).toBeTypeOf("function");
    expect(() => options.onError?.({ error: providerError })).not.toThrow();
  });

  it("uses watchdog timeouts — never a total cap that aborts streams mid-reply", async () => {
    configureLiveMode();
    vi.mocked(streamText).mockReturnValue({
      toUIMessageStreamResponse: () =>
        new Response("data: {\"type\":\"finish\"}\\n\\n", {
          headers: { "content-type": "text/event-stream" },
        }),
    } as never);

    await POST(chatRequest());

    const options = vi.mocked(streamText).mock.calls[0]?.[0] as {
      timeout?: unknown;
      maxRetries?: number;
    };
    // AI SDK v7 regression guard: a bare-number `timeout` means totalMs — one
    // abort controller that kills the ENTIRE stream at that deadline, which
    // was the root cause of replies stopping mid-sentence. Streaming calls
    // must use the watchdog object instead (first-chunk + stall budgets).
    expect(typeof options.timeout).toBe("object");
    expect(options.timeout).toMatchObject({
      firstChunkMs: 20_000,
      chunkMs: 30_000,
    });
    expect(options.maxRetries).toBe(2);
  });

  it("passes Arabic locale to orchestration and enables Arabic guardrails", async () => {
    configureLiveMode();
    vi.mocked(assembleCompanionContext).mockResolvedValue({
      systemPrompt: "STRICT ARABIC OUTPUT",
      messages: [],
      lastUserText: "هل توجد أنماط في سجلاتي هذا الأسبوع؟",
      ragRoute: {
        needsRetrieval: true,
        domains: [],
        reason: "Arabic informational phrasing",
      },
      ragChunkCount: 1,
      userFacts: null,
    });
    vi.mocked(streamText).mockReturnValue({
      toUIMessageStreamResponse: () =>
        new Response(
          [
            'data: {"type":"text-start","id":"text-1"}',
            'data: {"type":"text-delta","id":"text-1","delta":"الاتجاه مستقر."}',
            'data: {"type":"text-end","id":"text-1"}',
            'data: {"type":"finish"}',
          ].join("\\n\\n") + "\\n\\n",
          { headers: { "content-type": "text/event-stream" } }
        ),
    } as never);

    const response = await POST(
      chatRequest({
        locale: "ar",
        messages: [
          {
            role: "user",
            parts: [{ type: "text", text: "هل توجد أنماط في سجلاتي هذا الأسبوع؟" }],
          },
        ],
      })
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toContain("الاتجاه مستقر");
    expect(vi.mocked(assembleCompanionContext)).toHaveBeenCalledWith(
      expect.objectContaining({ locale: "ar", userId: "user-1" })
    );
    expect(vi.mocked(createGuardrailStreamTransform)).toHaveBeenCalledWith({
      arabicLeaks: true,
    });
  });
});
