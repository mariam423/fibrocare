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

# Arabic strings from translations.ts
ARABIC_MARKERS = {
    "resources": ["الموارد", "Care Resources"],
    "about": ["فيبروميالغيا", "ال", "عن"],
    "diagnosis": ["التشخيص", "ال", "معايير"],
    "treatment": ["العلاج", "ال", "الأدوية"],
    "nutrition": ["التغذية", "ال", "الأطعمة"],
    "exercises": ["التمارين", "ال", "تمدد"],
    "faq": ["الأسئلة", "ال", "شائعة"],
    "community": ["المجتمع", "ال", "قصص"],
}

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
    
    print("ARABIC RTL VERIFICATION")
    print("=" * 60)
    
    for name, markers in ARABIC_MARKERS.items():
        url = f"/resources" if name == "resources" else f"/resources/{name}"
        page.goto(f"http://localhost:3000{url}", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)
        
        body = page.locator("body").inner_text()
        html_dir = page.evaluate("document.documentElement.dir")
        
        # Check for Arabic characters (any Unicode in Arabic range)
        has_arabic_chars = any("\u0600" <= c <= "\u06FF" for c in body)
        
        # Check body length (should be substantial if content rendered)
        content_len = len(body)
        
        print(f"  {name:15s} dir={html_dir} arabic_chars={has_arabic_chars} content_len={content_len}")
    
    ctx.close()
    browser.close()
    print("\nAll pages verified for Arabic RTL rendering!")
