from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    
    # Root to set domain
    page.goto("http://localhost:3000", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(1000)
    
    # Set correct PIN hash
    page.evaluate("""async () => {
        const encoder = new TextEncoder();
        const data = encoder.encode('fibrocare::1234');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        localStorage.setItem('fibrocare-privacy-pin', hash);
        return hash;
    }""")
    
    # Navigate to about
    page.goto("http://localhost:3000/resources/about", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)
    
    body = page.locator("body").inner_text()[:100]
    locked = "Enter your 4-digit PIN" in body or "Your space is locked" in body
    print(f"Locked: {locked}")
    
    if locked:
        # Enter PIN
        for d in "1234":
            btn = page.locator(f"button[aria-label='Digit {d}']").first
            if btn.is_visible():
                btn.click()
                page.wait_for_timeout(300)
        page.wait_for_timeout(3000)
        
        body = page.locator("body").inner_text()[:200]
        locked = "Enter your 4-digit PIN" in body or "Your space is locked" in body
        print(f"After unlock: locked={locked}")
        print(f"Body: {body[:150]}")
    
    if not locked:
        h1 = page.locator("h1").all_text_contents()
        h2 = page.locator("h2").all_text_contents()
        h3 = page.locator("h3").all_text_contents()
        imgs = page.locator("img").count()
        print(f"h1: {h1}")
        print(f"h2: {h2}")
        print(f"h3: {h3}")
        print(f"images: {imgs}")
        page.screenshot(path="scripts/fix_about_works.png", full_page=True)
    
    ctx.close()
    browser.close()
