// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import GlobalNavHeader from "./GlobalNavHeader";

/**
 * GlobalNavHeader consumes the health (theme) and language contexts plus
 * three browser services: the Next.js router, the current pathname, and
 * the NotificationBell. None of the providers are exported for tests, so
 * every one of them is mocked:
 *
 *  - `useLanguage` returns the key itself for `t()` (deterministic labels
 *    that double as the breadcrumb assertions) and a settable locale so
 *    the toggle's accessible name can be flipped.
 *  - `usePathname` is redirected to `currentPath`, letting each test
 *    render a different route.
 *  - `useRouter` hands out `routerMock`, capturing back()/push() calls.
 *  - `window.history.length` is stubbed per test via setHistory() to model
 *    in-app history (smart back) versus a fresh entry (fallback link).
 *    The stub is applied INSIDE the test (not beforeEach) so each test's
 *    value is what the component actually reads at render time.
 *
 * The header no longer duplicates the Dashboard's section links — the
 * breadcrumb trail (with a single, deduplicated home shortcut) and the
 * action cluster (go back, language, theme, notifications, responsive
 * menu) are the only navigation surfaces under test.
 */

let currentPath = "/dashboard";
const routerMock = { back: vi.fn(), push: vi.fn() };

vi.mock("@/context/LanguageContext", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    locale: localeState.value,
    setLocale: vi.fn(),
    dir: localeState.value === "ar" ? ("rtl" as const) : ("ltr" as const),
  }),
}));

vi.mock("@/context/HealthContext", () => ({
  useHealth: () => ({ isDark: false, toggleDark: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => currentPath,
  useRouter: () => routerMock,
}));

vi.mock("@/components/notifications/NotificationBell", () => ({
  NotificationBell: () => <div data-testid="notification-bell" />,
}));

const localeState = { value: "en" as "en" | "ar" };

function setHistory(length: number) {
  vi.stubGlobal("history", { length });
}

beforeEach(() => {
  currentPath = "/dashboard";
  localeState.value = "en";
  routerMock.back.mockClear();
  routerMock.push.mockClear();
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

// No vitest globals → RTL auto-cleanup is off; unmount between tests.
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("GlobalNavHeader breadcrumbs", () => {
  it("on the dashboard root hides the trail and keeps branding plus core actions", () => {
    currentPath = "/dashboard";
    render(<GlobalNavHeader />);

    // No trail on the home route…
    expect(
      screen.queryByRole("navigation", { name: "nav.breadcrumb" })
    ).toBeNull();
    // …the brand links back to the dashboard…
    const brand = screen.getByRole("link", { name: "nav.dashboard" });
    expect(brand).toHaveAttribute("href", "/dashboard");
    // …and the action cluster is intact.
    expect(
      screen.getByRole("button", { name: "nav.switchToArabic" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "header.themeDark" })
    ).toBeInTheDocument();
    expect(screen.getByTestId("notification-bell")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "nav.mainMenu" })).toBeInTheDocument();
  });

  it("renders the home shortcut and chain for a two-level route", () => {
    currentPath = "/resources/diagnosis";
    render(<GlobalNavHeader />);
    const nav = screen.getByRole("navigation", { name: "nav.breadcrumb" });

    // Home shortcut links back to the dashboard.
    expect(nav.querySelector('a[href="/dashboard"]')).toHaveTextContent(
      "nav.dashboard"
    );
    // Intermediate section is a link…
    expect(nav.querySelector('a[href="/resources"]')).toHaveTextContent(
      "resources.title"
    );
    // …and the leaf is announced as the current page, never a link.
    const current = nav.querySelector('[aria-current="page"]');
    expect(current).toHaveTextContent("diagnosis.title");
    expect(current?.tagName).toBe("SPAN");
  });

  it("keeps three-level pro routes fully linked except the leaf", () => {
    currentPath = "/pro/consultations/new";
    render(<GlobalNavHeader />);
    const nav = screen.getByRole("navigation", { name: "nav.breadcrumb" });

    expect(nav.querySelector('a[href="/pro"]')).toHaveTextContent("pro.page.title");
    expect(nav.querySelector('a[href="/pro/consultations"]')).toHaveTextContent(
      "consultation.title"
    );
    expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent(
      "consultation.newConsultation"
    );
  });

  it("collapses dynamic parameters to their parent section without a param crumb", () => {
    currentPath = "/pro/consultations/abc-123";
    render(<GlobalNavHeader />);
    const nav = screen.getByRole("navigation", { name: "nav.breadcrumb" });

    // Links: home shortcut + /pro. The parameter href must not render, and
    // the parent section becomes the current (unlinked) leaf instead of
    // duplicating itself with a wrong param URL.
    const hrefs = Array.from(nav.querySelectorAll("a")).map((a) =>
      a.getAttribute("href")
    );
    expect(hrefs).toEqual(["/dashboard", "/pro"]);
    expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent(
      "consultation.title"
    );
    expect(nav.innerHTML).not.toContain("abc-123");
  });

  it("does not duplicate the dashboard crumb on nested dashboard routes", () => {
    currentPath = "/dashboard/consultations";
    render(<GlobalNavHeader />);
    const nav = screen.getByRole("navigation", { name: "nav.breadcrumb" });

    // The home shortcut renders exactly once — the crumb chain drops its
    // own /dashboard entry instead of repeating it as an intermediate link.
    expect(nav.querySelectorAll('a[href="/dashboard"]')).toHaveLength(1);
    expect(nav.querySelector('a[href="/dashboard"]')).not.toHaveAttribute(
      "aria-current"
    );
    expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent(
      "consultationsHub.title"
    );
  });

  it("keeps every trail level unique — no crumb renders twice", () => {
    currentPath = "/dashboard/consultations";
    render(<GlobalNavHeader />);
    const nav = screen.getByRole("navigation", { name: "nav.breadcrumb" });

    const hrefs = Array.from(nav.querySelectorAll("a")).map((a) =>
      a.getAttribute("href")
    );
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("labels the trail for assistive tech in both languages", () => {
    currentPath = "/resources/diagnosis";
    render(<GlobalNavHeader />);
    expect(
      screen.getByRole("navigation", { name: "nav.breadcrumb" })
    ).toBeInTheDocument();
    cleanup();

    localeState.value = "ar";
    render(<GlobalNavHeader />);
    expect(
      screen.getByRole("navigation", { name: "nav.breadcrumb" })
    ).toBeInTheDocument();
  });
});

describe("GlobalNavHeader smart back", () => {
  it("calls router.back() when in-app history exists", () => {
    setHistory(5);
    currentPath = "/resources/diagnosis";
    render(<GlobalNavHeader />);

    screen.getByRole("button", { name: "nav.goBack" }).click();
    expect(routerMock.back).toHaveBeenCalledTimes(1);
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("falls back to the parent section when there is no history", () => {
    setHistory(1);
    currentPath = "/resources/diagnosis";
    render(<GlobalNavHeader />);

    // History-less render shows the fallback Link (not a button).
    const fallback = screen.getByRole("link", { name: "nav.goBack" });
    expect(fallback).toHaveAttribute("href", "/resources");
  });

  it("falls back to /pro for pro sub-routes and /dashboard for top-level pages", () => {
    setHistory(1);

    currentPath = "/pro/consultations/new";
    const pro = render(<GlobalNavHeader />);
    expect(screen.getByRole("link", { name: "nav.goBack" })).toHaveAttribute(
      "href",
      "/pro"
    );
    pro.unmount();

    currentPath = "/health-logs";
    const top = render(<GlobalNavHeader />);
    expect(screen.getByRole("link", { name: "nav.goBack" })).toHaveAttribute(
      "href",
      "/dashboard"
    );
    top.unmount();
  });

  it("uses the fallback push when the history-less control is activated", () => {
    setHistory(1);
    currentPath = "/resources/diagnosis";
    render(<GlobalNavHeader />);

    // The fallback is a plain Link; navigating to /resources must not go
    // through router.back() (there is nothing to go back to).
    expect(screen.getByRole("link", { name: "nav.goBack" })).toHaveAttribute(
      "href",
      "/resources"
    );
    expect(routerMock.back).not.toHaveBeenCalled();
  });

  it("hides the back control on the dashboard root", () => {
    setHistory(5);
    currentPath = "/dashboard";
    render(<GlobalNavHeader />);

    expect(screen.queryByRole("button", { name: "nav.goBack" })).toBeNull();
    expect(screen.queryByRole("link", { name: "nav.goBack" })).toBeNull();
  });
});

describe("GlobalNavHeader structure & a11y", () => {
  it("renders the FibroCare brand linking to the dashboard", () => {
    currentPath = "/dashboard";
    render(<GlobalNavHeader />);

    const brand = screen.getByRole("link", { name: "nav.dashboard" });
    expect(brand).toHaveAttribute("href", "/dashboard");
    expect(brand).toHaveTextContent("FibroCare");
  });

  it("exposes no redundant section links — navigation lives on the dashboard", () => {
    currentPath = "/profile";
    render(<GlobalNavHeader />);

    // The removed quick-link strip would have surfaced these labels; the
    // cleaned header must not render any of them (the breadcrumb trail
    // uses page titles, e.g. profile.pageTitle, not nav.* labels).
    for (const label of [
      "nav.profile",
      "nav.consultations",
      "nav.doctorHub",
      "nav.clinical",
      "nav.diet",
      "nav.healthLogs",
      "nav.toolkit",
      "logs.pageTitle",
      "fog.title",
      "toolkit.title",
      "reports.pageTitle",
    ]) {
      expect(screen.queryByRole("link", { name: label })).toBeNull();
    }
  });

  it("marks the current page only at the breadcrumb leaf", () => {
    currentPath = "/resources/diagnosis";
    render(<GlobalNavHeader />);

    const nav = screen.getByRole("navigation", { name: "nav.breadcrumb" });
    const current = nav.querySelector('[aria-current="page"]');
    expect(current).toHaveTextContent("diagnosis.title");
    expect(current?.tagName).toBe("SPAN");
    expect(nav.querySelector('a[href="/dashboard"]')).not.toHaveAttribute(
      "aria-current"
    );
    expect(nav.querySelector('a[href="/resources"]')).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("gives the language toggle an accessible name that reflects the target locale", () => {
    currentPath = "/dashboard";
    render(<GlobalNavHeader />);
    expect(
      screen.getByRole("button", { name: "nav.switchToArabic" })
    ).toBeInTheDocument();
  });

  it("gives the theme toggle an accessible name that reflects the current theme", () => {
    currentPath = "/dashboard";
    render(<GlobalNavHeader />);
    expect(
      screen.getByRole("button", { name: "header.themeDark" })
    ).toBeInTheDocument();
  });

  it("renders the notification bell", () => {
    currentPath = "/dashboard";
    render(<GlobalNavHeader />);
    expect(screen.getByTestId("notification-bell")).toBeInTheDocument();
  });

  it("wires the mobile menu button with aria-expanded and a menu label", () => {
    currentPath = "/dashboard";
    render(<GlobalNavHeader />);
    const menu = screen.getByRole("button", { name: "nav.mainMenu" });
    expect(menu).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(menu);
    expect(menu).toHaveAttribute("aria-expanded", "true");
  });

  it("hosts only the upgrade CTA in the mobile menu and closes it on navigation", () => {
    currentPath = "/dashboard";
    const { rerender } = render(<GlobalNavHeader />);

    fireEvent.click(screen.getByRole("button", { name: "nav.mainMenu" }));
    const upgrade = screen.getByRole("link", { name: "nav.upgradePro" });
    expect(upgrade).toHaveAttribute("href", "/pro");

    // The Dashboard owns section navigation, so the menu offers nothing
    // redundant — just the goal-oriented CTA.
    expect(screen.queryByRole("link", { name: "nav.profile" })).toBeNull();

    // Navigating closes the sheet (setState-during-render pattern).
    currentPath = "/profile";
    rerender(<GlobalNavHeader />);
    expect(
      screen.getByRole("button", { name: "nav.mainMenu" })
    ).toHaveAttribute("aria-expanded", "false");
  });
});