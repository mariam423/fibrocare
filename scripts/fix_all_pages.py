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

def unlock(page):
    body = page.locator("body").inner_text()[:200]
    if "Enter your 4-digit PIN" in body or "Your space is locked" in body:
        for d in "1234":
            btn = page.locator(f"button[aria-label='Digit {d}']").first
            if btn.is_visible():
                btn.click()
                page.wait_for_timeout(300)
        page.wait_for_timeout(2000)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    
    # Set PIN hash
    page.goto("http://localhost:3000", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(1000)
    page.evaluate("""async () => {
        const encoder = new TextEncoder();
        const data = encoder.encode('fibrocare::1234');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        localStorage.setItem('fibrocare-privacy-pin', hash);
    }""")
    
    print("DESKTOP (1280x900)")
    print("=" * 60)
    
    for name, url in PAGES:
        page.goto(f"http://localhost:3000{url}", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)
        unlock(page)
        
        # Re-navigate after unlock
        page.goto(f"http://localhost:3000{url}", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)
        unlock(page)
        
        body = page.locator("body").inner_text()[:200]
        locked = "Enter your 4-digit PIN" in body or "Your space is locked" in body
        
        if not locked:
            h1 = page.locator("h1").all_text_contents()
            h2 = page.locator("h2").all_text_contents()
            imgs = page.locator("img").count()
            print(f"  {name:15s} h1={h1} h2={len(h2)} imgs={imgs}")
            page.screenshot(path=f"scripts/fix_{name}_verified.png", full_page=True)
        else:
            print(f"  {name:15s} STILL LOCKED")
    
    ctx.close()
    browser.close()
    print("\nDone!")
