import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
});
const page = await ctx.newPage();

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

// Check what's on the page
const info = await page.evaluate(() => {
  const inputs = [...document.querySelectorAll("input")].map(i => ({ type: i.type, placeholder: i.placeholder, name: i.name, id: i.id }));
  const buttons = [...document.querySelectorAll("button")].map(b => b.textContent?.trim().slice(0, 40));
  const links = [...document.querySelectorAll("a")].map(a => ({ text: a.textContent?.trim().slice(0, 30), href: a.href })).slice(0, 5);
  return { title: document.title, inputs, buttons, links, url: window.location.href };
});
console.log(JSON.stringify(info, null, 2));

await page.screenshot({ path: "C:/Users/user/AppData/Local/Temp/opencode/fibrocare_login.png" });
await browser.close();