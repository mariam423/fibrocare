// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Security tests for POST /api/e2e/promote-doctor.
 *
 * This endpoint flips the caller's DB role to "doctor" — the highest
 * privilege in the app — so it must be unreachable in production and
 * strictly gated everywhere else:
 *
 *  1. HARD-DISABLED when NODE_ENV=production (returns 404, no DB write)
 *     even when E2E_PROMOTE_TOKEN is configured.
 *  2. HARD-DISABLED when E2E_PROMOTE_TOKEN is unset (dev default) — the
 *     route 404s, so it cannot run "even by accident".
 *  3. Requires a constant-time-matching X-E2E-Token header.
 *  4. Requires an authenticated session (no anonymous promotion).
 *  5. Idempotent: re-running is safe.
 */

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { update: vi.fn() },
  },
}));

import { getServerSession } from "next-auth";
import { POST } from "./route";
import { prisma } from "@/lib/prisma";

const mockedSession = vi.mocked(getServerSession);
const mockedUpdate = vi.mocked(prisma.user.update);

/**
 * NODE_ENV is typed read-only on ProcessEnv, but tests must flip it (the
 * production hard-disable is the security property under test). Writing
 * through a widened reference keeps tsc happy without touching the runtime
 * behavior.
 */
function setNodeEnv(value: string | undefined) {
  const env = process.env as { NODE_ENV?: string };
  if (value === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = value;
}

function postRequest(token?: string) {
  return new Request("http://localhost:3000/api/e2e/promote-doctor", {
    method: "POST",
    headers: token === undefined ? {} : { "x-e2e-token": token },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedSession.mockResolvedValue({ user: { id: "u1" } } as never);
  mockedUpdate.mockResolvedValue({
    id: "u1",
    role: "doctor",
  } as never);
});

afterEach(() => {
  delete process.env.E2E_PROMOTE_TOKEN;
  setNodeEnv(undefined);
  vi.restoreAllMocks();
});

describe("POST /api/e2e/promote-doctor — production hard-disable", () => {
  it("returns 404 and NEVER touches the DB in production, even with a valid token", async () => {
    setNodeEnv("production");
    process.env.E2E_PROMOTE_TOKEN = "valid-e2e-secret";

    const res = await POST(postRequest("valid-e2e-secret"));

    expect(res.status).toBe(404);
    expect(mockedSession).not.toHaveBeenCalled();
    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  it("returns 404 in production even for an UNAUTHENTICATED probe (no env leak)", async () => {
    setNodeEnv("production");
    process.env.E2E_PROMOTE_TOKEN = "valid-e2e-secret";
    mockedSession.mockResolvedValue(null);

    const res = await POST(postRequest());
    expect(res.status).toBe(404);
  });
});

describe("POST /api/e2e/promote-doctor — dev gating", () => {
  it("returns 404 when E2E_PROMOTE_TOKEN is unset (hard-disable default)", async () => {
    setNodeEnv("development");
    delete process.env.E2E_PROMOTE_TOKEN;

    const res = await POST(postRequest("anything"));
    expect(res.status).toBe(404);
    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  it("rejects a wrong or missing token with 403 before touching the session", async () => {
    setNodeEnv("development");
    process.env.E2E_PROMOTE_TOKEN = "valid-e2e-secret";

    const wrong = await POST(postRequest("wrong-token"));
    expect(wrong.status).toBe(403);
    expect(mockedSession).not.toHaveBeenCalled();

    const missing = await POST(postRequest());
    expect(missing.status).toBe(403);
  });

  it("rejects an unauthenticated caller with 401 even with a valid token", async () => {
    setNodeEnv("development");
    process.env.E2E_PROMOTE_TOKEN = "valid-e2e-secret";
    mockedSession.mockResolvedValue(null);

    const res = await POST(postRequest("valid-e2e-secret"));
    expect(res.status).toBe(401);
    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  it("promotes an authenticated, token-bearing caller and writes the doctor role", async () => {
    setNodeEnv("development");
    process.env.E2E_PROMOTE_TOKEN = "valid-e2e-secret";

    const res = await POST(postRequest("valid-e2e-secret"));
    expect(res.status).toBe(200);
    expect(mockedUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "u1" },
        data: { role: "doctor" },
      })
    );
  });

  it("is idempotent: a second successful call is allowed and safe", async () => {
    setNodeEnv("development");
    process.env.E2E_PROMOTE_TOKEN = "valid-e2e-secret";

    const first = await POST(postRequest("valid-e2e-secret"));
    const second = await POST(postRequest("valid-e2e-secret"));
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(mockedUpdate).toHaveBeenCalledTimes(2);
  });
});
