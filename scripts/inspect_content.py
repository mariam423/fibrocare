from playwright.sync_api import sync_playwright

def enter_pin(page, digits="1234"):
    for d in digits:
        btn = page.locator(f"button[aria-label='Digit {d}']").first
        if btn.is_visible():
            btn.click()
            page.wait_for_timeout(200)

def unlock(page):
    page.wait_for_timeout(2000)
    body = page.locator("body").inner_text()[:200]
    if "Choose a 4-digit PIN" in body:
        enter_pin(page)
        page.wait_for_timeout(1500)
        keypad = page.locator("button[aria-label='Digit 1']")
        if keypad.is_visible():
            enter_pin(page)
            page.wait_for_timeout(2000)
    elif "Enter your 4-digit PIN" in body or "Your space is locked" in body:
        enter_pin(page)
        page.wait_for_timeout(2000)

PAGES = [
    ("resources", "/resources"),
    ("about", "/resources/about"),
    ("diagnosis", "/resources/diagnosis"),
    ("treatment", "/resources/treatment"),
    ("nutrition", "/resources/nutrition"),
    ("exercises", "/resources/exercises"),
    ("faq", "/resources/faq"),
    ("community", "/resources/community"),
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    unlock(page)
    
    for name, url in PAGES:
        page.goto(f"http://localhost:3000{url}", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)
        
        body = page.locator("body").inner_text()
        # Get first 300 chars
        print(f"\n--- {name} ---")
        print(body[:300])
    
    ctx.close()
    browser.close()
