// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getServerSession } from "next-auth";
import { GET, POST } from "./route";
import { prisma } from "@/lib/prisma";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    doctorPost: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockedSession = vi.mocked(getServerSession);
const mockedUser = vi.mocked(prisma.user.findUnique);
const mockedCreate = vi.mocked(prisma.doctorPost.create);

/** Stub the route's `select: { role: true }` projection. */
const mockUserRole = (role: string | null) =>
  mockedUser.mockResolvedValue(
    role === null ? null : ({ role } as unknown as PrismaUser)
  );
type PrismaUser = Awaited<ReturnType<typeof prisma.user.findUnique>>;

const VALID_BODY = {
  title: "Managing morning stiffness",
  content: "Gentle stretching and a warm shower before rising can ease morning stiffness.",
  kind: "article",
};

function postRequest(body: unknown, origin?: string) {
  return new Request("http://localhost:3000/api/pro/posts", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(origin ? { origin } : {}),
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUserRole("doctor");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/pro/posts — auth & RBAC", () => {
  it("returns 401 without a session", async () => {
    mockedSession.mockResolvedValue(null);
    const res = await POST(postRequest(VALID_BODY));
    expect(res.status).toBe(401);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns 403 for a non-doctor role (fail-closed)", async () => {
    mockedSession.mockResolvedValue({ user: { id: "u1" } } as never);
    mockUserRole("free_user");
    const res = await POST(postRequest(VALID_BODY));
    expect(res.status).toBe(403);
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns 403 when the DB lookup fails (fail-closed)", async () => {
    mockedSession.mockResolvedValue({ user: { id: "u1" } } as never);
    mockUserRole(null);
    const res = await POST(postRequest(VALID_BODY));
    expect(res.status).toBe(403);
  });
});

describe("POST /api/pro/posts — CSRF", () => {
  it("rejects a cross-site Origin with 403", async () => {
    mockedSession.mockResolvedValue({ user: { id: "u1" } } as never);
    const res = await POST(postRequest(VALID_BODY, "https://evil.example"));
    expect(res.status).toBe(403);
    expect(res.headers.get("content-type")).toContain("json");
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("accepts a same-origin request", async () => {
    mockedSession.mockResolvedValue({ user: { id: "u1" } } as never);
    mockedCreate.mockResolvedValue({
      id: "p1",
      title: VALID_BODY.title,
      content: VALID_BODY.content,
      tags: "",
      kind: "article",
      verifiedStatus: "pending",
    } as never);
    const res = await POST(postRequest(VALID_BODY, "http://localhost:3000"));
    expect(res.status).toBe(201);
    expect(mockedCreate).toHaveBeenCalled();
  });
});

describe("POST /api/pro/posts — validation & sanitization", () => {
  beforeEach(() => {
    mockedSession.mockResolvedValue({ user: { id: "u1" } } as never);
  });

  it("returns 400 for invalid JSON", async () => {
    const res = await POST(
      new Request("http://localhost:3000/api/pro/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{not json",
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 with the Zod message for an invalid payload", async () => {
    const res = await POST(postRequest({ title: "hi", content: "short" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(typeof data.error).toBe("string");
  });

  it("strips script payloads before persisting", async () => {
    mockedCreate.mockResolvedValue({
      id: "p2",
      title: "Clean title",
      content: "Clean content here",
      tags: "",
      kind: "article",
      verifiedStatus: "pending",
    } as never);
    const res = await POST(
      postRequest({
        title: "<script>alert(1)</script>Clean title",
        content: "<img src=x onerror=alert(1)>Gentle stretching and warm showers help ease stiffness.",
      })
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.post.title).not.toContain("<script>");
    expect(data.post.content).not.toContain("<img");
  });

  it("rejects a status kind over 1400 characters", async () => {
    const res = await POST(
      postRequest({ ...VALID_BODY, kind: "status", content: "x".repeat(1401) })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/1400/);
  });

  it("persists the session-derived author id (never client-supplied)", async () => {
    mockedCreate.mockResolvedValue({
      id: "p3",
      title: VALID_BODY.title,
      content: VALID_BODY.content,
      tags: "",
      kind: "research",
      verifiedStatus: "pending",
    } as never);
    await POST(postRequest({ ...VALID_BODY, kind: "research", authorId: "spoofed" }));
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ authorId: "u1" }),
      })
    );
  });
});

describe("GET /api/pro/posts — scoping", () => {
  it("returns 401 without a session", async () => {
    mockedSession.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost:3000/api/pro/posts"));
    expect(res.status).toBe(401);
  });

  it("scopes public reads to verified manual posts and validates kind", async () => {
    mockedSession.mockResolvedValue({ user: { id: "u1" } } as never);
    mockUserRole("free_user");

    await GET(new Request("http://localhost:3000/api/pro/posts"));
    expect(prisma.doctorPost.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ verifiedStatus: "verified", source: "manual" }),
      })
    );

    const bad = await GET(
      new Request("http://localhost:3000/api/pro/posts?kind=pipe-bomb")
    );
    expect(bad.status).toBe(400);
  });

  it("scopes a doctor's `mine=1` read to their own author id", async () => {
    mockedSession.mockResolvedValue({ user: { id: "doc-1" } } as never);
    mockUserRole("doctor");
    await GET(new Request("http://localhost:3000/api/pro/posts?mine=1&kind=status"));
    expect(prisma.doctorPost.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ authorId: "doc-1", kind: "status" }),
      })
    );
  });
});
