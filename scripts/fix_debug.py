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

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()

    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    setup_pin(page)

    # Resources main page - full page
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(3000)
    page.screenshot(path="scripts/fix_resources_full.png", full_page=True)
    
    # About page - full page  
    page.goto("http://localhost:3000/resources/about", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(3000)
    page.screenshot(path="scripts/fix_about_full.png", full_page=True)
    
    # About page - sections at different scroll positions
    for scroll_y, name in [(0, "top"), (800, "causes"), (1600, "symptoms"), (2400, "gutbrain"), (3200, "content")]:
        page.evaluate(f"window.scrollTo(0, {scroll_y})")
        page.wait_for_timeout(500)
        page.screenshot(path=f"scripts/fix_about_{name}.png", clip={"x": 0, "y": 0, "width": 1280, "height": 900})
    
    # Check what elements exist on the about page
    page.goto("http://localhost:3000/resources/about", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(3000)
    
    imgs = page.locator("img").count()
    svgs = page.locator("svg").count()
    h2s = page.locator("h2").all_text_contents()
    h3s = page.locator("h3").all_text_contents()
    sections = page.locator("section").count()
    
    print(f"About page elements:")
    print(f"  images: {imgs}")
    print(f"  svgs: {svgs}")
    print(f"  h2: {h2s}")
    print(f"  h3: {h3s}")
    print(f"  sections: {sections}")
    
    # Check resources page elements
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(3000)
    
    imgs = page.locator("img").count()
    h1s = page.locator("h1").all_text_contents()
    h2s = page.locator("h2").all_text_contents()
    links = page.locator("a[href*='resources/']").count()
    
    print(f"\nResources page elements:")
    print(f"  images: {imgs}")
    print(f"  h1: {h1s}")
    print(f"  h2: {h2s}")
    print(f"  resource links: {links}")
    
    # Check for broken images
    broken = page.evaluate("""() => {
        const imgs = document.querySelectorAll('img');
        return Array.from(imgs).map(img => ({
            src: img.src,
            loaded: img.naturalWidth > 0,
            alt: img.alt
        }));
    }""")
    print(f"\nImage status:")
    for img in broken:
        print(f"  {'OK' if img['loaded'] else 'BROKEN'}: {img['src'][:80]} (alt={img['alt'][:30]})")
    
    ctx.close()
    browser.close()
