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

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    # Desktop viewport for detailed inspection
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    
    # Unlock
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    unlock(page)
    
    # 1. Resources main page - check nav cards grid alignment
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)
    page.screenshot(path="scripts/inspect_resources_top.png", clip={"x": 0, "y": 0, "width": 1280, "height": 900})
    
    # Scroll to body map and resource grid
    page.evaluate("window.scrollTo(0, 600)")
    page.wait_for_timeout(500)
    page.screenshot(path="scripts/inspect_resources_grid.png", clip={"x": 0, "y": 0, "width": 1280, "height": 900})
    
    # 2. About page - check hero card, causes grid, symptoms grid
    page.goto("http://localhost:3000/resources/about", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)
    page.screenshot(path="scripts/inspect_about_hero.png", clip={"x": 0, "y": 0, "width": 1280, "height": 900})
    
    # Scroll to causes grid
    page.evaluate("window.scrollTo(0, 800)")
    page.wait_for_timeout(500)
    page.screenshot(path="scripts/inspect_about_causes.png", clip={"x": 0, "y": 0, "width": 1280, "height": 900})
    
    # Scroll to symptoms grid
    page.evaluate("window.scrollTo(0, 1600)")
    page.wait_for_timeout(500)
    page.screenshot(path="scripts/inspect_about_symptoms.png", clip={"x": 0, "y": 0, "width": 1280, "height": 900})
    
    # Scroll to gut-brain axis
    page.evaluate("window.scrollTo(0, 2400)")
    page.wait_for_timeout(500)
    page.screenshot(path="scripts/inspect_about_gutbrain.png", clip={"x": 0, "y": 0, "width": 1280, "height": 900})
    
    # 3. Diagnosis page - check diagnostic checker
    page.goto("http://localhost:3000/resources/diagnosis", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)
    page.evaluate("window.scrollTo(0, 600)")
    page.wait_for_timeout(500)
    page.screenshot(path="scripts/inspect_diagnosis_checker.png", clip={"x": 0, "y": 0, "width": 1280, "height": 900})
    
    # 4. Community page - check post creation box
    page.goto("http://localhost:3000/resources/community", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)
    page.screenshot(path="scripts/inspect_community_top.png", clip={"x": 0, "y": 0, "width": 1280, "height": 900})
    
    # 5. Mobile view of about page
    ctx.close()
    ctx = browser.new_context(viewport={"width": 375, "height": 812})
    page = ctx.new_page()
    unlock_page = page
    
    page.goto("http://localhost:3000/resources", wait_until="networkidle", timeout=30000)
    unlock(page)
    
    page.goto("http://localhost:3000/resources/about", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)
    page.screenshot(path="scripts/inspect_about_mobile_hero.png", clip={"x": 0, "y": 0, "width": 375, "height": 812})
    
    page.evaluate("window.scrollTo(0, 600)")
    page.wait_for_timeout(500)
    page.screenshot(path="scripts/inspect_about_mobile_causes.png", clip={"x": 0, "y": 0, "width": 375, "height": 812})
    
    ctx.close()
    browser.close()
    print("Screenshots saved!")
