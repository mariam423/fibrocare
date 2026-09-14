// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getServerSession } from "next-auth";
import { getDoctorPosts } from "./actions";
import { prisma } from "@/lib/prisma";

/**
 * Regression tests for `getDoctorPosts` (src/app/pro/actions.ts).
 *
 * Locked-in contract (broken-access-control fix):
 *  - Server actions are publicly reachable endpoints: no session → error,
 *    no DB read.
 *  - The `status` filter is not caller-ownable: only doctors may use it,
 *    and their view is always scoped to their own authorId. Non-doctors
 *    requesting `status` get an error, never pending/rejected rows.
 *  - `authorId` filtering is clamped to the caller's own id.
 *  - The default public view stays verified + manual.
 */

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    doctorPost: { findMany: vi.fn().mockResolvedValue([]) },
  },
}));

const mockedSession = vi.mocked(getServerSession);
const mockedUser = vi.mocked(prisma.user.findUnique);
const mockedFindPosts = vi.mocked(prisma.doctorPost.findMany);

/** Stub the caller's DB role row (only `role` is selected by the action). */
const mockUserRole = (role: string | null) =>
  mockedUser.mockResolvedValue(
    role === null
      ? null
      : ({ id: "u1", role } as unknown as Awaited<
          ReturnType<typeof prisma.user.findUnique>
        >)
  );

beforeEach(() => {
  vi.clearAllMocks();
  mockedSession.mockResolvedValue({ user: { id: "u1" } } as never);
  mockUserRole("free_user");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getDoctorPosts — session & ACL", () => {
  it("errors for an unauthenticated caller without touching the DB", async () => {
    mockedSession.mockResolvedValue(null);
    const result = await getDoctorPosts({ status: "verified" });
    expect(result.success).toBe(false);
    expect(mockedFindPosts).not.toHaveBeenCalled();
  });

  it("errors for a DB-missing user (fail-closed)", async () => {
    mockUserRole(null);
    const result = await getDoctorPosts();
    expect(result.success).toBe(false);
    expect(mockedFindPosts).not.toHaveBeenCalled();
  });

  it("rejects a non-doctor's caller-chosen status filter", async () => {
    const result = await getDoctorPosts({ status: "pending" });
    expect(result.success).toBe(false);
    expect(mockedFindPosts).not.toHaveBeenCalled();
  });

  it("allows a non-doctor to read the public verified feed (dashboard path)", async () => {
    const result = await getDoctorPosts({ status: "verified", limit: 3 });
    expect(result.success).toBe(true);
    expect(mockedFindPosts).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          verifiedStatus: "verified",
          source: "manual",
        }),
      })
    );
  });

  it("scopes a doctor's status-filtered read to their own authorId", async () => {
    mockedSession.mockResolvedValue({ user: { id: "doc-1" } } as never);
    mockUserRole("doctor");

    const result = await getDoctorPosts({ status: "pending" });
    expect(result.success).toBe(true);
    expect(mockedFindPosts).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          verifiedStatus: "pending",
          authorId: "doc-1",
        }),
      })
    );
  });

  it("clamps a spoofed authorId to the caller's own id", async () => {
    await getDoctorPosts({ authorId: "someone-else" });
    expect(mockedFindPosts).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ authorId: "u1" }),
      })
    );
  });

  it("scopes the verified feed read to the caller when authorId is passed", async () => {
    await getDoctorPosts({ status: "verified", authorId: "someone-else" });
    expect(mockedFindPosts).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ authorId: "u1" }),
      })
    );
  });
});
