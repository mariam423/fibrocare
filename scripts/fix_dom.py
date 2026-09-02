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
    
    errors = []
    page.on("console", lambda msg: errors.append(f"[{msg.type}] {msg.text}") if msg.type in ("error", "warning") else None)
    page.on("pageerror", lambda err: errors.append(f"[PAGE_ERROR] {err}"))
    
    # Setup
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    ensure_unlocked(page)
    
    # About page
    page.goto("http://localhost:3000/resources/about", wait_until="networkidle", timeout=30000)
    ensure_unlocked(page)
    page.goto("http://localhost:3000/resources/about", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(3000)
    
    # Check if the page content is rendering
    body_text = page.locator("body").inner_text()
    is_locked = "Choose a 4-digit PIN" in body_text or "Enter your 4-digit PIN" in body_text
    print(f"Locked: {is_locked}")
    print(f"Body length: {len(body_text)}")
    print(f"First 200 chars: {body_text[:200]}")
    
    # Get the main content HTML
    html = page.evaluate("""() => {
        const main = document.querySelector('main');
        if (!main) return 'NO MAIN';
        return main.outerHTML.substring(0, 2000);
    }""")
    print(f"\nMain HTML (first 2000):\n{html[:2000]}")
    
    # Check for images in the full document
    all_imgs = page.evaluate("""() => {
        const imgs = document.querySelectorAll('img');
        return Array.from(imgs).map(img => img.outerHTML.substring(0, 200));
    }""")
    print(f"\nAll <img> elements: {len(all_imgs)}")
    for img in all_imgs:
        print(f"  {img[:150]}")
    
    # Check for next/image specifically
    next_imgs = page.evaluate("""() => {
        const imgs = document.querySelectorAll('img[data-nimg], img[nextjs-img], span[data-nimg]');
        return Array.from(imgs).map(el => el.outerHTML.substring(0, 200));
    }""")
    print(f"\nNext.js Image elements: {len(next_imgs)}")
    
    # Check console errors
    if errors:
        print(f"\nConsole errors ({len(errors)}):")
        for e in errors[:10]:
            print(f"  {e[:150]}")
    
    ctx.close()
    browser.close()
