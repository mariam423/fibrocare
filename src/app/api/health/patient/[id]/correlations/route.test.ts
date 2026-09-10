// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { getServerSession } from "next-auth";
import { GET } from "./route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    consultation: {
      findFirst: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    menstrualCycle: {
      findMany: vi.fn(),
    },
    symptomLog: {
      findMany: vi.fn(),
    },
    painLog: {
      findMany: vi.fn(),
    },
  },
}));

const mockDoctor = { id: "doc-1", role: "doctor", name: "Dr. Smith" };
const mockPatient = { id: "pat-1", name: "Patient A" };

afterEach(() => {
  vi.resetAllMocks();
});

describe("GET /api/health/patient/[id]/correlations", () => {
  const req = new NextRequest("http://localhost/api/health/patient/pat-1/correlations");
  const params = { id: "pat-1" };

  it("returns 401 when session is missing", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const response = await GET(req, { params });
    expect(response.status).toBe(401);
  });

  it("returns 403 when user is not a doctor", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-1", role: "patient" },
    } as any);
    const response = await GET(req, { params });
    expect(response.status).toBe(403);
  });

  it("returns 403 when doctor has no consultation with patient", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "doc-1", role: "doctor" },
    } as any);
    vi.mocked(prisma.consultation.findFirst).mockResolvedValue(null);
    const response = await GET(req, { params });
    expect(response.status).toBe(403);
  });

  it("returns 404 when patient does not exist", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "doc-1", role: "doctor" },
    } as any);
    vi.mocked(prisma.consultation.findFirst).mockResolvedValue({ id: "cons-1" });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const response = await GET(req, { params });
    expect(response.status).toBe(404);
  });

  it("returns 200 with analytical summary when authorized and data exists", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "doc-1", role: "doctor" },
    } as any);
    vi.mocked(prisma.consultation.findFirst).mockResolvedValue({ id: "cons-1" });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockPatient);

    vi.mocked(prisma.menstrualCycle.findMany).mockResolvedValue([
      { id: "c1", phase: "LUTEAL", startDate: new Date(), endDate: null },
    ] as any);

    vi.mocked(prisma.symptomLog.findMany).mockResolvedValue([
      { id: "s1", symptom: "Brain Fog", severity: 8, category: "COGNITIVE", area: "OTHER", date: "2026-09-10", userId: "pat-1", createdAt: new Date() },
      { id: "s2", symptom: "Pelvic Pain", severity: 9, category: "PHYSICAL", area: "PELVIC", date: "2026-09-10", userId: "pat-1", createdAt: new Date() },
    ] as any);

    vi.mocked(prisma.painLog.findMany).mockResolvedValue([]);

    const response = await GET(req, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("currentPhase");
    expect(data).toHaveProperty("alerts");
    expect(data).toHaveProperty("topHotspots");
    expect(data).toHaveProperty("summary");
    expect(data.currentPhase).toBe("LUTEAL");
    expect(data.summary.cognitiveAvg).toBe(8);
    expect(data.summary.physicalAvg).toBe(9);
    expect(data.topHotspots[0].area).toBe("PELVIC");
  });
});
