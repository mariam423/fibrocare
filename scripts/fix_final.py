from playwright.sync_api import sync_playwright

def enter_pin(page, digits="1234"):
    for d in digits:
        btn = page.locator(f"button[aria-label='Digit {d}']").first
        if btn.is_visible():
            btn.click()
            page.wait_for_timeout(200)

def ensure_unlocked(page):
    """Check if locked and unlock if needed."""
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

def goto_unlocked(page, url):
    """Navigate to URL and unlock if needed."""
    page.goto(f"http://localhost:3000{url}", wait_until="networkidle", timeout=30000)
    ensure_unlocked(page)

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
    
    errors = []
    page.on("console", lambda msg: errors.append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)
    
    print("=== ABOUT PAGE ===")
    goto_unlocked(page, "/resources/about")
    page.wait_for_timeout(2000)
    
    body = page.locator("body").inner_text()
    is_locked = "Choose a 4-digit PIN" in body or "Enter your 4-digit PIN" in body
    
    if is_locked:
        print("STILL LOCKED - entering PIN again")
        enter_pin(page)
        page.wait_for_timeout(3000)
        body = page.locator("body").inner_text()
    
    h1 = page.locator("h1").all_text_contents()
    h2 = page.locator("h2").all_text_contents()
    h3 = page.locator("h3").all_text_contents()
    imgs = page.locator("img").count()
    svgs = page.locator("svg").count()
    main = page.locator("main").count()
    sections = page.locator("section").count()
    
    print(f"  locked: {is_locked}")
    print(f"  h1: {h1}")
    print(f"  h2: {h2}")
    print(f"  h3: {h3}")
    print(f"  images: {imgs}, svgs: {svgs}")
    print(f"  main: {main}, sections: {sections}")
    print(f"  body_len: {len(body)}")
    
    page.screenshot(path="scripts/fix_about_final.png", full_page=True)
    
    print("\n=== RESOURCES PAGE ===")
    goto_unlocked(page, "/resources")
    page.wait_for_timeout(2000)
    
    body = page.locator("body").inner_text()
    is_locked = "Choose a 4-digit PIN" in body or "Enter your 4-digit PIN" in body
    
    if is_locked:
        print("STILL LOCKED - entering PIN again")
        enter_pin(page)
        page.wait_for_timeout(3000)
        body = page.locator("body").inner_text()
    
    h1 = page.locator("h1").all_text_contents()
    h2 = page.locator("h2").all_text_contents()
    imgs = page.locator("img").count()
    
    print(f"  locked: {is_locked}")
    print(f"  h1: {h1}")
    print(f"  h2: {h2}")
    print(f"  images: {imgs}")
    print(f"  body_len: {len(body)}")
    
    page.screenshot(path="scripts/fix_resources_final.png", full_page=True)
    
    if errors:
        print(f"\nConsole errors: {errors[:5]}")
    
    ctx.close()
    browser.close()
