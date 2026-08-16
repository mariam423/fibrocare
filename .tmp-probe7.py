"""Reproduce audit dark-mode sequence: measure h1 on each page, log state."""
import json
import time

from playwright.sync_api import sync_playwright

MEASURE_JS = r"""
function __rgba(cssColor) {
  if (!cssColor) return [0, 0, 0, 0];
  var c = document.createElement('canvas'); c.width = 1; c.height = 1;
  var ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000';
  try { ctx.fillStyle = cssColor; } catch (e) { return [0, 0, 0, 1]; }
  ctx.fillRect(0, 0, 1, 1);
  var d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2], d[3] / 255];
}
function __composite(fg, bg) {
  var a = fg[3]; var ba = bg[3]; var outA = a + ba * (1 - a);
  if (outA < 0.00001) return [0, 0, 0, 0];
  return [(fg[0]*a + bg[0]*ba*(1-a)) / outA, (fg[1]*a + bg[1]*ba*(1-a)) / outA, (fg[2]*a + bg[2]*ba*(1-a)) / outA, outA];
}
function __effBg(el) {
  var acc = [0, 0, 0, 0]; var node = el;
  while (node && acc[3] < 0.999) { acc = __composite(__rgba(getComputedStyle(node).backgroundColor), acc); node = node.parentElement; }
  if (acc[3] < 0.999) acc = __composite(__rgba(getComputedStyle(document.body).backgroundColor), acc);
  return acc;
}
function __lum(c) { function f(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); } return 0.2126*f(c[0]) + 0.7152*f(c[1]) + 0.0722*f(c[2]); }
function __ratio(c1, c2) { var l1 = __lum(c1), l2 = __lum(c2); var hi = Math.max(l1,l2), lo = Math.min(l1,l2); return (hi+0.05)/(lo+0.05); }
function __measure(sel, pseudo) {
  var el = document.querySelector(sel);
  if (!el) return null;
  var cs = getComputedStyle(el, pseudo || undefined);
  var fg = __rgba(cs.color); var bg = __effBg(el);
  return { fg: fg, bg: bg, ratio: __ratio(fg, bg), colorStr: cs.color };
}
"""


def state(page, label):
    info = page.evaluate(
        """() => ({
            dark: document.documentElement.classList.contains('dark'),
            bodyBg: getComputedStyle(document.body).backgroundColor,
            h1: (document.querySelector('h1')?.textContent || '').trim().slice(0, 40),
            h1Cls: document.querySelector('h1')?.className || null,
        })"""
    )
    meas = page.evaluate("__measure('h1', null)") if page.evaluate("() => !!document.querySelector('h1')") else None
    print(f"{label}: dark={info['dark']} bodyBg={info['bodyBg']} h1={info['h1']!r} cls={info['h1Cls']}")
    print(f"   h1 fg={meas['fg'] if meas else None} bg={meas['bg'] if meas else None} ratio={meas['ratio'] if meas else None} colorStr={meas['colorStr'] if meas else None}")


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    context.add_init_script("localStorage.setItem('fibrocare:dark', JSON.stringify(true));")
    page = context.new_page()
    page.add_script_tag(content=MEASURE_JS)

    # Public pages in audit order
    for path in ["/login", "/forgot-password", "/resources"]:
        page.goto(f"http://localhost:3000{path}", wait_until="domcontentloaded", timeout=60000)
        page.wait_for_selector(".ambient", timeout=15000)
        page.wait_for_timeout(900)
        page.add_script_tag(content=MEASURE_JS)
        state(page, path)

    # Auth flow
    page.goto("http://localhost:3000/login", wait_until="domcontentloaded", timeout=60000)
    page.wait_for_selector("#email", timeout=15000)
    page.locator("#email").fill("a11y.audit@fibrocare.local")
    page.locator("#password").fill("FibroCareAudit2026!")
    page.get_by_role("button", name="Sign in").click()
    deadline = time.time() + 15
    while time.time() < deadline and page.url.rstrip("/") != "http://localhost:3000":
        page.wait_for_timeout(250)
    print("after login url:", page.url)

    # Auth pages
    for path in ["/", "/health-logs", "/profile"]:
        page.goto(f"http://localhost:3000{path}", wait_until="domcontentloaded", timeout=60000)
        page.wait_for_selector(".ambient", timeout=15000)
        page.wait_for_timeout(900)
        page.add_script_tag(content=MEASURE_JS)
        state(page, f"AUTH {path}")

    context.close()
    browser.close()
