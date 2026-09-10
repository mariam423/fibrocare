import { test } from "@playwright/test";

test("debug: login submit click ground truth", async ({ page }) => {
  const consoleMsgs: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (m) => consoleMsgs.push(`[${m.type()}] ${m.text()}`));
  page.on("pageerror", (e) => pageErrors.push(String(e)));

  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#email", { timeout: 30_000 });

  const btn = page.getByRole("button", { name: "Sign in" });
  await btn.waitFor({ state: "visible", timeout: 20_000 });

  // What does the button look like before the click?
  const preClick = await btn.evaluate((el) => ({
    disabled: (el as HTMLButtonElement).disabled,
    type: (el as HTMLButtonElement).type,
    form: el.closest("form") ? !!el.closest("form") : false,
    formNoValidate: el.closest("form")?.getAttribute("novalidate"),
    formAction: el.closest("form")?.getAttribute("action"),
    hasReactFiber: Object.keys(el).some((k) => k.startsWith("__react")),
    text: el.textContent,
  }));
  console.log("PRE-CLICK:", JSON.stringify(preClick, null, 2));

  await btn.click();

  // Wait a beat and inspect the page state.
  await page.waitForTimeout(4_000);

  const postClick = await page.evaluate(() => ({
    url: location.href,
    hasErrorEl: !!document.getElementById("login-error"),
    errorText: document.getElementById("login-error")?.textContent ?? null,
    emailValue: (document.getElementById("email") as HTMLInputElement)?.value,
    formPresent: !!document.querySelector("form"),
  }));
  console.log("POST-CLICK:", JSON.stringify(postClick, null, 2));

  console.log("CONSOLE MSGS:", JSON.stringify(consoleMsgs.slice(0, 15), null, 2));
  console.log("PAGE ERRORS:", JSON.stringify(pageErrors.slice(0, 5), null, 2));

  // Keep artifacts out of the pass/fail logic — always "passes".
});
