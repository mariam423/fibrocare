// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getServerSession } from "next-auth";
import { GET, POST } from "./route";
import { prisma } from "@/lib/prisma";

/**
 * Regression tests for the comments endpoints' auth checks
 * (src/app/api/pro/posts/[id]/comments/route.ts).
 *
 * Locked-in contract:
 *  - GET requires a session (previously it was fully public, leaking
 *    commenter ids/names and the comment thread of pending drafts).
 *  - Non-verified (pending/rejected) posts are visible to their author
 *    only; everyone else gets a 404 with no data.
 *  - POST requires a session, same visibility rules, and content is
 *    sanitized before persistence.
 */

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    doctorPost: { findUnique: vi.fn() },
    comment: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
    },
  },
}));

const mockedSession = vi.mocked(getServerSession);
const mockedFindPost = vi.mocked(prisma.doctorPost.findUnique);
const mockedFindComments = vi.mocked(prisma.comment.findMany);
const mockedCreate = vi.mocked(prisma.comment.create);

const routeCtx = (id = "post-1") => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
  mockedSession.mockResolvedValue({ user: { id: "u1" } } as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/pro/posts/[id]/comments — auth & visibility", () => {
  it("returns 401 without a session (was previously fully public)", async () => {
    mockedSession.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/x"), routeCtx("post-1"));
    expect(res.status).toBe(401);
    expect(mockedFindComments).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown post", async () => {
    mockedFindPost.mockResolvedValue(null as never);
    const res = await GET(new Request("http://localhost/api/x"), routeCtx("ghost"));
    expect(res.status).toBe(404);
    expect(mockedFindComments).not.toHaveBeenCalled();
  });

  it("serves comments for a verified post to any signed-in user", async () => {
    mockedFindPost.mockResolvedValue({
      id: "post-1",
      verifiedStatus: "verified",
      authorId: "doc-1",
    } as never);
    const res = await GET(new Request("http://localhost/api/x"), routeCtx("post-1"));
    expect(res.status).toBe(200);
    expect(mockedFindComments).toHaveBeenCalledWith(
      expect.objectContaining({ where: { postId: "post-1" } })
    );
  });

  it("hides a pending post's thread from non-authors (404, no leak)", async () => {
    mockedFindPost.mockResolvedValue({
      id: "draft-1",
      verifiedStatus: "pending",
      authorId: "doc-1",
    } as never);
    const res = await GET(new Request("http://localhost/api/x"), routeCtx("draft-1"));
    expect(res.status).toBe(404);
    expect(mockedFindComments).not.toHaveBeenCalled();
  });

  it("lets the author read their own pending post's thread", async () => {
    mockedSession.mockResolvedValue({ user: { id: "doc-1" } } as never);
    mockedFindPost.mockResolvedValue({
      id: "draft-1",
      verifiedStatus: "pending",
      authorId: "doc-1",
    } as never);
    const res = await GET(new Request("http://localhost/api/x"), routeCtx("draft-1"));
    expect(res.status).toBe(200);
    expect(mockedFindComments).toHaveBeenCalled();
  });
});

describe("POST /api/pro/posts/[id]/comments — auth & validation", () => {
  const post = (body: unknown, id = "post-1") =>
    new Request(`http://localhost/api/pro/posts/${id}/comments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });

  beforeEach(() => {
    mockedFindPost.mockResolvedValue({
      id: "post-1",
      verifiedStatus: "verified",
      authorId: "doc-1",
    } as never);
  });

  it("returns 401 without a session", async () => {
    mockedSession.mockResolvedValue(null);
    const res = await POST(post({ content: "Warm baths help me." }), routeCtx());
    expect(res.status).toBe(401);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown post (no comment rows created)", async () => {
    mockedFindPost.mockResolvedValue(null as never);
    const res = await POST(post({ content: "Warm baths help me." }), routeCtx("ghost"));
    expect(res.status).toBe(404);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("blocks non-authors from commenting on a pending draft", async () => {
    mockedFindPost.mockResolvedValue({
      id: "draft-1",
      verifiedStatus: "pending",
      authorId: "doc-1",
    } as never);
    const res = await POST(post({ content: "Nice draft!" }), routeCtx("draft-1"));
    expect(res.status).toBe(404);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid JSON", async () => {
    const res = await POST(
      "{not json" as unknown as Request,
      routeCtx("post-1")
    );
    expect(res.status).toBe(400);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns 400 for a schema violation (empty / oversized content)", async () => {
    const empty = await POST(post({ content: "" }), routeCtx());
    expect(empty.status).toBe(400);

    const oversized = await POST(post({ content: "x".repeat(1001) }), routeCtx());
    expect(oversized.status).toBe(400);

    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when content sanitizes to empty (pure attack payload)", async () => {
    const res = await POST(post({ content: "<script>alert(1)</script>" }), routeCtx());
    expect(res.status).toBe(400);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("strips script payloads before persisting", async () => {
    mockedCreate.mockResolvedValue({ id: "c1" } as never);
    const res = await POST(
      post({ content: "<script>alert(1)</script>Warm baths help me a lot." }),
      routeCtx()
    );
    expect(res.status).toBe(201);
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          content: "Warm baths help me a lot.",
        }),
      })
    );
  });

  it("persists the session-derived userId (never client-supplied)", async () => {
    mockedCreate.mockResolvedValue({ id: "c2" } as never);
    await POST(post({ content: "Warm baths help me a lot.", userId: "spoofed" }), routeCtx());
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "u1" }),
      })
    );
  });
});
