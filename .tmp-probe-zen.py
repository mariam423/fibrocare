import time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
EMAIL = "e2e.smoke@fibrocare.local"
PASSWORD = "FibroCareE2E2026!"

def fill_login(page):
    for _ in range(3):
        page.goto(f"{BASE}/login", wait_until="domcontentloaded", timeout=60000)
        page.wait_for_selector("#email", timeout=20000)
        page.wait_for_timeout(2000)
        em = page.locator("#email")
        em.fill(EMAIL)
        if not em.input_value():
            continue
        page.locator("#password").fill(PASSWORD)
        if not page.locator("#password").input_value():
            continue
        page.get_by_role("button", name="Sign in").click()
        deadline = time.time() + 20
        while time.time() < deadline:
            if page.url.rstrip("/") == BASE:
                return True
            page.wait_for_timeout(300)
    return False

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    errors = []
    page.on("console", lambda m: errors.append(f"[console.{m.type}] {m.text}") if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(f"[pageerror] {e}"))
    print("login:", fill_login(page))
    page.wait_for_function("() => !!document.querySelector('[data-a11y=\"gratitude-save\"]')", timeout=90000)
    page.wait_for_timeout(1000)
    print("url before click:", page.url)
    btn = page.get_by_role("button", name="Open Zen Portal")
    print("btn count:", btn.count())
    btn.click()
    for i in range(30):
        if "/zen" in page.url:
            break
        page.wait_for_timeout(1000)
    print("url after click (30s):", page.url)
    print("errors:", errors[:8])
    ctx.close()
    browser.close()
