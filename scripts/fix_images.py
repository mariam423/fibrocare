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
    
    # Setup
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    ensure_unlocked(page)
    
    # ABOUT PAGE
    page.goto("http://localhost:3000/resources/about", wait_until="networkidle", timeout=30000)
    ensure_unlocked(page)
    page.goto("http://localhost:3000/resources/about", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(3000)
    
    imgs = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('img')).map(img => ({
            src: img.src,
            loaded: img.naturalWidth > 0,
            w: img.naturalWidth,
            h: img.naturalHeight,
            display: getComputedStyle(img).display,
            visibility: getComputedStyle(img).visibility,
            opacity: getComputedStyle(img).opacity
        }));
    }""")
    print("ABOUT PAGE IMAGES:")
    for img in imgs:
        status = "OK" if img["loaded"] else "BROKEN"
        short_src = img["src"].split("/")[-1] if "/" in img["src"] else img["src"][:50]
        print(f"  {status}: {short_src} ({img['w']}x{img['h']}) display={img['display']} vis={img['visibility']} opa={img['opacity']}")
    print(f"  Total: {len(imgs)}")
    
    # RESOURCES PAGE
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    ensure_unlocked(page)
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(3000)
    
    imgs = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('img')).map(img => ({
            src: img.src,
            loaded: img.naturalWidth > 0,
            w: img.naturalWidth,
            h: img.naturalHeight
        }));
    }""")
    print("\nRESOURCES PAGE IMAGES:")
    for img in imgs:
        status = "OK" if img["loaded"] else "BROKEN"
        short_src = img["src"].split("/")[-1] if "/" in img["src"] else img["src"][:50]
        print(f"  {status}: {short_src} ({img['w']}x{img['h']})")
    print(f"  Total: {len(imgs)}")
    
    # Check if Next.js Image component is loading properly
    next_imgs = page.evaluate("""() => {
        const imgs = document.querySelectorAll('img[alt]');
        return Array.from(imgs).map(img => ({
            alt: img.alt,
            src: img.src.substring(0, 80),
            naturalWidth: img.naturalWidth,
            complete: img.complete
        }));
    }""")
    print(f"\nNext.js Image elements: {len(next_imgs)}")
    for img in next_imgs:
        print(f"  alt='{img['alt'][:30]}' complete={img['complete']} w={img['naturalWidth']}")
    
    ctx.close()
    browser.close()
