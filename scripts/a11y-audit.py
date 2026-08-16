#!/usr/bin/env python3
"""Runtime accessibility audit for FibroCare's glass / 2.5D visual system.

Emulates `prefers-reduced-transparency: reduce` and `prefers-contrast:
more` via Chrome DevTools Protocol (Playwright's emulate_media cannot
express reduced-transparency) and verifies, across the public pages that
exercise the design system (/login, /forgot-password, /resources) and
four modes (light, dark, reduced-transparency + high-contrast x light /
dark):

  1. The .ambient gradient wash is removed (background-image: none).
  2. Glass surfaces become opaque and drop backdrop-filter — the semantic
     classes (.glass-surface / .surface-crisp / .icon-badge) and the raw
     Tailwind backdrop-blur-* utilities all flatten to opaque fills
     (pages with no glass surface at all, like /zen, are noted rather
     than failed).
  3. WCAG AA contrast (>= 4.5:1) for body text, muted text, headings,
     primary links, and form fields / placeholders.
  4. Zero console errors.

Page-specific extras:
  - /zen: the .zen-backdrop gradient renders, the breathing bubble keeps
    its backdrop blur, and the zen text meets AA against the dark base.
  - /resources: the tips dialog is opened and checked — it must stay
    position:fixed (a cascade regression guard), keep its glass treatment
    (opaque + no blur under reduced transparency), and hit AA contrast.

Notes:
  - Runs against a dev server by default. React prints hydration
    mismatches as console.error only in dev, so a dev-only mismatch can
    fail the zero-console-error check that a production build would pass.
    If that happens, verify against a production build (next build + next
    start) before treating it as a regression.
  - Requires Playwright Python + the Chromium browser (see the error
    message printed when it is missing).
  - Transitions and animations are disabled per page before measuring:
    the app animates color/background over 500ms when .dark is toggled,
    and measuring mid-transition reports the starting (light-theme)
    values as false ~1.3:1 contrast failures. Dark modes also wait for
    the `.dark` class to actually land on <html> before measuring.
  - Auth (--full) waits for form hydration and retries: clicking a
    submit button before React attaches its handler triggers a native
    GET submission that would otherwise leak the credentials into the
    URL and false-fail the run.

With --full, the audit additionally signs in a throwaway account and
checks the authenticated surfaces that exercise the same design system:
  /dashboard, /health-logs, /profile, /zen.

The script reuses a dev server already running on the target port, or
starts one itself and shuts it down afterwards.

Usage:
  python scripts/a11y-audit.py                 # public pages only
  python scripts/a11y-audit.py --full          # + authenticated pages
  python scripts/a11y-audit.py --port 3100
  AUDIT_PORT=3100 python scripts/a11y-audit.py --full

Exit code 0 = pass, 1 = any check failed.
"""
import argparse
import json
import os
import signal
import subprocess
import sys
import tempfile
import time
import urllib.request

# Non-UTF-8 Windows consoles (e.g. cp1256) cannot encode the Unicode glyphs
# used in the report (\u2192, \u00b7, \u2014) and would crash mid-run when
# the script starts its own server. Replacing unencodable chars keeps the
# audit alive and readable on any locale.
try:
    sys.stdout.reconfigure(errors="replace")
    sys.stderr.reconfigure(errors="replace")
except Exception:
    pass

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print(
        "Playwright (Python) is required for the runtime a11y audit.\n"
        "Install it with:\n"
        "  pip install playwright\n"
        "  python -m playwright install chromium\n"
        "or run the dependency-free static guard instead:\n"
        "  npm run check:a11y:css"
    )
    sys.exit(2)

PAGES = ["/login", "/forgot-password", "/resources"]
# The dashboard lived at "/" before the route rename; it now lives at
# "/dashboard" (the landing page took over "/").
AUTH_PAGES = ["/dashboard", "/health-logs", "/profile", "/zen"]

# Pages that intentionally have no glass surface at all (the zen portal
# uses its own custom glass on the breathing bubble).
PAGES_WITHOUT_GLASS = {"/zen"}

# Surface-language selector for the reduced-transparency glass check. The
# crisp identity renders glass three ways: the semantic classes
# (.glass-surface, .surface-crisp, .icon-badge) and raw Tailwind
# backdrop-blur-* utilities. globals.css flattens every one of these to
# opaque var(--card) with backdrop-filter: none under reduced
# transparency, so whichever element matches first must measure
# opaque + blurless.
SURFACE_SELECTOR = '.glass-surface, .surface-crisp, .icon-badge, [class*="backdrop-blur"]'

# Throwaway account used by --full. Created on first run, reused after;
# sign-up is attempted first, sign-in is the fallback for later runs.
AUDIT_EMAIL = "a11y.audit@fibrocare.local"
AUDIT_PASSWORD = "FibroCareAudit2026!"

# (label, selector, pseudo, min ratio)
CONTRAST_CHECKS = [
    ("body", "body", None, 4.5),
    ("muted", ".text-muted-foreground", None, 4.5),
    ("heading", "h1", None, 4.5),
    ("card-title", "[data-slot=card-title]", None, 4.5),
    ("primary-link", 'a[href="/forgot-password"], a[href="/signup"], a[href="/login"]', None, 4.5),
    ("input-text", "#email", None, 4.5),
    ("input-placeholder", "#email", "::placeholder", 4.5),
]

# Injected once per page. Uses a canvas to normalise any CSS color
# (oklab/lab/color(srgb)/hex/rgb) to sRGB, then walks ancestors to
# composite the effective background before computing the WCAG ratio.
MEASURE_JS = r"""
function __rgba(cssColor) {
  // Rasterise the color through a 1x1 canvas: whatever the source syntax
  // (rgb, lab, oklab, oklch, color(srgb), ...) the backing store is sRGB,
  // so getImageData always yields the same values the user actually sees.
  if (!cssColor) return [0, 0, 0, 0];
  var c = document.createElement('canvas');
  c.width = 1;
  c.height = 1;
  var ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = '#000';
  try {
    ctx.fillStyle = cssColor;
  } catch (e) {
    return [0, 0, 0, 1];
  }
  ctx.fillRect(0, 0, 1, 1);
  var d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2], d[3] / 255];
}
function __composite(fg, bg) {
  // Source-over compositing that preserves the output alpha, so
  // transparent layers stay transparent and semi-transparent layers
  // keep blending up the ancestor chain instead of stopping early.
  var a = fg[3];
  var ba = bg[3];
  var outA = a + ba * (1 - a);
  if (outA < 0.00001) return [0, 0, 0, 0];
  return [
    (fg[0] * a + bg[0] * ba * (1 - a)) / outA,
    (fg[1] * a + bg[1] * ba * (1 - a)) / outA,
    (fg[2] * a + bg[2] * ba * (1 - a)) / outA,
    outA,
  ];
}
function __effBg(el) {
  var acc = [0, 0, 0, 0];
  var node = el;
  while (node && acc[3] < 0.999) {
    acc = __composite(__rgba(getComputedStyle(node).backgroundColor), acc);
    node = node.parentElement;
  }
  if (acc[3] < 0.999) {
    acc = __composite(__rgba(getComputedStyle(document.body).backgroundColor), acc);
  }
  return acc;
}
function __lum(c) {
  function f(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
}
function __ratio(c1, c2) {
  var l1 = __lum(c1), l2 = __lum(c2);
  var hi = Math.max(l1, l2), lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}
function __measure(sel, pseudo) {
  var el = document.querySelector(sel);
  if (!el) return null;
  var cs = getComputedStyle(el, pseudo || undefined);
  var fg = __rgba(cs.color);
  var bg = __effBg(el);
  return Math.round(__ratio(fg, bg) * 100) / 100;
}
"""


def wait_for_server(port, timeout):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(f"http://localhost:{port}/", timeout=3) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            pass
        time.sleep(1)
    return False


def ensure_server(port):
    if wait_for_server(port, timeout=8):
        print(f"  reusing dev server on :{port}")
        return None
    print(f"  starting dev server on :{port} ...")
    logfile = os.path.join(tempfile.gettempdir(), "fibrocare-a11y-dev.log")
    with open(logfile, "wb") as log:
        proc = subprocess.Popen(
            ["npm", "run", "dev", "--", "-p", str(port)],
            stdout=log,
            stderr=subprocess.STDOUT,
            shell=(os.name == "nt"),
        )
    if not wait_for_server(port, timeout=150):
        proc.kill()
        try:
            with open(logfile, "r", errors="replace") as log:
                tail = "".join(log.readlines()[-25:])
        except Exception:
            tail = "(no log captured)"
        raise SystemExit(
            f"dev server on :{port} did not become ready.\nLast server log:\n{tail}"
        )
    print(f"  (logs → {logfile})")
    return proc


def stop_server(proc):
    if not proc:
        return
    try:
        if os.name == "nt":
            subprocess.run(["taskkill", "/T", "/F", "/PID", str(proc.pid)], capture_output=True)
        else:
            os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
    except Exception:
        proc.kill()


def set_media_features(cdp, reduced_transparency):
    features = []
    if reduced_transparency:
        features = [
            {"name": "prefers-reduced-transparency", "value": "reduce"},
            {"name": "prefers-contrast", "value": "more"},
        ]
    cdp.send("Emulation.setEmulatedMedia", {"features": features})


def _fill_and_submit(page, base, path, fields, button_name):
    """Navigate to an auth form, fill it, and click submit.

    Waits briefly after the fields appear so React has time to hydrate:
    if the button is clicked before the onSubmit handler is attached, the
    browser performs a *native GET* submission and the credentials end up
    as query parameters in the URL.

    Returns "render-fail" (the page never rendered) or "submitted" (a
    click happened). The caller detects a native GET submission afterwards
    by checking page.url for the leaked credential params.
    """
    page.goto(f"{base}{path}", wait_until="domcontentloaded", timeout=60000)
    try:
        page.wait_for_selector(fields[0][0], timeout=15000)
    except Exception:
        return "render-fail"
    page.wait_for_timeout(1200)  # let React hydrate before clicking
    for sel, value in fields:
        page.locator(sel).fill(value)
    page.get_by_role("button", name=button_name).click()
    return "submitted"


def ensure_authenticated(page, base, mode, results):
    """Create (or reuse) the throwaway audit account and land on '/.

    Retries guard against a cold dev-server compile: on the first visit a
    page can still be hydrating, and clicking submit then performs a
    native GET form submission (credentials in the URL) instead of
    NextAuth's client-side POST. That state is detected and retried.
    """
    ctx = f"{mode} auth"

    # 1) Try sign-up — creates the account on first run. A transient
    #    render failure (cold dev compile) must NOT abort the flow: fall
    #    through to sign-in, which would still work for an existing account.
    state = _fill_and_submit(
        page, base, "/signup",
        [("#name", "A11y Audit"), ("#email", AUDIT_EMAIL),
         ("#password", AUDIT_PASSWORD), ("#confirm-password", AUDIT_PASSWORD)],
        "Create account",
    )
    if state == "render-fail":
        results.append({"page": ctx, "check": "signup form", "ok": False, "detail": "signup page did not render — trying sign-in"})
    else:
        deadline = time.time() + 12
        while time.time() < deadline:
            if _is_authed(page.url, base):
                results.append({"page": ctx, "check": "authenticated", "ok": True, "detail": "fresh account created"})
                return True
            if page.locator("#signup-error").count() and page.locator("#signup-error").is_visible():
                break  # account already exists — fall through to sign-in
            if "?name=" in page.url or "?email=" in page.url:
                break  # native GET submission — fall through to sign-in
            page.wait_for_timeout(250)

    # 2) Fall back to sign-in with the fixed credentials (later runs).
    #    "?email=" in the URL is the heuristic for a native GET submission
    #    (the form wasn't hydrated, so credentials leaked into the URL) —
    #    this app never redirects with an ?email= param otherwise.
    for attempt in range(3):
        state = _fill_and_submit(
            page, base, "/login",
            [("#email", AUDIT_EMAIL), ("#password", AUDIT_PASSWORD)],
            "Sign in",
        )
        if state == "render-fail":
            continue  # transient (cold compile) — retry with a fresh load
        deadline = time.time() + 12
        while time.time() < deadline:
            url = page.url
            if _is_authed(url, base):
                results.append({"page": ctx, "check": "authenticated", "ok": True, "detail": "signed in as existing audit account"})
                return True
            if "?email=" in url:
                break  # native GET — form wasn't hydrated; retry clean
            if page.locator("#login-error").count() and page.locator("#login-error").is_visible():
                # Credentials were rejected; the fixed password won't fix
                # itself, so stop retrying instead of burning 3 x 12s.
                results.append({"page": ctx, "check": "authenticated", "ok": False, "detail": "sign-in rejected the audit credentials"})
                return False
            page.wait_for_timeout(250)

    results.append({"page": ctx, "check": "authenticated", "ok": False, "detail": "could not sign in as audit account"})
    return False


def _is_authed(url, base):
    """True once a session is established: the app root (sign-in lands on
    "/" via the default callbackUrl) or the dashboard (the sign-up and
    post-login redirect target since the route rename)."""
    path = url.rstrip("/")
    return path == base or path == f"{base}/dashboard"


def _audit_dashboard(page, ctx, results):
    """Contrast checks for the Gentle Support emerald controls (dashboard).

    The Gratitude Journal card ships a solid emerald "Save Journal Entry"
    button and an emerald-tinted textarea (with its own placeholder). Both
    must meet WCAG AA (>= 4.5:1) in light and dark themes. The button is
    targeted via the stable data-a11y attribute (a Playwright-only
    :has-text() pseudo would crash document.querySelector).

    The button starts disabled (the textarea is empty), and disabled
    controls are exempt from WCAG 1.4.3 — so the textarea + placeholder
    are measured first in their resting state, then a real entry is typed
    and the now-enabled button is measured.
    """
    # 1) Textarea + placeholder in the resting (empty) state.
    for label, selector, pseudo in (
        ("gratitude-text", "#gratitude-input", None),
        ("gratitude-placeholder", "#gratitude-input", "::placeholder"),
    ):
        ratio = page.evaluate(f"__measure({json.dumps(selector)}, {json.dumps(pseudo)})")
        if ratio is None:
            results.append(
                {"page": ctx, "check": f"contrast:{label}", "ok": False, "detail": "element not found on dashboard"}
            )
            continue
        results.append(
            {"page": ctx, "check": f"contrast:{label}", "ok": ratio >= 4.5, "detail": f"ratio={ratio:.2f} (min 4.5)"}
        )

    # 2) Enable the Save button by typing a real entry, then measure it.
    try:
        page.locator("#gratitude-input").fill("Grateful for a quiet morning")
    except Exception as exc:
        results.append({"page": ctx, "check": "contrast:save-button", "ok": False, "detail": f"could not fill textarea: {exc}"})
        return
    page.wait_for_timeout(200)
    ratio = page.evaluate(f"__measure({json.dumps('[data-a11y=\'gratitude-save\']')}, null)")
    if ratio is None:
        results.append(
            {"page": ctx, "check": "contrast:save-button", "ok": False, "detail": "element not found on dashboard"}
        )
        return
    results.append(
        {"page": ctx, "check": "contrast:save-button", "ok": ratio >= 4.5, "detail": f"ratio={ratio:.2f} (min 4.5)"}
    )


def _audit_zen(page, ctx, rt, results):
    """Zen-portal-specific checks. The bubble-blur assertion only applies
    in normal modes: under reduced transparency the global backdrop-blur
    guard flattens the bubble to an opaque fill (like every glass
    surface), so expecting blur there would be wrong."""
    # The backdrop gradient must actually render — regression guard for the
    # Tailwind arbitrary-value parser bug that once dropped it silently.
    zen_bg = page.evaluate(
        "() => { const el = document.querySelector('.zen-backdrop'); return el ? getComputedStyle(el).backgroundImage : null; }"
    )
    results.append(
        {"page": ctx, "check": "zen backdrop gradient", "ok": zen_bg not in (None, "none"), "detail": f"background-image={zen_bg!r}"}
    )
    # The breathing bubble uses its own custom glass (backdrop blur + a
    # translucent white fill) instead of a semantic glass class.
    if not rt:
        blur = page.evaluate(
            "() => { const el = document.querySelector('[class*=\"backdrop-blur\"]'); return el ? getComputedStyle(el).backdropFilter : null; }"
        )
        results.append(
            {"page": ctx, "check": "zen bubble glass blur", "ok": bool(blur) and blur != "none", "detail": f"backdrop-filter={blur!r}"}
        )
    # The zen surface keeps its own dark backdrop in both themes; its text
    # must stay readable against the #0f172a base.
    ratio = page.evaluate("__measure('.zen-backdrop', null)")
    if ratio is not None:
        results.append(
            {"page": ctx, "check": "contrast:zen-text", "ok": ratio >= 4.5, "detail": f"ratio={ratio:.2f} (min 4.5)"}
        )


def _audit_resources_dialog(page, ctx, rt, results):
    """Open the first resource tips dialog and verify it renders correctly.

    Regression guard for the cascade bug where an unlayered `position:
    relative` in .card-depth once overrode the dialog's `fixed` positioning
    (the dialog is .glass-surface + .card-depth + fixed). Also verifies the
    glass treatment survives reduced-transparency, and that the dialog text
    meets WCAG AA.
    """
    ctx = f"{ctx} dialog"
    # Generous timeouts: on a cold dev-server compile this machine can
    # take 15s+ for the tips list to hydrate, and a short deadline would
    # false-fail a healthy page. One retry guards the first cold compile
    # of the route after a server restart.
    opened = False
    last_exc = None
    for attempt in range(2):
        try:
            page.get_by_role("button", name="Read More").first.click(timeout=20000)
            page.wait_for_selector('[data-slot="dialog-content"]', timeout=20000)
            opened = True
            break
        except Exception as exc:
            last_exc = exc
            page.wait_for_timeout(500)
    if not opened:
        results.append({"page": ctx, "check": "dialog opened", "ok": False, "detail": f"could not open: {last_exc}"})
        return

    pos = page.evaluate("() => getComputedStyle(document.querySelector('[data-slot=\"dialog-content\"]')).position")
    results.append({"page": ctx, "check": "dialog position fixed", "ok": pos == "fixed", "detail": f"position={pos!r}"})

    dlg = page.evaluate(
        """() => {
            const el = document.querySelector('[data-slot="dialog-content"]');
            if (!el) return null;
            const s = getComputedStyle(el);
            return { blur: s.backdropFilter, bg: s.backgroundColor };
        }"""
    )
    if dlg is None:
        results.append({"page": ctx, "check": "dialog glass", "ok": False, "detail": "dialog-content not found"})
    else:
        alpha = page.evaluate(f"__rgba({json.dumps(dlg['bg'])})[3]")
        ok = dlg["blur"] in ("none", "") and alpha >= 0.999 if rt else dlg["blur"] not in ("none", "")
        results.append({"page": ctx, "check": "dialog glass", "ok": ok, "detail": f"blur={dlg['blur']!r} alpha={alpha:.3f}"})

    for label, selector in (
        ("title", '[data-slot="dialog-title"]'),
        ("description", '[data-slot="dialog-description"]'),
        ("tips", '[data-slot="dialog-content"] span'),
    ):
        ratio = page.evaluate(f"__measure({json.dumps(selector)}, null)")
        if ratio is None:
            continue
        results.append(
            {"page": ctx, "check": f"contrast:{label}", "ok": ratio >= 4.5, "detail": f"ratio={ratio:.2f} (min 4.5)"}
        )

    try:
        page.keyboard.press("Escape")
        page.wait_for_selector('[data-slot="dialog-content"]', state="hidden", timeout=3000)
    except Exception:
        pass  # non-critical: the next navigation clears any leftover state


def audit_page(page, base, path, rt, dark, mode, results):
    ctx = f"{mode} {path}"

    # Navigate and wait for the app shell. If the dev server was mid
    # recompile the first response can be an error page — retry with a
    # reload so the audit never crashes (or false-fails) on a transient.
    for _ in range(3):
        try:
            page.goto(f"{base}{path}", wait_until="domcontentloaded", timeout=60000)
            page.wait_for_selector(".ambient", timeout=15000)
            break
        except Exception:
            page.wait_for_timeout(1500)
    else:
        results.append(
            {"page": ctx, "check": "app shell rendered", "ok": False, "detail": ".ambient never appeared after retries"}
        )
        return
    # Kill all transitions/animations. The app animates color and
    # background-color over 500ms when .dark is toggled; measuring
    # mid-transition yields the *starting* (light-theme) values and false
    # ~1.3:1 contrast failures — exactly the anomaly this audit reported
    # originally. With transitions disabled, computed styles jump straight
    # to their final values, so measurements are deterministic.
    page.add_style_tag(content="* { transition: none !important; animation: none !important; }")
    page.wait_for_timeout(900)

    # The `.dark` class is applied client-side by ThemeManager after
    # hydration. On a heavy page (or a cold dev compile) that can take
    # longer than the settle above — wait for it so we never measure the
    # dark mode while the light theme is still on screen.
    if dark:
        try:
            page.wait_for_function(
                "() => document.documentElement.classList.contains('dark')",
                timeout=10000,
            )
            # One tick for the browser to recompute styles after the class
            # flip (transitions are disabled, so this settles immediately).
            page.wait_for_timeout(150)
        except Exception:
            results.append(
                {"page": ctx, "check": "dark theme applied", "ok": False, "detail": ".dark never landed on <html> — measurements below are not dark-mode"}
            )

    # Each navigation replaces the document, so re-install the contrast
    # helpers after every goto.
    page.add_script_tag(content=MEASURE_JS)

    # Preflight: confirm the reduced-transparency emulation actually took
    # effect. Chromium < 118 silently ignores the CDP feature — in that case
    # skip the rt-specific checks (with a note) instead of false-failing.
    if rt:
        rt_supported = page.evaluate(
            "() => matchMedia('(prefers-reduced-transparency: reduce)').matches"
        )
        if not rt_supported:
            results.append(
                {
                    "page": ctx,
                    "check": "prefers-reduced-transparency emulation",
                    "ok": True,
                    "detail": "unsupported in this Chromium (<118); rt checks skipped",
                }
            )
            return

    # 1. Ambient wash must be removed under reduced transparency / high contrast.
    #    Query is null-safe: during a client-side navigation (e.g. an auth-gate
    #    redirect) React can briefly unmount the tree, leaving no .ambient —
    #    getComputedStyle(null) would throw and kill the whole run.
    ambient_img = None
    for _ in range(3):
        ambient_img = page.evaluate(
            "() => { const el = document.querySelector('.ambient'); return el ? getComputedStyle(el).backgroundImage : null; }"
        )
        if ambient_img is not None:
            break
        try:
            page.wait_for_selector(".ambient", timeout=3000)
        except Exception:
            break
    if rt:
        results.append(
            {
                "page": ctx,
                "check": "ambient removed (reduced transparency)",
                "ok": ambient_img == "none",
                "detail": f"background-image={ambient_img!r}",
            }
        )

    # 2. Glass surfaces must be opaque + drop backdrop-filter. The query
    #    is retried like the .ambient one: during a client-side navigation
    #    React can briefly unmount the tree, and querying in that window
    #    would false-fail "no glass surface on page".
    if rt:
        glass = None
        for _ in range(3):
            glass = page.evaluate(
                f"() => {{ const el = document.querySelector({json.dumps(SURFACE_SELECTOR)}); if (!el) return null; const s = getComputedStyle(el); return {{ blur: s.backdropFilter, bg: s.backgroundColor }}; }}"
            )
            if glass is not None:
                break
            try:
                page.wait_for_selector(SURFACE_SELECTOR, timeout=3000)
            except Exception:
                break
        if glass is None:
            if path in PAGES_WITHOUT_GLASS:
                results.append({"page": ctx, "check": "glass surface (n/a on this page)", "ok": True, "detail": "page intentionally has no glass surface"})
            else:
                results.append({"page": ctx, "check": "glass surface found", "ok": False, "detail": "no glass surface on page"})
        else:
            alpha = page.evaluate(f"__rgba({json.dumps(glass['bg'])})[3]")
            ok = glass["blur"] in ("none", "") and alpha >= 0.999
            results.append(
                {
                    "page": ctx,
                    "check": "glass surface opaque + no blur",
                    "ok": ok,
                    "detail": f"blur={glass['blur']!r} alpha={alpha:.3f}",
                }
            )

    # 3. WCAG AA contrast on key text pairs
    for label, selector, pseudo, threshold in CONTRAST_CHECKS:
        ratio = page.evaluate(f"__measure({json.dumps(selector)}, {json.dumps(pseudo)})")
        if ratio is None:
            continue  # selector not present on this page — not an error
        results.append(
            {
                "page": ctx,
                "check": f"contrast:{label}",
                "ok": ratio >= threshold,
                "detail": f"ratio={ratio:.2f} (min {threshold})",
            }
        )

    # 4. Page-specific checks
    if path in ("/", "/dashboard"):
        _audit_dashboard(page, ctx, results)
    if path == "/zen":
        _audit_zen(page, ctx, rt, results)
    if path == "/resources":
        _audit_resources_dialog(page, ctx, rt, results)


def _is_transient_network(msg):
    """True for Chromium's rapid-navigation IO-suspension artifacts.

    Under Playwright, rapid page.goto() calls can suspend the outgoing
    renderer's network IO (ERR_NETWORK_IO_SUSPENDED), which cascades into
    "Failed to fetch" for the page's own data requests and NextAuth's
    session fetch. These are browser/navigation artifacts — the page would
    load fine on its own — not app defects, so they trigger a page retry
    instead of a hard failure.
    """
    return any(m in msg for m in ("ERR_NETWORK_IO_SUSPENDED", "Failed to fetch", "CLIENT_FETCH_ERROR"))


def audit_page_with_retry(page, base, path, rt, dark, mode, results, errors):
    """Audit one page; retry once if the only console errors were transient.

    The zero-console-error gate stays strict: a retry only happens when
    *every* captured error is transient network noise, and if the retry
    reproduces them they are still reported as failures.
    """
    for attempt in (1, 2):
        start = len(results)
        errors.clear()
        crashed = None
        try:
            audit_page(page, base, path, rt, dark, mode, results)
        except Exception as exc:
            # A transient DOM/navigation race must never kill the whole run.
            del results[start:]
            crashed = exc
        if crashed is not None:
            if attempt == 2:
                results.append(
                    {"page": f"{mode} {path}", "check": "audit crashed", "ok": False, "detail": str(crashed)[:200]}
                )
                return
            page.wait_for_timeout(600)
            continue
        for err in errors:
            results.append({"page": f"{mode} {path}", "check": "console", "ok": False, "detail": err})
        if not errors or attempt == 2:
            return
        if not all(_is_transient_network(e) for e in errors):
            return  # real console errors — keep them
        # Transient network noise only: discard this attempt and retry the
        # page from a clean slate.
        del results[start:]
        page.wait_for_timeout(600)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--port", type=int, default=int(os.environ.get("AUDIT_PORT", "3000")))
    parser.add_argument(
        "--full",
        action="store_true",
        help="also audit authenticated pages (/dashboard, /health-logs, /profile) with a throwaway account",
    )
    args = parser.parse_args()

    base = f"http://localhost:{args.port}"
    proc = ensure_server(args.port)

    modes = [
        ("light", False, False),
        ("dark", False, True),
        ("rt-light", True, False),
        ("rt-dark", True, True),
    ]

    results = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            for mode, rt, dark in modes:
                print(f"  mode: {mode}")
                context = browser.new_context(viewport={"width": 1440, "height": 900})
                if dark:
                    context.add_init_script(
                        "localStorage.setItem('fibrocare:dark', JSON.stringify(true));"
                    )
                page = context.new_page()
                errors = []
                page.on(
                    "console",
                    lambda msg: errors.append(f"[console.{msg.type}] {msg.text}")
                    if msg.type == "error"
                    else None,
                )
                page.on("pageerror", lambda exc: errors.append(f"[pageerror] {exc}"))
                cdp = context.new_cdp_session(page)
                set_media_features(cdp, rt)

                for path in PAGES:
                    audit_page_with_retry(page, base, path, rt, dark, mode, results, errors)

                if args.full:
                    if ensure_authenticated(page, base, mode, results):
                        for path in AUTH_PAGES:
                            audit_page_with_retry(page, base, path, rt, dark, mode, results, errors)
                context.close()
            browser.close()
    finally:
        stop_server(proc)

    failed = [r for r in results if not r["ok"]]
    print(f"\n{'=' * 60}\nA11y runtime audit: {len(results)} checks, {len(failed)} failed\n{'=' * 60}")
    for r in results:
        mark = "PASS" if r["ok"] else "FAIL"
        print(f"  [{mark}] {r['page']} · {r['check']} — {r['detail']}")

    if failed:
        print("\nOne or more accessibility checks failed.")
        sys.exit(1)
    print("\nAll accessibility checks passed.")


if __name__ == "__main__":
    main()
