// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PostEditor } from "./PostEditor";

/**
 * PostEditor talks to two server actions (createDoctorPost and
 * aiPublishingAssistant). Both are mocked so the tests exercise the
 * composer's real state logic: kind selection, AI-assist wiring, and the
 * success/error a11y contract.
 */

const actionsMock = vi.hoisted(() => ({
  createDoctorPost: vi.fn(),
  aiPublishingAssistant: vi.fn(),
}));

vi.mock("@/app/pro/actions", () => actionsMock);

vi.mock("@/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    locale: "en",
    dir: "ltr" as const,
    setLocale: vi.fn(),
  }),
}));

beforeEach(() => {
  actionsMock.createDoctorPost.mockResolvedValue({ success: true, data: { id: "p1" } });
  actionsMock.aiPublishingAssistant.mockResolvedValue({
    success: true,
    data: { title: "AI Title", content: "AI draft content", tags: ["sleep"], summary: "s" },
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function fillValid(kind: "article" | "research" | "status" = "article") {
  fireEvent.click(screen.getByRole("radio", { name: `doctor.kind.${kind}` }));
  fireEvent.change(screen.getByTestId("doctor-post-title"), {
    target: { value: "Managing morning stiffness" },
  });
  fireEvent.change(screen.getByTestId("doctor-post-content"), {
    target: { value: "Gentle stretching and a warm shower before rising helps most patients." },
  });
}

describe("PostEditor kind selection", () => {
  it("renders a labelled radiogroup with all three kinds, article pre-selected", () => {
    render(<PostEditor />);
    const group = screen.getByRole("radiogroup", { name: "doctor.postKindLabel" });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "doctor.kind.article" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    for (const k of ["research", "status"] as const) {
      expect(screen.getByRole("radio", { name: `doctor.kind.${k}` })).toHaveAttribute(
        "aria-checked",
        "false"
      );
    }
  });

  it("passes the selected kind to the server action", async () => {
    render(<PostEditor />);
    fillValid("research");
    fireEvent.click(screen.getByTestId("doctor-post-publish"));

    await waitFor(() =>
      expect(actionsMock.createDoctorPost).toHaveBeenCalledWith(
        expect.objectContaining({ kind: "research" })
      )
    );
  });

  it("shows the success note and focuses it for screen readers", async () => {
    render(<PostEditor />);
    fillValid();
    fireEvent.click(screen.getByTestId("doctor-post-publish"));

    const success = await screen.findByTestId("doctor-post-success");
    expect(success).toBeInTheDocument();
    await waitFor(() => expect(success).toHaveFocus());
  });
});

describe("PostEditor AI assist", () => {
  it("is off by default; publishing sends the raw content untouched", async () => {
    render(<PostEditor />);
    fillValid();
    expect(screen.getByTestId("doctor-post-ai-toggle")).not.toBeChecked();
    fireEvent.click(screen.getByTestId("doctor-post-publish"));

    await waitFor(() => expect(actionsMock.createDoctorPost).toHaveBeenCalled());
    expect(actionsMock.aiPublishingAssistant).not.toHaveBeenCalled();
    expect(actionsMock.createDoctorPost).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "Gentle stretching and a warm shower before rising helps most patients.",
      })
    );
  });

  it("when enabled, structures the notes first and publishes the AI draft", async () => {
    render(<PostEditor />);
    fireEvent.change(screen.getByTestId("doctor-post-title"), {
      target: { value: "Managing morning stiffness" },
    });
    fireEvent.change(screen.getByTestId("doctor-post-content"), {
      target: { value: "raw messy clinical notes about sleep and stretching" },
    });
    fireEvent.click(screen.getByTestId("doctor-post-ai-toggle"));
    fireEvent.click(screen.getByTestId("doctor-post-publish"));

    await waitFor(() =>
      expect(actionsMock.aiPublishingAssistant).toHaveBeenCalledWith({
        notes: "raw messy clinical notes about sleep and stretching",
      })
    );
    await waitFor(() =>
      expect(actionsMock.createDoctorPost).toHaveBeenCalledWith(
        expect.objectContaining({ content: "AI draft content" })
      )
    );
  });

  it("surfaces the AI failure and does not publish", async () => {
    actionsMock.aiPublishingAssistant.mockResolvedValue({
      success: false,
      error: "AI unavailable",
    });
    render(<PostEditor />);
    fireEvent.change(screen.getByTestId("doctor-post-title"), {
      target: { value: "Managing morning stiffness" },
    });
    fireEvent.change(screen.getByTestId("doctor-post-content"), {
      target: { value: "raw messy clinical notes about sleep and stretching" },
    });
    fireEvent.click(screen.getByTestId("doctor-post-ai-toggle"));
    fireEvent.click(screen.getByTestId("doctor-post-publish"));

    expect(await screen.findByRole("alert")).toHaveTextContent("AI unavailable");
    expect(actionsMock.createDoctorPost).not.toHaveBeenCalled();
  });
});

describe("PostEditor validation & a11y", () => {
  it("disables publishing until title and content are present", () => {
    render(<PostEditor />);
    expect(screen.getByTestId("doctor-post-publish")).toBeDisabled();
    fireEvent.change(screen.getByTestId("doctor-post-title"), {
      target: { value: "Managing morning stiffness" },
    });
    expect(screen.getByTestId("doctor-post-publish")).toBeDisabled();
    fireEvent.change(screen.getByTestId("doctor-post-content"), {
      target: { value: "Gentle stretching and a warm shower before rising helps most patients." },
    });
    expect(screen.getByTestId("doctor-post-publish")).toBeEnabled();
  });

  it("associates labels with fields and announces errors via role=alert", async () => {
    actionsMock.createDoctorPost.mockResolvedValue({ success: false, error: "Nope" });
    render(<PostEditor />);
    expect(screen.getByLabelText("doctor.postTitle")).toBeInTheDocument();
    expect(screen.getByLabelText("doctor.postContent")).toBeInTheDocument();
    expect(screen.getByLabelText("doctor.postTags")).toBeInTheDocument();

    fillValid();
    fireEvent.click(screen.getByTestId("doctor-post-publish"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Nope");
  });

  it("caps status content at 1400 characters via maxLength", () => {
    render(<PostEditor />);
    fireEvent.click(screen.getByRole("radio", { name: "doctor.kind.status" }));
    expect(screen.getByTestId("doctor-post-content")).toHaveAttribute("maxlength", "1400");
    fireEvent.click(screen.getByRole("radio", { name: "doctor.kind.article" }));
    expect(screen.getByTestId("doctor-post-content")).toHaveAttribute("maxlength", "10000");
  });
});
