// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getServerSession } from "next-auth";
import { POST } from "./route";
import { prisma } from "@/lib/prisma";

/**
 * Regression tests for the mediaUrls sanitization fix in the REST
 * publishing route (POST /api/pro/posts).
 *
 * Locked-in contract (mirrors the server-action variant):
 *  - Only absolute http(s) URLs survive into `mediaUrls`.
 *  - `javascript:` / `data:` payloads are silently dropped, never stored.
 *  - Non-string entries and non-array values are dropped (no 500).
 *  - The list is capped at 6 URLs.
 */

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

const VALID_BODY = {
  title: "Managing morning stiffness",
  content: "Gentle stretching and a warm shower before rising can ease morning stiffness.",
  kind: "article",
};

type PrismaUser = Awaited<ReturnType<typeof prisma.user.findUnique>>;

const mockUserRole = (role: string | null) =>
  mockedUser.mockResolvedValue(
    role === null ? null : ({ role } as unknown as PrismaUser)
  );

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
  mockedSession.mockResolvedValue({ user: { id: "u1" } } as never);
  mockUserRole("doctor");
  mockedCreate.mockResolvedValue({
    id: "p1",
    title: VALID_BODY.title,
    content: VALID_BODY.content,
    tags: "",
    kind: "article",
    verifiedStatus: "pending",
    mediaUrls: [],
  } as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/pro/posts — mediaUrls sanitization", () => {
  it("persists an absolute https media URL", async () => {
    const res = await POST(
      postRequest({ ...VALID_BODY, mediaUrls: ["https://cdn.example.com/x.jpg"] }, "http://localhost:3000")
    );
    expect(res.status).toBe(201);
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          mediaUrls: ["https://cdn.example.com/x.jpg"],
        }),
      })
    );
  });

  it("drops javascript: URLs instead of persisting them", async () => {
    await POST(
      postRequest({ ...VALID_BODY, mediaUrls: ["javascript:alert(1)"] }, "http://localhost:3000")
    );
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ mediaUrls: [] }),
      })
    );
  });

  it("drops data: URLs instead of persisting them", async () => {
    await POST(
      postRequest({ ...VALID_BODY, mediaUrls: ["data:text/html;base64,xxx"] }, "http://localhost:3000")
    );
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ mediaUrls: [] }),
      })
    );
  });

  it("keeps only the safe entries from a mixed list", async () => {
    await POST(
      postRequest(
        {
          ...VALID_BODY,
          mediaUrls: [
            "data:text/html;base64,xxx",
            "https://cdn.example.com/a.jpg",
            "vbscript:msgbox",
            "http://cdn.example.com/b.jpg",
          ],
        },
        "http://localhost:3000"
      )
    );
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          mediaUrls: [
            "https://cdn.example.com/a.jpg",
            "http://cdn.example.com/b.jpg",
          ],
        }),
      })
    );
  });

  it("drops non-string entries without throwing a 500", async () => {
    const res = await POST(
      postRequest(
        { ...VALID_BODY, mediaUrls: [7, {}, "https://cdn.example.com/x.jpg"] },
        "http://localhost:3000"
      )
    );
    expect(res.status).toBe(201);
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          mediaUrls: ["https://cdn.example.com/x.jpg"],
        }),
      })
    );
  });

  it("treats a non-array mediaUrls value as an empty list (no 500)", async () => {
    const res = await POST(
      postRequest({ ...VALID_BODY, mediaUrls: "https://cdn.example.com/x.jpg" }, "http://localhost:3000")
    );
    expect(res.status).toBe(201);
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ mediaUrls: [] }),
      })
    );
  });

  it("caps the persisted list at 6 URLs", async () => {
    const ten = Array.from({ length: 10 }, (_, i) => `https://cdn.example.com/${i}.jpg`);
    await POST(postRequest({ ...VALID_BODY, mediaUrls: ten }, "http://localhost:3000"));
    const persisted = (mockedCreate.mock.calls[0]?.[0]?.data as { mediaUrls: string[] });
    expect(persisted.mediaUrls.length).toBe(6);
  });

  it("returns 201 with an empty list when mediaUrls is omitted", async () => {
    const res = await POST(postRequest(VALID_BODY, "http://localhost:3000"));
    expect(res.status).toBe(201);
    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ mediaUrls: [] }),
      })
    );
  });
});
