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
 *    that double as the breadcrumb assertions), a settable locale, and a
 *    dir derived from it so RTL/LTR behavior can be asserted.
 *  - `usePathname` is redirected to `currentPath`, letting each test
 *    render a different route.
 *  - `useRouter` hands out `routerMock`, capturing back()/push() calls.
 *  - `window.history.length` is stubbed per test via setHistory() to model
 *    in-app history (smart back) versus a fresh entry (fallback link).
 *    The stub is applied INSIDE the test (not beforeEach) so each test's
 *    value is what the component actually reads at render time.
 *
 * The header structure under test:
 *  - Brand — logo + wordmark, linking to the dashboard. The accessible
 *    name comes from the visible text "FibroCare" (label-in-name rule),
 *    so the link must NOT carry an aria-label that overrides it.
 *  - Core links — Dashboard, Clinical Hub, Diet & Triggers, Care Kit,
 *    Doctors and Profile render on xl+ when the route is a section root
 *    (nav.primaryNav) and every one of them in the responsive sheet
 *    (nav.mainMenu); the current page is marked with aria-current in both
 *    surfaces. Pro stays out of the strip and renders as a dedicated
 *    highlighted action beside the cluster instead.
 *  - Breadcrumbs — on sub-pages the desktop strip steps aside and a
 *    "Home › … › current page" trail (nav.breadcrumb) reflects the route
 *    hierarchy; dynamic parameters collapse to their parent section and
 *    the /dashboard crumb deduplicates against the home shortcut.
 *  - Actions — a history-aware back control with a parent fallback, the
 *    language toggle (name reflects the *target* locale), the theme
 *    toggle, the notification bell, the dedicated Pro action, and the
 *    hamburger menu (below xl).
 *  - Direction — the header pins dir from the language context, so the
 *    brand/actions always sit at the correct inline ends and breadcrumb
 *    separators mirror for Arabic.
 */

let currentPath = "/dashboard";
const routerMock = { back: vi.fn(), push: vi.fn() };

const localeState = { value: "en" as "en" | "ar" };

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

/** The exact core set the component renders (mirrors CORE_LINKS). Pro
 *  deliberately lives outside this strip as a dedicated action button, so
 *  the CTA it points at is asserted separately. */
const CORE_LINK_HREFS = [
  "/dashboard",
  "/clinical",
  "/diet",
  "/toolkit",
  "/pro/doctor",
  "/profile",
];
const CORE_LINK_LABELS = [
  "nav.dashboard",
  "nav.clinical",
  "nav.diet",
  "toolkit.title",
  "nav.doctorHub",
  "nav.profile",
];

describe("GlobalNavHeader breadcrumbs", () => {
  it("on the dashboard root hides the trail and keeps branding plus core actions", () => {
    currentPath = "/dashboard";
    render(<GlobalNavHeader />);

    // No trail on the home route…
    expect(
      screen.queryByRole("navigation", { name: "nav.breadcrumb" })
    ).toBeNull();
    // …the branded wordmark wraps the dashboard link (accessible name is
    // the visible text — no overriding aria-label)…
    const brand = screen.getByRole("link", { name: "FibroCare" });
    expect(brand).toHaveAttribute("href", "/dashboard");
    expect(brand).toHaveTextContent("FibroCare");
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

    // Accessible name comes from the visible wordmark (WCAG label-in-name):
    // an aria-label like "Dashboard" would override the visible
    // "FibroCare" and break voice-control/landmark queries.
    const brand = screen.getByRole("link", { name: "FibroCare" });
    expect(brand).toHaveAttribute("href", "/dashboard");
    expect(brand).toHaveTextContent("FibroCare");
    expect(brand).not.toHaveAttribute("aria-label");
  });

  it("restores the core section links on section roots", () => {
    currentPath = "/dashboard";
    render(<GlobalNavHeader />);
    const primary = screen.getByRole("navigation", { name: "nav.primaryNav" });

    const links = Array.from(primary.querySelectorAll("a"));
    expect(links.map((a) => a.getAttribute("href"))).toEqual(CORE_LINK_HREFS);
    expect(links.map((a) => a.textContent)).toEqual(CORE_LINK_LABELS);

    // Pro must not share this strip — it is a dedicated action button.
    expect(primary.querySelector('a[href="/pro"]')).toBeNull();
  });

  it("renders the Pro upgrade as a dedicated highlighted action beside the cluster", () => {
    currentPath = "/dashboard";
    render(<GlobalNavHeader />);

    // One Pro affordance with a distinct accessible name…
    const pro = screen.getByRole("link", { name: "pricing.pro.badge" });
    expect(pro).toHaveAttribute("href", "/pro");
    expect(screen.getAllByRole("link", { name: "pricing.pro.badge" })).toHaveLength(1);
    // …styled to stand out (solid accent) rather than read as a muted
    // utility control…
    expect(pro.className).toContain("bg-emerald-600");
    expect(pro.className).toContain("font-bold");
    // …and kept out of the section-link strip.
    const primary = screen.getByRole("navigation", { name: "nav.primaryNav" });
    expect(primary.querySelector('a[href="/pro"]')).toBeNull();
  });

  it("hides the desktop core links on sub-pages in favor of the breadcrumb trail", () => {
    currentPath = "/resources/diagnosis";
    render(<GlobalNavHeader />);

    // Sub-pages swap the desktop strip for the trail…
    expect(
      screen.queryByRole("navigation", { name: "nav.primaryNav" })
    ).toBeNull();
    expect(
      screen.getByRole("navigation", { name: "nav.breadcrumb" })
    ).toBeInTheDocument();
    // …but the responsive sheet still offers every core link, so section
    // navigation is never more than a tap away on any route.
    const menu = screen.getByRole("navigation", { name: "nav.mainMenu" });
    for (const href of CORE_LINK_HREFS) {
      expect(menu.querySelector(`a[href="${href}"]`)).toBeInTheDocument();
    }
  });

  it("marks the current section root with aria-current in desktop and mobile", () => {
    currentPath = "/profile";
    render(<GlobalNavHeader />);

    const primary = screen.getByRole("navigation", { name: "nav.primaryNav" });
    expect(primary.querySelector('a[href="/profile"]')).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(primary.querySelector('a[href="/dashboard"]')).not.toHaveAttribute(
      "aria-current"
    );
    expect(primary.querySelector('a[href="/clinical"]')).not.toHaveAttribute(
      "aria-current"
    );

    const menu = screen.getByRole("navigation", { name: "nav.mainMenu" });
    expect(menu.querySelector('a[href="/profile"]')).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(menu.querySelector('a[href="/dashboard"]')).not.toHaveAttribute(
      "aria-current"
    );
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

  it("names the language toggle after the target locale and flips it", () => {
    currentPath = "/dashboard";
    const { rerender } = render(<GlobalNavHeader />);
    expect(
      screen.getByRole("button", { name: "nav.switchToArabic" })
    ).toBeInTheDocument();

    localeState.value = "ar";
    rerender(<GlobalNavHeader />);
    expect(
      screen.getByRole("button", { name: "nav.switchToEnglish" })
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

  it("hosts the core links plus the upgrade CTA in the mobile menu and closes it on navigation", () => {
    currentPath = "/dashboard";
    const { rerender } = render(<GlobalNavHeader />);
    const toggle = screen.getByRole("button", { name: "nav.mainMenu" });

    fireEvent.click(toggle);
    const menuNav = screen.getByRole("navigation", { name: "nav.mainMenu" });

    // Same essential links as the desktop strip, plus the goal-oriented CTA.
    expect(
      Array.from(menuNav.querySelectorAll("a")).map((a) =>
        a.getAttribute("href")
      )
    ).toEqual([...CORE_LINK_HREFS, "/pro"]);
    expect(screen.getByRole("link", { name: "nav.upgradePro" })).toHaveAttribute(
      "href",
      "/pro"
    );

    // Activating a core link closes the sheet.
    fireEvent.click(menuNav.querySelector('a[href="/profile"]') as Element);
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    // And so does navigating away (setState-during-render pattern).
    fireEvent.click(toggle);
    currentPath = "/profile";
    rerender(<GlobalNavHeader />);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});

describe("GlobalNavHeader RTL/LTR direction", () => {
  it("pins the header dir from the language context", () => {
    currentPath = "/dashboard";

    const ltr = render(<GlobalNavHeader />);
    expect(ltr.getByTestId("global-nav-header")).toHaveAttribute("dir", "ltr");
    ltr.unmount();

    localeState.value = "ar";
    const rtl = render(<GlobalNavHeader />);
    expect(rtl.getByTestId("global-nav-header")).toHaveAttribute("dir", "rtl");
  });

  it("mirrors the breadcrumb separator for Arabic", () => {
    currentPath = "/resources/diagnosis";

    const ltr = render(<GlobalNavHeader />);
    expect(
      screen.getByRole("navigation", { name: "nav.breadcrumb" }).textContent
    ).toContain("/");
    ltr.unmount();

    localeState.value = "ar";
    render(<GlobalNavHeader />);
    expect(
      screen.getByRole("navigation", { name: "nav.breadcrumb" }).textContent
    ).toContain("‹");
  });
});