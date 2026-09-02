from playwright.sync_api import sync_playwright

def enter_pin(page, digits="1234"):
    for d in digits:
        btn = page.locator(f"button[aria-label='Digit {d}']").first
        if btn.is_visible():
            btn.click()
            page.wait_for_timeout(200)

def unlock(page):
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
    ("resources", "/resources", ["Care Resources", "Body Symptom Map"]),
    ("about", "/resources/about", ["Fibromyalgia", "Causes", "Symptoms"]),
    ("diagnosis", "/resources/diagnosis", ["Diagnosis", "Criteria", "WPI"]),
    ("treatment", "/resources/treatment", ["Treatment", "Medications", "Exercise"]),
    ("nutrition", "/resources/nutrition", ["Nutrition", "Foods", "Triggers"]),
    ("exercises", "/resources/exercises", ["Exercises", "Stretching", "Yoga"]),
    ("faq", "/resources/faq", ["FAQ", "Questions", "Chronic"]),
    ("community", "/resources/community", ["Community", "Patient Stories", "Share"]),
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    unlock(page)
    
    print("DESKTOP VERIFICATION")
    print("=" * 70)
    
    for name, url, keywords in PAGES:
        page.goto(f"http://localhost:3000{url}", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)
        
        body = page.locator("body").inner_text()
        header = page.locator("header").count()
        h1 = page.locator("h1").count()
        h2 = page.locator("h2").count()
        cards = page.locator("[class*='rounded-2xl']").count()
        
        found = [kw for kw in keywords if kw.lower() in body.lower()]
        missing = [kw for kw in keywords if kw.lower() not in body.lower()]
        
        status = "OK" if len(found) >= len(keywords) - 1 else "PARTIAL"
        print(f"  {name:15s} h1={h1} h2={h2} cards={cards:3d} keywords={len(found)}/{len(keywords)} [{status}]")
        if missing:
            print(f"                   missing: {', '.join(missing)}")
    
    ctx.close()
    browser.close()
    print("\nDone!")
