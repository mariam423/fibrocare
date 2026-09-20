// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { prisma } from "@/lib/prisma";

/**
 * Regression tests for the cycle-log notes sanitization fix.
 *
 * Locked-in contract:
 *  - `notes` free text is sanitized through the shared `sanitizeUserText`
 *    layer (HTML/script/URL-scheme payloads stripped) before persisting.
 *  - Whitespace is preserved (`collapseWhitespace: false`) — notes keep
 *    their line breaks.
 *  - Zod rejects notes over 2000 chars before the route even runs.
 *  - Absent notes stay absent (`undefined`, not null/empty string).
 */

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

// The route consults the privacy-lock gate after auth; unlocked in tests.
vi.mock("@/lib/security/privacyPin", () => ({
  privacyLockResponse: vi.fn(async () => null),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    menstrualCycle: { create: vi.fn() },
  },
}));

const mockedSession = vi.mocked(getServerSession);
const mockedCreate = vi.mocked(prisma.menstrualCycle.create);

const VALID_BODY = {
  startDate: "2026-09-01",
  phase: "MENSTRUAL",
  overallSeverity: 5,
};

function postRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/health/cycle", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedSession.mockResolvedValue({ user: { id: "u1" } } as never);
  mockedCreate.mockResolvedValue({
    id: "c1",
    userId: "u1",
    phase: "MENSTRUAL",
    overallSeverity: 5,
  } as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/health/cycle — notes sanitization", () => {
  it("returns 401 without a session and never touches the DB", async () => {
    mockedSession.mockResolvedValue(null);
    const res = await POST(postRequest(VALID_BODY));
    expect(res.status).toBe(401);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("strips script payloads from notes before persisting", async () => {
    const res = await POST(
      postRequest({
        ...VALID_BODY,
        notes: "Feeling rough<script>alert(1)</script> today",
      })
    );
    expect(res.status).toBe(201);
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notes: "Feeling rough today",
        }),
      })
    );
  });

  it("strips standalone HTML tags but keeps the text", async () => {
    await POST(
      postRequest({ ...VALID_BODY, notes: "pain <b>8/10</b> with cramps" })
    );
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notes: "pain 8/10 with cramps",
        }),
      })
    );
  });

  it("kills javascript: URL payloads inside notes (scheme + payload removed)", async () => {
    await POST(
      postRequest({
        ...VALID_BODY,
        notes: "see javascript:alert(document.cookie) for details",
      })
    );
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notes: "see  for details",
        }),
      })
    );
  });

  it("preserves line breaks in notes (collapseWhitespace: false)", async () => {
    await POST(
      postRequest({ ...VALID_BODY, notes: "Morning cramps\n\nTook painkillers" })
    );
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notes: "Morning cramps\n\nTook painkillers",
        }),
      })
    );
  });

  it("preserves Arabic notes (with embedded payload stripped)", async () => {
    await POST(
      postRequest({ ...VALID_BODY, notes: "ألم شديد<script>x</script> اليوم" })
    );
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notes: "ألم شديد اليوم",
        }),
      })
    );
  });

  it("leaves notes as undefined when the body omits them", async () => {
    await POST(postRequest(VALID_BODY));
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ notes: undefined }),
      })
    );
  });

  it("returns 400 when notes exceed the 2000-character Zod cap", async () => {
    const res = await POST(
      postRequest({ ...VALID_BODY, notes: "x".repeat(2001) })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Validation failed");
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("accepts notes exactly at the 2000-character cap", async () => {
    const res = await POST(
      postRequest({ ...VALID_BODY, notes: "x".repeat(2000) })
    );
    expect(res.status).toBe(201);
    expect(mockedCreate).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/health/cycle — existing validation contract", () => {
  it("returns 400 for an invalid phase", async () => {
    const res = await POST(
      postRequest({ ...VALID_BODY, phase: "NOT_A_PHASE" })
    );
    expect(res.status).toBe(400);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when endDate precedes startDate", async () => {
    const res = await POST(
      postRequest({ ...VALID_BODY, endDate: "2026-08-31" })
    );
    expect(res.status).toBe(400);
    expect(mockedCreate).not.toHaveBeenCalled();
  });
});
