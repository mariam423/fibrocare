from playwright.sync_api import sync_playwright

def enter_pin(page, digits="1234"):
    for d in digits:
        btn = page.locator(f"button[aria-label='Digit {d}']").first
        if btn.is_visible():
            btn.click()
            page.wait_for_timeout(200)

def setup_pin(page):
    """Set up PIN on the first page."""
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
    
    # Desktop RTL
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    
    # Navigate to resources and set up PIN
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    setup_pin(page)
    
    # Switch to Arabic
    lang_btn = page.locator("button:has-text('عربي')").first
    if lang_btn.is_visible():
        lang_btn.click()
        page.wait_for_timeout(1000)
    
    print("ARABIC RTL - DESKTOP")
    print("=" * 50)
    
    for name, url in PAGES:
        page.goto(f"http://localhost:3000{url}", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)
        
        # Check RTL direction
        html_dir = page.evaluate("document.documentElement.dir")
        html_lang = page.evaluate("document.documentElement.lang")
        
        # Check for Arabic text
        body = page.locator("body").inner_text()[:200]
        has_arabic = any("\u0600" <= c <= "\u06FF" for c in body)
        
        # Check header alignment (should be mirrored in RTL)
        header = page.locator("header").count()
        
        # Take screenshot
        page.screenshot(path=f"scripts/rtl_{name}_desktop.png", full_page=True)
        
        print(f"  {name:15s} dir={html_dir} lang={html_lang} arabic={has_arabic} header={header}")
    
    ctx.close()
    
    # Mobile RTL
    ctx = browser.new_context(viewport={"width": 375, "height": 812})
    page = ctx.new_page()
    
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    setup_pin(page)
    
    # Switch to Arabic
    lang_btn = page.locator("button:has-text('عربي')").first
    if lang_btn.is_visible():
        lang_btn.click()
        page.wait_for_timeout(1000)
    
    print("\nARABIC RTL - MOBILE")
    print("=" * 50)
    
    for name, url in PAGES:
        page.goto(f"http://localhost:3000{url}", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)
        
        html_dir = page.evaluate("document.documentElement.dir")
        html_lang = page.evaluate("document.documentElement.lang")
        body = page.locator("body").inner_text()[:200]
        has_arabic = any("\u0600" <= c <= "\u06FF" for c in body)
        header = page.locator("header").count()
        
        page.screenshot(path=f"scripts/rtl_{name}_mobile.png", full_page=True)
        
        print(f"  {name:15s} dir={html_dir} lang={html_lang} arabic={has_arabic} header={header}")
    
    ctx.close()
    browser.close()
    print("\nDone!")
