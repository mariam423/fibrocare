// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { prisma } from "@/lib/prisma";

/**
 * Regression tests for the symptom-log validation + sanitization fix.
 *
 * Locked-in contract:
 *  - `symptom` is capped at 120 chars by Zod and sanitized through
 *    `sanitizeUserText` before the upsert (the value lands in the
 *    (userId, symptom, date) unique key, so it must be clean and bounded).
 *  - `date` must be a strict `YYYY-MM-DD` string — the whole app buckets
 *    symptom queries on that exact format.
 *  - A symptom that collapses below 3 chars after sanitization is rejected.
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
    symptomLog: { upsert: vi.fn() },
  },
}));

const mockedSession = vi.mocked(getServerSession);
const mockedUpsert = vi.mocked(prisma.symptomLog.upsert);

const VALID_BODY = {
  symptom: "Pelvic pain",
  severity: 7,
  category: "PHYSICAL",
  date: "2026-09-16",
};

function postRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/health/symptoms", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedSession.mockResolvedValue({ user: { id: "u1" } } as never);
  mockedUpsert.mockResolvedValue({
    id: "s1",
    userId: "u1",
    symptom: "Pelvic pain",
    date: "2026-09-16",
    severity: 7,
    category: "PHYSICAL",
  } as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/health/symptoms — symptom sanitization", () => {
  it("returns 401 without a session and never touches the DB", async () => {
    mockedSession.mockResolvedValue(null);
    const res = await POST(postRequest(VALID_BODY));
    expect(res.status).toBe(401);
    expect(mockedUpsert).not.toHaveBeenCalled();
  });

  it("strips HTML payloads from the symptom label before persisting", async () => {
    await POST(
      postRequest({ ...VALID_BODY, symptom: "<b>Joint</b> pain" })
    );
    expect(mockedUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId_symptom_date: expect.objectContaining({
            symptom: "Joint pain",
          }),
        }),
      })
    );
  });

  it("strips script blocks and their content from the symptom label", async () => {
    await POST(
      postRequest({ ...VALID_BODY, symptom: "Headache<script>alert(1)</script> badly" })
    );
    expect(mockedUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId_symptom_date: expect.objectContaining({
            symptom: "Headache badly",
          }),
        }),
      })
    );
  });

  it("uses the sanitized label in BOTH upsert legs (where + create)", async () => {
    await POST(
      postRequest({ ...VALID_BODY, symptom: "Brain <img src=x> fog" })
    );
    const call = mockedUpsert.mock.calls[0]?.[0];
    expect(call?.where).toEqual(
      expect.objectContaining({
        userId_symptom_date: expect.objectContaining({ symptom: "Brain fog" }),
      })
    );
    expect(call?.create).toEqual(
      expect.objectContaining({ symptom: "Brain fog", userId: "u1" })
    );
  });

  it("rejects a symptom that collapses below 3 chars after sanitization", async () => {
    const res = await POST(
      postRequest({ ...VALID_BODY, symptom: "<script>x</script>ab" })
    );
    expect(res.status).toBe(400);
    expect(mockedUpsert).not.toHaveBeenCalled();
  });

  it("returns 400 when the symptom exceeds the 120-character Zod cap", async () => {
    const res = await POST(
      postRequest({ ...VALID_BODY, symptom: "x".repeat(121) })
    );
    expect(res.status).toBe(400);
    expect(mockedUpsert).not.toHaveBeenCalled();
  });

  it("accepts a symptom exactly at the 120-character cap", async () => {
    const res = await POST(
      postRequest({ ...VALID_BODY, symptom: "x".repeat(120) })
    );
    expect(res.status).toBe(201);
  });
});

describe("POST /api/health/symptoms — strict date format", () => {
  it.each([
    ["2026/09/16", "slashes instead of dashes"],
    ["16-09-2026", "day-first format"],
    ["2026-9-16", "unpadded month"],
    ["2026-09-16T00:00:00Z", "full ISO timestamp"],
    ["not-a-date", "free text"],
    ["", "empty string"],
  ])("rejects %p (%s)", async (date) => {
    const res = await POST(postRequest({ ...VALID_BODY, date }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Validation failed");
    expect(mockedUpsert).not.toHaveBeenCalled();
  });

  it("accepts a well-formed YYYY-MM-DD date", async () => {
    const res = await POST(postRequest(VALID_BODY));
    expect(res.status).toBe(201);
    expect(mockedUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId_symptom_date: expect.objectContaining({ date: "2026-09-16" }),
        }),
      })
    );
  });
});
