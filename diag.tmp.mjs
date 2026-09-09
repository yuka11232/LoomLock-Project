import { chromium } from "playwright";
const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
for (const path of ["/dashboard", "/orders", "/products", "/learn"]) {
  await page.goto("http://localhost:3111" + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  const info = await page.evaluate(() => {
    const docW = document.documentElement.clientWidth;
    const out = [];
    document.querySelectorAll("*").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > docW + 1 || r.left < -1)) {
        out.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || "").toString().slice(0, 90),
          left: Math.round(r.left),
          right: Math.round(r.right),
          w: Math.round(r.width),
        });
      }
    });
    return { docW, scrollW: document.documentElement.scrollWidth, out: out.slice(0, 8) };
  });
  console.log("\n=== " + path + " doc=" + info.docW + " scroll=" + info.scrollW);
  info.out.forEach((o) => console.log(`  ${o.tag} L${o.left} R${o.right} W${o.w}  ${o.cls}`));
}
await browser.close();
