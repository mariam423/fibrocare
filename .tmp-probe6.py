"""Debug dark home h1 + rt-dark login placeholder measurements."""
import json

from playwright.sync_api import sync_playwright

MEASURE_JS = r"""
function __rgba(cssColor) {
  if (!cssColor) return [0, 0, 0, 0];
  var c = document.createElement('canvas');
  c.width = 1; c.height = 1;
  var ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = '#000';
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
"""


def measure(page, sel, pseudo):
    return page.evaluate(
        f"""() => {{
            const el = document.querySelector({json.dumps(sel)});
            if (!el) return null;
            const cs = getComputedStyle(el, {json.dumps(pseudo)} || undefined);
            const fg = __rgba(cs.color);
            const bg = __effBg(el);
            return {{ tag: el.tagName, cls: (el.className||'').toString().slice(0,50),
                      colorStr: cs.color, fg, bg, ratio: __ratio(fg, bg) }};
        }}"""
    )


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # --- dark home heading ---
    ctx = browser.new_context()
    ctx.add_init_script("localStorage.setItem('fibrocare:dark', JSON.stringify(true));")
    page = ctx.new_page()
    page.goto("http://localhost:3000/login", wait_until="domcontentloaded", timeout=60000)
    page.wait_for_selector(".ambient", timeout=15000)
    page.wait_for_timeout(500)
    page.locator("#email").fill("a11y.audit@fibrocare.local")
    page.locator("#password").fill("FibroCareAudit2026!")
    page.get_by_role("button", name="Sign in").click()
    deadline = __import__("time").time() + 15
    while __import__("time").time() < deadline and page.url.rstrip("/") != "http://localhost:3000":
        page.wait_for_timeout(250)
    page.wait_for_selector("h1", timeout=15000)
    page.wait_for_timeout(800)
    page.add_script_tag(content=MEASURE_JS)
    print("DARK HOME h1:", json.dumps(measure(page, "h1", None)))
    ctx.close()

    # --- rt-dark login placeholder ---
    ctx2 = browser.new_context()
    ctx2.add_init_script("localStorage.setItem('fibrocare:dark', JSON.stringify(true));")
    page2 = ctx2.new_page()
    cdp = ctx2.new_cdp_session(page2)
    cdp.send("Emulation.setEmulatedMedia", {"features": [
        {"name": "prefers-reduced-transparency", "value": "reduce"},
        {"name": "prefers-contrast", "value": "more"},
    ]})
    page2.goto("http://localhost:3000/login", wait_until="domcontentloaded", timeout=60000)
    page2.wait_for_selector(".ambient", timeout=15000)
    page2.wait_for_timeout(800)
    page2.add_script_tag(content=MEASURE_JS)
    print("RT-DARK LOGIN placeholder:", json.dumps(measure(page2, "#email", "::placeholder")))
    print("RT-DARK LOGIN input:", json.dumps(measure(page2, "#email", None)))
    ctx2.close()

    browser.close()
