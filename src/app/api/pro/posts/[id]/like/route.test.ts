// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getServerSession } from "next-auth";
import { POST } from "./route";
import { prisma } from "@/lib/prisma";

/**
 * Regression tests for the like endpoint's auth + error handling
 * (src/app/api/pro/posts/[id]/like/route.ts).
 *
 * Locked-in contract:
 *  - A session is required (previously enforced — keep it locked).
 *  - Liking an unknown postId no longer surfaces an unhandled Prisma FK
 *    error (500); it returns a clean 404.
 */

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    articleReaction: {
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const mockedSession = vi.mocked(getServerSession);
const mockedFindReaction = vi.mocked(prisma.articleReaction.findUnique);
const mockedCreate = vi.mocked(prisma.articleReaction.create);

const routeCtx = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
  mockedSession.mockResolvedValue({ user: { id: "u1" } } as never);
  mockedFindReaction.mockResolvedValue(null as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/pro/posts/[id]/like", () => {
  it("returns 401 without a session", async () => {
    mockedSession.mockResolvedValue(null);
    const res = await POST(new Request("http://localhost/api/x"), routeCtx("post-1"));
    expect(res.status).toBe(401);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns a clean 404 when the post does not exist (FK violation)", async () => {
    mockedCreate.mockRejectedValue(
      new Error("Foreign key constraint failed on the field: `postId`")
    );
    const res = await POST(new Request("http://localhost/api/x"), routeCtx("ghost"));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Post not found");
  });

  it("returns 201-like success with liked=true when the post exists", async () => {
    mockedCreate.mockResolvedValue({ id: "r1" } as never);
    const res = await POST(new Request("http://localhost/api/x"), routeCtx("post-1"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.liked).toBe(true);
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { userId: "u1", postId: "post-1", kind: "like" },
      })
    );
  });

  it("toggles an existing reaction off instead of re-creating", async () => {
    mockedFindReaction.mockResolvedValue({ id: "r-existing" } as never);
    const res = await POST(new Request("http://localhost/api/x"), routeCtx("post-1"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.liked).toBe(false);
    expect(mockedCreate).not.toHaveBeenCalled();
    expect(prisma.articleReaction.deleteMany).toHaveBeenCalledWith({
      where: { userId: "u1", postId: "post-1", kind: "like" },
    });
  });
});
