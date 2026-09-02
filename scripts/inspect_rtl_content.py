from playwright.sync_api import sync_playwright

def enter_pin(page, digits="1234"):
    for d in digits:
        btn = page.locator(f"button[aria-label='Digit {d}']").first
        if btn.is_visible():
            btn.click()
            page.wait_for_timeout(200)

def setup_pin(page):
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

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    
    # Set up PIN
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    setup_pin(page)
    
    # Switch to Arabic
    lang_btn = page.locator("button:has-text('عربي')").first
    if lang_btn.is_visible():
        lang_btn.click()
        page.wait_for_timeout(1000)
    
    # Check resources page
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)
    
    body = page.locator("body").inner_text()
    print("RESOURCES (Arabic RTL):")
    print(body[:400])
    
    # Check about page
    page.goto("http://localhost:3000/resources/about", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)
    
    body = page.locator("body").inner_text()
    print("\nABOUT (Arabic RTL):")
    print(body[:400])
    
    # Check community page
    page.goto("http://localhost:3000/resources/community", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)
    
    body = page.locator("body").inner_text()
    print("\nCOMMUNITY (Arabic RTL):")
    print(body[:400])
    
    ctx.close()
    browser.close()
