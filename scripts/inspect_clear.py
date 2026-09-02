from playwright.sync_api import sync_playwright

def clear_privacy_lock(page):
    """Remove the privacy PIN from localStorage."""
    page.evaluate("localStorage.removeItem('fibrocare-privacy-pin')")
    page.evaluate("localStorage.removeItem('fibrocare:privacy-locked')")

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
    
    # Navigate to root to set up localStorage domain
    page.goto("http://localhost:3000", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(1000)
    
    # Clear privacy lock
    clear_privacy_lock(page)
    
    # Also try clearing all localStorage
    page.evaluate("localStorage.clear()")
    
    # Verify cleared
    pin = page.evaluate("localStorage.getItem('fibrocare-privacy-pin')")
    print(f"PIN after clear: {pin}")
    
    # Now navigate to resources
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(3000)
    
    body = page.locator("body").inner_text()[:200]
    is_locked = "Choose a 4-digit PIN" in body or "Enter your 4-digit PIN" in body or "Your space is locked" in body
    print(f"Resources page locked: {is_locked}")
    print(f"Body: {body[:150]}")
    
    # If still locked, enter PIN
    if is_locked:
        keypad = page.locator("button[aria-label='Digit 1']")
        if keypad.is_visible():
            # Enter PIN
            for d in "1234":
                btn = page.locator(f"button[aria-label='Digit {d}']").first
                if btn.is_visible():
                    btn.click()
                    page.wait_for_timeout(200)
            page.wait_for_timeout(2000)
            
            # Check if we need to confirm
            keypad2 = page.locator("button[aria-label='Digit 1']")
            if keypad2.is_visible():
                for d in "1234":
                    btn = page.locator(f"button[aria-label='Digit {d}']").first
                    if btn.is_visible():
                        btn.click()
                        page.wait_for_timeout(200)
                page.wait_for_timeout(2000)
    
    body = page.locator("body").inner_text()[:200]
    print(f"After unlock: {body[:150]}")
    
    # Now navigate to each page
    for name, url in PAGES:
        page.goto(f"http://localhost:3000{url}", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)
        
        body = page.locator("body").inner_text()[:200]
        is_locked = "Choose a 4-digit PIN" in body or "Enter your 4-digit PIN" in body or "Your space is locked" in body
        
        if is_locked:
            # Try to unlock
            keypad = page.locator("button[aria-label='Digit 1']")
            if keypad.is_visible():
                for d in "1234":
                    btn = page.locator(f"button[aria-label='Digit {d}']").first
                    if btn.is_visible():
                        btn.click()
                        page.wait_for_timeout(200)
                page.wait_for_timeout(2000)
                body = page.locator("body").inner_text()[:200]
                is_locked = "Choose a 4-digit PIN" in body or "Enter your 4-digit PIN" in body
        
        header = page.locator("header").count()
        print(f"  {name:15s} locked={is_locked} header={header} body={len(body)} chars")
    
    ctx.close()
    browser.close()
