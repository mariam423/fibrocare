from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    
    # Navigate to root to get localStorage domain
    page.goto("http://localhost:3000", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)
    
    # Check current localStorage state
    pin = page.evaluate("localStorage.getItem('fibrocare-privacy-pin')")
    print(f"Current PIN hash: {pin}")
    
    # Try to compute the hash for "1234" and store it
    # The SHA-256 hash of "1234" is well-known
    # Let's use the crypto API to compute it
    hash_result = page.evaluate("""async () => {
        const encoder = new TextEncoder();
        const data = encoder.encode('1234');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }""")
    print(f"SHA-256 of '1234': {hash_result}")
    
    # Store the hash directly
    page.evaluate(f"localStorage.setItem('fibrocare-privacy-pin', '{hash_result}')")
    
    # Verify
    pin = page.evaluate("localStorage.getItem('fibrocare-privacy-pin')")
    print(f"PIN after store: {pin}")
    
    # Now navigate to about page
    page.goto("http://localhost:3000/resources/about", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(3000)
    
    body = page.locator("body").inner_text()[:200]
    is_locked = "Choose a 4-digit PIN" in body or "Enter your 4-digit PIN" in body
    print(f"\nAbout page locked: {is_locked}")
    print(f"Body: {body[:150]}")
    
    # If locked, enter PIN
    if is_locked:
        print("Entering PIN...")
        for d in "1234":
            btn = page.locator(f"button[aria-label='Digit {d}']").first
            if btn.is_visible():
                btn.click()
                page.wait_for_timeout(300)
        page.wait_for_timeout(3000)
        
        body = page.locator("body").inner_text()[:200]
        is_locked = "Choose a 4-digit PIN" in body or "Enter your 4-digit PIN" in body
        print(f"After PIN entry, locked: {is_locked}")
        print(f"Body: {body[:150]}")
    
    # Check elements
    h1 = page.locator("h1").all_text_contents()
    h2 = page.locator("h2").all_text_contents()
    h3 = page.locator("h3").all_text_contents()
    imgs = page.locator("img").count()
    
    print(f"\nh1: {h1}")
    print(f"h2: {h2}")
    print(f"h3: {h3}")
    print(f"images: {imgs}")
    
    # Take screenshot
    page.screenshot(path="scripts/fix_about_approach.png", full_page=True)
    
    ctx.close()
    browser.close()
