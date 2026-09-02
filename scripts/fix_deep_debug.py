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

    errors = []
    page.on("console", lambda msg: errors.append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)
    page.on("pageerror", lambda err: errors.append(f"[PAGE_ERROR] {err}"))

    # Setup PIN
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    setup_pin(page)

    # About page
    page.goto("http://localhost:3000/resources/about", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(3000)
    
    # Get full HTML structure
    structure = page.evaluate("""() => {
        const main = document.querySelector('main');
        if (!main) return 'NO MAIN ELEMENT';
        return main.innerHTML.substring(0, 3000);
    }""")
    print("=== ABOUT PAGE HTML (first 3000 chars) ===")
    print(structure)
    
    # Check for console errors
    if errors:
        print("\n=== CONSOLE ERRORS ===")
        for e in errors[:10]:
            print(f"  {e}")
    else:
        print("\nNo console errors!")
    
    # Full page body text
    body = page.locator("body").inner_text()
    print(f"\n=== BODY TEXT ({len(body)} chars) ===")
    print(body[:1000])
    
    # Take screenshot
    page.screenshot(path="scripts/fix_about_debug.png", full_page=True)
    
    # Resources main page
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(3000)
    
    body = page.locator("body").inner_text()
    print(f"\n=== RESOURCES BODY ({len(body)} chars) ===")
    print(body[:1000])
    
    page.screenshot(path="scripts/fix_resources_debug.png", full_page=True)
    
    ctx.close()
    browser.close()
