// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { AiArticleLibrary } from "./AiArticleLibrary";

/**
 * Mount-flow tests for the seed-state gate.
 *
 * The library must consult the SERVER-side seed state before POSTing
 * /api/ai/articles/seed, so a flood of concurrent first visitors on a
 * fresh deploy collapses to (at most) one seed POST per instance:
 *
 *  - listed rows      → no seed-state call, no POST
 *  - needsSeed:false  → no POST (stale empty cache; re-list instead)
 *  - seedInFlight     → no POST (another visitor's seed just started)
 *  - needsSeed:true   → exactly one POST, then re-list
 */

const actionsMock = vi.hoisted(() => ({
  listPublishedArticles: vi.fn(),
  getAiLibrarySeedState: vi.fn(),
  listArticleTopics: vi.fn(),
  ensureArticleForTopic: vi.fn(),
}));

vi.mock("@/app/pro/doctor-article-actions", () => actionsMock);
vi.mock("@/app/pro/doctor-article-cache", () => ({
  decideSeedAction: (state: { needsSeed: boolean; seedInFlight: boolean }) =>
    !state.needsSeed
      ? "skip-listed"
      : state.seedInFlight
        ? "skip-inflight"
        : "seed",
}));

vi.mock("@/app/pro/article-reaction-actions", () => ({
  getArticleReactions: vi.fn().mockResolvedValue({ success: true, data: {} }),
}));

// The real LanguageContext memoizes `t`; the mount effect depends on it,
// so the mock must return a STABLE identity or every state update re-runs
// the effect and double-consumes the mock queues.
const languageMock = vi.hoisted(() => ({
  t: (key: string) => key,
  locale: "en" as const,
  dir: "ltr" as const,
  setLocale: () => {},
}));

vi.mock("@/context/LanguageContext", () => ({
  useLanguage: () => languageMock,
}));

const fetchMock = vi.fn();

/** jsdom lacks the browser APIs framer-motion / ScrollReveal rely on. */
function installJsdomBrowserStubs() {
  if (typeof globalThis.IntersectionObserver === "undefined") {
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return [];
        }
      }
    );
  }
  if (typeof globalThis.ResizeObserver === "undefined") {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
  }
  if (typeof window.matchMedia !== "function") {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: false,
        media: "",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      })
    );
  }
}

function article(id: string) {
  return {
    id,
    title: `Title ${id}`,
    summary: "s",
    content: "# c",
    tags: ["sleep-hygiene"],
    createdAt: "2026-01-01T00:00:00.000Z",
    authorName: "Dr. X",
    authorTitle: "MD",
    authorityLabel: "Mayo Clinic",
    readingMinutes: 5,
    language: "en" as const,
  };
}

beforeEach(() => {
  installJsdomBrowserStubs();
  actionsMock.listPublishedArticles.mockReset();
  actionsMock.getAiLibrarySeedState.mockReset();
  actionsMock.listArticleTopics.mockReset();
  actionsMock.ensureArticleForTopic.mockReset();
  actionsMock.listPublishedArticles.mockResolvedValue({
    success: true,
    data: [],
  });
  actionsMock.getAiLibrarySeedState.mockResolvedValue({
    needsSeed: true,
  seedInFlight: false,
  });
  actionsMock.listArticleTopics.mockResolvedValue([]);
  actionsMock.ensureArticleForTopic.mockResolvedValue({ success: false });
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(new Response("{}"));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function renderLibrary() {
  return render(<AiArticleLibrary initialArticles={[]} />);
}

describe("AiArticleLibrary — seed-state gate", () => {
  it("POSTs the seed endpoint when the state says needsSeed", async () => {
    actionsMock.getAiLibrarySeedState.mockResolvedValue({
      needsSeed: true,
      seedInFlight: false,
    });
    actionsMock.listPublishedArticles
      .mockResolvedValueOnce({ success: true, data: [] }) // initial list
      .mockResolvedValueOnce({ success: true, data: [article("a1")] }); // after seed

    renderLibrary();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/ai/articles/seed", {
        method: "POST",
      });
    });
    expect(actionsMock.getAiLibrarySeedState).toHaveBeenCalledWith("en");
    // The final re-list renders the seeded rows.
    await waitFor(() => {
      expect(screen.getByTestId("ai-article-grid")).toBeInTheDocument();
    });
  });

  it("skips the POST entirely when the library is already listed", async () => {
    actionsMock.listPublishedArticles.mockResolvedValue({
      success: true,
      data: [article("a1")],
    });

    renderLibrary();

    await waitFor(() => {
      expect(screen.getByTestId("ai-article-grid")).toBeInTheDocument();
    });
    expect(actionsMock.getAiLibrarySeedState).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not POST when the state reports the library is populated (stale empty cache)", async () => {
    actionsMock.getAiLibrarySeedState.mockResolvedValue({
      needsSeed: false,
      seedInFlight: false,
    });
    actionsMock.listPublishedArticles
      .mockResolvedValueOnce({ success: true, data: [] }) // initial (stale) list
      .mockResolvedValueOnce({ success: true, data: [article("a2")] }); // fresh re-list

    renderLibrary();

    await waitFor(() => {
      expect(screen.getByText("Title a2")).toBeInTheDocument();
    });
    expect(fetchMock).not.toHaveBeenCalledWith("/api/ai/articles/seed", {
      method: "POST",
    });
  });

  it("does not POST while another visitor's seed is in flight, but re-lists", async () => {
    actionsMock.getAiLibrarySeedState.mockResolvedValue({
      needsSeed: true,
      seedInFlight: true,
    });
    actionsMock.listPublishedArticles
      .mockResolvedValueOnce({ success: true, data: [] }) // initial list
      .mockResolvedValueOnce({ success: true, data: [article("a3")] }); // after waiting out the seed

    renderLibrary();

    // The component deliberately waits a few seconds before re-listing
    // (giving the in-flight seed time to land rows), so the timeout must
    // comfortably cover that wait.
    await waitFor(
      () => {
        expect(screen.getByText("Title a3")).toBeInTheDocument();
      },
      { timeout: 10_000 }
    );
    expect(fetchMock).not.toHaveBeenCalled();
  }, 15_000);
});
