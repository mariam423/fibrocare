from playwright.sync_api import sync_playwright

def enter_pin(page, digits="1234"):
    for d in digits:
        btn = page.locator(f"button[aria-label='Digit {d}']").first
        if btn.is_visible():
            btn.click()
            page.wait_for_timeout(200)

def ensure_unlocked(page):
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
    
    # ABOUT PAGE - Full page + sections
    page.goto("http://localhost:3000/resources/about", wait_until="networkidle", timeout=30000)
    ensure_unlocked(page)
    page.goto("http://localhost:3000/resources/about", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(3000)
    
    page.screenshot(path="scripts/fix_about_full.png", full_page=True)
    
    # Sections at different scroll positions
    positions = [
        (0, "hero"),
        (900, "causes"),
        (1800, "symptoms"),
        (2700, "gutbrain"),
        (3600, "content"),
    ]
    for y, name in positions:
        page.evaluate(f"window.scrollTo(0, {y})")
        page.wait_for_timeout(500)
        page.screenshot(path=f"scripts/fix_about_{name}.png")
    
    # RESOURCES PAGE - Full page + sections
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    ensure_unlocked(page)
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(3000)
    
    page.screenshot(path="scripts/fix_resources_full.png", full_page=True)
    
    positions = [
        (0, "top"),
        (900, "bodymap"),
        (1800, "grid"),
    ]
    for y, name in positions:
        page.evaluate(f"window.scrollTo(0, {y})")
        page.wait_for_timeout(500)
        page.screenshot(path=f"scripts/fix_resources_{name}.png")
    
    # Check images loading
    imgs = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('img')).map(img => ({
            src: img.src.split('/').pop(),
            loaded: img.naturalWidth > 0,
            w: img.naturalWidth,
            h: img.naturalHeight
        }));
    }""")
    print("Resources page images:")
    for img in imgs:
        print(f"  {'OK' if img['loaded'] else 'BROKEN'}: {img['src']} ({img['w']}x{img['h']})")
    
    # About page images
    page.goto("http://localhost:3000/resources/about", wait_until="networkidle", timeout=30000)
    ensure_unlocked(page)
    page.goto("http://localhost:3000/resources/about", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(3000)
    
    imgs = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('img')).map(img => ({
            src: img.src.split('/').pop(),
            loaded: img.naturalWidth > 0,
            w: img.naturalWidth,
            h: img.naturalHeight
        }));
    }""")
    print("\nAbout page images:")
    for img in imgs:
        print(f"  {'OK' if img['loaded'] else 'BROKEN'}: {img['src']} ({img['w']}x{img['h']})")
    
    ctx.close()
    browser.close()
    print("\nDone!")
