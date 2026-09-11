// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { getServerSession } from "next-auth";
import { GET } from "./route";
import { prisma } from "@/lib/prisma";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    menstrualCycle: { findMany: vi.fn() },
    symptomLog: { findMany: vi.fn() },
    painLog: { findMany: vi.fn() },
  },
}));

afterEach(() => {
  vi.resetAllMocks();
});

const req = new (require("next/server").NextRequest)(
  "http://localhost/api/health/correlations"
);

function mockDb({ cycles = [] as any[], symptoms = [] as any[], painLogs = [] as any[] }) {
  vi.mocked(prisma.menstrualCycle.findMany).mockResolvedValue(cycles);
  vi.mocked(prisma.symptomLog.findMany).mockResolvedValue(symptoms);
  vi.mocked(prisma.painLog.findMany).mockResolvedValue(painLogs);
}

describe("GET /api/health/correlations", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns null cycle and empty recommendations for a fresh user", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "u1" },
    } as any);
    mockDb({});

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.cycle).toBeNull();
    expect(body.data.recommendations).toEqual([]);
    expect(body.data.hasSymptoms).toBe(false);
  });

  it("derives the cycle view when a cycle exists", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "u1" },
    } as any);
    mockDb({
      cycles: [
        {
          id: "c1",
          phase: "MENSTRUAL",
          startDate: new Date(Date.now() - 2 * 86_400_000),
          endDate: null,
        },
      ],
    });

    const res = await GET(req);
    const body = await res.json();

    expect(body.data.cycle).toMatchObject({
      phase: "MENSTRUAL",
      currentDay: 3,
      cycleLength: 28,
    });
  });

  it("surfaces insight-engine recommendations once enough pain logs exist", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "u1" },
    } as any);
    const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);
    mockDb({
      painLogs: Array.from({ length: 6 }, (_, i) => ({
        id: `p${i}`,
        painLevel: 8,
        moodTag: "stressed",
        notes: null,
        loggedAt: daysAgo(i),
      })),
      symptoms: [
        {
          symptom: "Pelvic Pain",
          date: new Date().toISOString().split("T")[0],
          severity: 9,
          category: "PHYSICAL",
          area: "PELVIC",
        },
      ],
    });

    const res = await GET(req);
    const body = await res.json();

    expect(body.data.hasSymptoms).toBe(true);
    expect(body.data.recommendations.length).toBeGreaterThan(0);
    const rec = body.data.recommendations[0];
    expect(rec).toHaveProperty("id");
    expect(rec).toHaveProperty("title");
    expect(rec).toHaveProperty("message");
    expect(["info", "warning", "critical"]).toContain(rec.priority);
  });
});
