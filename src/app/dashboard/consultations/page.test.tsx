// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import ConsultationsHubPage, { categoryToEnum } from "./page";

/**
 * The hub composes server actions, the Pro gate, and the localized
 * context. Everything not under test is mocked:
 *
 *  - server actions (`@/app/pro/actions`) — returned promises the tests
 *    can resolve/reject per scenario;
 *  - `useProFeature` — flips the Pro banner and the brief fetch;
 *  - `useLanguage` — key-identity translator (labels double as
 *    assertions) + fixed locale/dir;
 *  - layout/motion shells (GlobalNavHeader, RouteTransition,
 *    DepthCard, ScrollReveal, PricingModal) — passive passthroughs so
 *    jsdom needs no IntersectionObserver/matchMedia.
 */

const actionsMock = vi.hoisted(() => ({
  getConsultations: vi.fn(),
  submitConsultationMessage: vi.fn(),
  submitSymptomIntake: vi.fn(),
  submitStructuredSymptoms: vi.fn(),
}));

vi.mock("@/app/pro/actions", () => actionsMock);

type ProMockState = { isPro: boolean; canUse: (feature: string) => boolean };

const proMock = vi.hoisted((): { value: ProMockState } => ({
  value: { isPro: true, canUse: () => true },
}));

vi.mock("@/hooks/useProFeature", () => ({
  useProFeature: () => proMock.value,
}));

vi.mock("@/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    locale: "en",
    dir: "ltr" as const,
    setLocale: vi.fn(),
  }),
}));

vi.mock("@/components/layout/GlobalNavHeader", () => ({
  default: () => <header data-testid="global-nav-header" />,
}));

vi.mock("@/components/ui/RouteTransition", () => ({
  RouteTransition: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/DepthCard", () => ({
  DepthCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/ScrollReveal", () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/pricing/PricingModal", () => ({
  PricingModal: () => null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => "/dashboard/consultations",
}));

const THREAD = {
  id: "ckthread0000000000000001",
  subject: "Flare management",
  status: "open",
  updatedAt: new Date("2026-09-10T10:00:00Z"),
  patient: { id: "p1", name: "Sara" },
  doctor: { id: "d1", name: "Dr. Hana" },
  messages: [{ content: "Please keep tracking morning stiffness." }],
};

beforeEach(() => {
  actionsMock.getConsultations.mockResolvedValue({ success: true, data: [THREAD] });
  actionsMock.submitConsultationMessage.mockResolvedValue({
    success: true,
    data: { id: "m1", content: "x", createdAt: new Date() },
  });
  actionsMock.submitSymptomIntake.mockResolvedValue({
    success: true,
    data: {
      structuredMessage: "Structured summary text",
      categories: [
        { label: "Pain", details: "Lower back" },
        { label: "Brain Fog", details: "Difficulty concentrating" },
      ],
      suggestedQuestions: ["Should I adjust medication?"],
    },
  });
  actionsMock.submitStructuredSymptoms.mockResolvedValue({
    success: true,
    data: { loggedCount: 2, messageSent: false },
  });
  proMock.value = { isPro: true, canUse: () => true };
  // Brief fetch is enabled by default (canUse → true); return no brief so
  // the card shows its empty state unless a test stubs a payload.
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

async function renderHub() {
  render(<ConsultationsHubPage />);
  await waitFor(() =>
    expect(actionsMock.getConsultations).toHaveBeenCalledTimes(1)
  );
}

describe("ConsultationsHubPage layout", () => {
  it("renders the hero, AI intake, and secure messaging sections", async () => {
    await renderHub();
    expect(screen.getByText("consultationsHub.title")).toBeInTheDocument();
    expect(screen.getByText("consultationsHub.intakeTitle")).toBeInTheDocument();
    expect(screen.getByText("consultationsHub.messagingTitle")).toBeInTheDocument();
    // Global header is present (sticky nav with back button).
    expect(screen.getByTestId("global-nav-header")).toBeInTheDocument();
  });

  it("shows the open thread with its subject, doctor, and last message", async () => {
    await renderHub();
    expect(screen.getByText("Flare management")).toBeInTheDocument();
    expect(screen.getByText(/consultation.doctorLabel · Dr. Hana/)).toBeInTheDocument();
    expect(screen.getByText(/Please keep tracking morning stiffness/)).toBeInTheDocument();
  });

  it("shows the empty state when no consultations exist", async () => {
    actionsMock.getConsultations.mockResolvedValue({ success: true, data: [] });
    await renderHub();
    expect(screen.getByText("consultation.noConsultations")).toBeInTheDocument();
  });
});

describe("ConsultationsHubPage AI symptom structuring", () => {
  it("disables the structure action until the description reaches 10 characters", async () => {
    await renderHub();
    const button = screen.getByRole("button", { name: "consultationsHub.structureAction" });
    const intake = screen.getByRole("textbox", { name: "consultationsHub.intakeTitle" });
    expect(button).toBeDisabled();
    fireEvent.change(intake, { target: { value: "short" } });
    expect(button).toBeDisabled();
    fireEvent.change(intake, {
      target: { value: "Widespread pain and poor sleep for days." },
    });
    expect(button).toBeEnabled();
  });

  it("submits the intake and renders the structured result", async () => {
    await renderHub();
    fireEvent.change(screen.getByRole("textbox", { name: "consultationsHub.intakeTitle" }), {
      target: { value: "Widespread pain and poor sleep for days." },
    });
    fireEvent.click(screen.getByRole("button", { name: "consultationsHub.structureAction" }));

    await waitFor(() =>
      expect(actionsMock.submitSymptomIntake).toHaveBeenCalledWith({
        raw: "Widespread pain and poor sleep for days.",
        persist: false,
      })
    );
    expect(await screen.findByText("Structured summary text")).toBeInTheDocument();
    expect(screen.getByText("Pain")).toBeInTheDocument();
    expect(screen.getByText("Should I adjust medication?")).toBeInTheDocument();
  });

  it("passes persist: true when the health-log checkbox is checked", async () => {
    await renderHub();
    fireEvent.change(screen.getByRole("textbox", { name: "consultationsHub.intakeTitle" }), {
      target: { value: "Widespread pain and poor sleep for days." },
    });
    fireEvent.click(screen.getByLabelText("consultationsHub.persistOption"));
    fireEvent.click(screen.getByRole("button", { name: "consultationsHub.structureAction" }));

    await waitFor(() =>
      expect(actionsMock.submitSymptomIntake).toHaveBeenCalledWith(
        expect.objectContaining({ persist: true })
      )
    );
  });

  it("surfaces the failure message when the action errors", async () => {
    actionsMock.submitSymptomIntake.mockResolvedValue({ success: false, error: "boom" });
    await renderHub();
    fireEvent.change(screen.getByRole("textbox", { name: "consultationsHub.intakeTitle" }), {
      target: { value: "Widespread pain and poor sleep for days." },
    });
    fireEvent.click(screen.getByRole("button", { name: "consultationsHub.structureAction" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("boom");
  });

  it("renders a severity slider per structured category, defaulting to 5/10", async () => {
    await renderHub();
    fireEvent.change(screen.getByRole("textbox", { name: "consultationsHub.intakeTitle" }), {
      target: { value: "Widespread pain and poor sleep for days." },
    });
    fireEvent.click(screen.getByRole("button", { name: "consultationsHub.structureAction" }));
    await screen.findByText("Structured summary text");

    const painSlider = screen.getByRole("slider", {
      name: "Pain — consultationsHub.severitySlider",
    });
    const fogSlider = screen.getByRole("slider", {
      name: "Brain Fog — consultationsHub.severitySlider",
    });
    expect(painSlider).toHaveValue("5");
    expect(fogSlider).toHaveValue("5");

    fireEvent.change(painSlider, { target: { value: "8" } });
    expect(screen.getByRole("slider", { name: "Pain — consultationsHub.severitySlider" })).toHaveValue("8");
    // Untouched slider keeps its value.
    expect(fogSlider).toHaveValue("5");
  });

  it("persists reviewed severities through submitStructuredSymptoms and shows the status", async () => {
    await renderHub();
    fireEvent.change(screen.getByRole("textbox", { name: "consultationsHub.intakeTitle" }), {
      target: { value: "Widespread pain and poor sleep for days." },
    });
    fireEvent.click(screen.getByRole("button", { name: "consultationsHub.structureAction" }));
    await screen.findByText("Structured summary text");

    fireEvent.change(
      screen.getByRole("slider", { name: "Pain — consultationsHub.severitySlider" }),
      { target: { value: "8" } }
    );
    fireEvent.click(screen.getByRole("button", { name: "consultationsHub.submitAction" }));

    await waitFor(() =>
      expect(actionsMock.submitStructuredSymptoms).toHaveBeenCalledWith({
        persist: true,
        symptoms: [
          { symptom: "Pain", severity: 8, category: "PHYSICAL" },
          { symptom: "Brain Fog", severity: 5, category: "COGNITIVE" },
        ],
        message: undefined,
        consultationId: undefined,
      })
    );
    expect(await screen.findByText("consultationsHub.loggedPart")).toBeInTheDocument();
  });

  it("shares the summary into the selected thread via submitStructuredSymptoms", async () => {
    await renderHub();
    fireEvent.change(screen.getByRole("textbox", { name: "consultationsHub.intakeTitle" }), {
      target: { value: "Widespread pain and poor sleep for days." },
    });
    fireEvent.click(screen.getByRole("button", { name: "consultationsHub.structureAction" }));
    await screen.findByText("Structured summary text");

    // Choose the open thread from the share select.
    fireEvent.change(screen.getByLabelText("consultationsHub.shareThreadLabel"), {
      target: { value: THREAD.id },
    });
    fireEvent.click(screen.getByRole("button", { name: "consultationsHub.submitAction" }));

    await waitFor(() =>
      expect(actionsMock.submitStructuredSymptoms).toHaveBeenCalledWith(
        expect.objectContaining({
          persist: true,
          message: "Structured summary text",
          consultationId: THREAD.id,
        })
      )
    );
  });

  it("disables the submit action when neither logging nor sharing is selected", async () => {
    await renderHub();
    fireEvent.change(screen.getByRole("textbox", { name: "consultationsHub.intakeTitle" }), {
      target: { value: "Widespread pain and poor sleep for days." },
    });
    fireEvent.click(screen.getByRole("button", { name: "consultationsHub.structureAction" }));
    await screen.findByText("Structured summary text");

    fireEvent.click(screen.getByLabelText("consultationsHub.logToRecordOption"));
    expect(screen.getByRole("button", { name: "consultationsHub.submitAction" })).toBeDisabled();
    expect(actionsMock.submitStructuredSymptoms).not.toHaveBeenCalled();
  });
});

describe("ConsultationsHubPage secure messaging", () => {
  it("sends the composer draft through the validated action", async () => {
    await renderHub();
    const composer = screen.getByRole("textbox", {
      name: "consultation.typeMessage — Flare management",
    });
    fireEvent.change(composer, { target: { value: "Morning flare eased today." } });
    fireEvent.click(screen.getByRole("button", { name: "consultation.send" }));

    await waitFor(() =>
      expect(actionsMock.submitConsultationMessage).toHaveBeenCalledWith({
        consultationId: THREAD.id,
        content: "Morning flare eased today.",
      })
    );
  });

  it("blocks sending while the draft is empty", async () => {
    await renderHub();
    const send = screen.getByRole("button", { name: "consultation.send" });
    expect(send).toBeDisabled();
    expect(actionsMock.submitConsultationMessage).not.toHaveBeenCalled();
  });

  it("reports send failures through the alert region", async () => {
    actionsMock.submitConsultationMessage.mockResolvedValue({
      success: false,
      error: "denied",
    });
    await renderHub();
    fireEvent.change(
      screen.getByRole("textbox", { name: "consultation.typeMessage — Flare management" }),
      { target: { value: "Hello doctor" } }
    );
    fireEvent.click(screen.getByRole("button", { name: "consultation.send" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("denied");
  });
});

describe("categoryToEnum mapping", () => {
  it("maps mood-related labels to MOOD", () => {
    expect(categoryToEnum("Mood & Anxiety")).toBe("MOOD");
    expect(categoryToEnum("المزاج والقلق")).toBe("MOOD");
  });

  it("maps cognitive/sleep labels to COGNITIVE", () => {
    expect(categoryToEnum("Brain Fog")).toBe("COGNITIVE");
    expect(categoryToEnum("Sleep Quality")).toBe("COGNITIVE");
    expect(categoryToEnum("الذاكرة والتركيز")).toBe("COGNITIVE");
  });

  it("defaults everything else to PHYSICAL", () => {
    expect(categoryToEnum("Pain")).toBe("PHYSICAL");
    expect(categoryToEnum("الألم العضلي")).toBe("PHYSICAL");
    expect(categoryToEnum("Digestion")).toBe("PHYSICAL");
  });
});

describe("ConsultationsHubPage Pro gating & brief", () => {
  it("shows the Pro preview banner for free users", async () => {
    proMock.value = { isPro: false, canUse: () => false };
    await renderHub();
    expect(screen.getByText("pricing.previewTitle")).toBeInTheDocument();
  });

  it("hides the Pro banner for Pro users", async () => {
    await renderHub();
    expect(screen.queryByText("pricing.previewTitle")).toBeNull();
  });

  it("renders the clinical brief headline when the API returns one", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          brief: {
            generatedAt: "2026-09-12",
            periodDays: 30,
            headline: "30-day mean pain 5.2/10 with 3 flare days; stable.",
            flareFrequency: { flareDays: 3, perMonth: 3, trend: "stable" },
            painProfile: {
              average: 5.2,
              average7d: 5,
              peak: 8,
              velocity: "stable",
              velocityDelta: null,
            },
            topTriggers: [],
            symptomProfile: { mostReported: ["fatigue"], distinctCount: 1 },
            functionalCapacity: {
              loggingStreakDays: 4,
              loggingAdherencePct: 80,
              moodPattern: "steady",
            },
            patientReportedMedications: [],
            redFlags: [],
            suggestedDiscussionPoints: ["Review sleep hygiene."],
            dataCaveat: "Self-reported data; not a diagnosis.",
          },
        }),
      })
    );
    await renderHub();
    expect(
      await screen.findByText(/30-day mean pain 5\.2\/10 with 3 flare days/)
    ).toBeInTheDocument();
    expect(screen.getByText("Review sleep hygiene.")).toBeInTheDocument();
  });

  it("shows the empty-brief state when the API returns nothing", async () => {
    await renderHub();
    expect(await screen.findByText("consultationsHub.briefEmpty")).toBeInTheDocument();
  });
});
