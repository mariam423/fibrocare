from playwright.sync_api import sync_playwright

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
    
    # Navigate to root to get localStorage domain
    page.goto("http://localhost:3000", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)
    
    # Compute correct hash: SHA-256("fibrocare::1234")
    hash_result = page.evaluate("""async () => {
        const encoder = new TextEncoder();
        const data = encoder.encode('fibrocare::1234');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }""")
    print(f"SHA-256 of 'fibrocare::1234': {hash_result}")
    
    # Store the hash
    page.evaluate(f"localStorage.setItem('fibrocare-privacy-pin', '{hash_result}')")
    
    # Verify
    pin = page.evaluate("localStorage.getItem('fibrocare-privacy-pin')")
    print(f"PIN stored: {pin}")
    
    # Now test each page
    print("\nDESKTOP VERIFICATION")
    print("=" * 60)
    
    for name, url in PAGES:
        page.goto(f"http://localhost:3000{url}", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)
        
        body = page.locator("body").inner_text()[:200]
        is_locked = "Choose a 4-digit PIN" in body or "Enter your 4-digit PIN" in body or "Your space is locked" in body
        
        if is_locked:
            # Enter PIN
            for d in "1234":
                btn = page.locator(f"button[aria-label='Digit {d}']").first
                if btn.is_visible():
                    btn.click()
                    page.wait_for_timeout(300)
            page.wait_for_timeout(2000)
            body = page.locator("body").inner_text()[:200]
            is_locked = "Choose a 4-digit PIN" in body or "Enter your 4-digit PIN" in body
        
        h1 = page.locator("h1").all_text_contents()
        h2 = page.locator("h2").all_text_contents()
        imgs = page.locator("img").count()
        
        print(f"  {name:15s} locked={is_locked} h1={h1} h2={len(h2)} imgs={imgs}")
    
    # Take detailed screenshots of About page
    print("\nAbout page screenshots...")
    page.goto("http://localhost:3000/resources/about", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)
    
    body = page.locator("body").inner_text()[:200]
    if "Enter your 4-digit PIN" in body or "Your space is locked" in body:
        for d in "1234":
            btn = page.locator(f"button[aria-label='Digit {d}']").first
            if btn.is_visible():
                btn.click()
                page.wait_for_timeout(300)
        page.wait_for_timeout(2000)
    
    page.goto("http://localhost:3000/resources/about", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(3000)
    
    body = page.locator("body").inner_text()[:200]
    is_locked = "Enter your 4-digit PIN" in body or "Your space is locked" in body
    print(f"  About locked after unlock: {is_locked}")
    
    if not is_locked:
        page.screenshot(path="scripts/fix_about_correct.png", full_page=True)
        print("  Screenshot saved: fix_about_correct.png")
    
    # Resources page
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)
    
    body = page.locator("body").inner_text()[:200]
    if "Enter your 4-digit PIN" in body or "Your space is locked" in body:
        for d in "1234":
            btn = page.locator(f"button[aria-label='Digit {d}']").first
            if btn.is_visible():
                btn.click()
                page.wait_for_timeout(300)
        page.wait_for_timeout(2000)
    
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(3000)
    
    body = page.locator("body").inner_text()[:200]
    is_locked = "Enter your 4-digit PIN" in body or "Your space is locked" in body
    print(f"  Resources locked after unlock: {is_locked}")
    
    if not is_locked:
        page.screenshot(path="scripts/fix_resources_correct.png", full_page=True)
        print("  Screenshot saved: fix_resources_correct.png")
    
    ctx.close()
    browser.close()
