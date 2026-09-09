import { chromium } from "playwright";

const BASE = "http://localhost:3111";
const SHOTS = process.argv[2] || ".";
const results = [];
const consoleErrors = [];

function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();

page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(`PAGEERROR: ${err.message}`));

async function go(path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
}

/* ---------------------------------------------------------- landing + demo */
await go("/");
check("landing hero", await page.getByRole("heading", { name: /Your craft\. Their digital skills/ }).isVisible());
await page.screenshot({ path: `${SHOTS}/01-landing.png`, fullPage: false });

await go("/demo");
await page.getByRole("button", { name: /Continue as Nərgiz/ }).click();
await page.waitForURL("**/dashboard");
check("entered as owner", page.url().includes("/dashboard"));
await page.waitForSelector("text=Good", { timeout: 5000 }).catch(() => {});

/* ------------------------------------------------------------- dashboard */
const suggested = await page.getByText("Suggested next step").isVisible();
check("dashboard suggested step", suggested);
const hasApprovalStat = await page.getByText("Waiting for approval").first().isVisible();
check("dashboard approval stat", hasApprovalStat);
await page.screenshot({ path: `${SHOTS}/02-dashboard-owner.png`, fullPage: true });

/* -------------------------------------------------- approvals: owner path */
await go("/approvals");
const pendingBefore = await page.locator("li", { hasText: "Put the Small Geometric Wall Textile" }).count();
check("pending approval present", pendingBefore > 0);

await page.getByRole("button", { name: "Approve", exact: true }).first().click();
await page.getByRole("dialog").getByRole("button", { name: "Approve", exact: true }).click();
await page.waitForTimeout(600);
check(
  "approval removed from queue",
  (await page.locator("li", { hasText: "Put the Small Geometric Wall Textile" }).count()) === 0,
);

await go("/products?filter=public");
const publicCount = await page.locator("li").filter({ hasText: "Small Geometric Wall Textile" }).count();
check("approved product is now public", publicCount > 0);
await page.screenshot({ path: `${SHOTS}/03-products.png`, fullPage: true });

/* ----------------------------------------------------- persistence check */
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(500);
check(
  "change persisted across reload",
  (await page.locator("li").filter({ hasText: "Small Geometric Wall Textile" }).count()) > 0,
);

/* --------------------------------------------------------- role switching */
await go("/dashboard");
await page.getByRole("button", { name: /Nərgiz Əliyeva/ }).first().click();
await page.getByRole("menuitemradio", { name: /Leyla Əliyeva/ }).click();
await page.waitForTimeout(500);
check("switched to collaborator", await page.getByText("Leyla Əliyeva").first().isVisible());
await page.screenshot({ path: `${SHOTS}/04-dashboard-collaborator.png`, fullPage: true });

await go("/approvals");
const approveBtns = await page.getByRole("button", { name: "Approve", exact: true }).count();
check("collaborator cannot approve", approveBtns === 0, `found ${approveBtns} approve buttons`);
const ownerOnlyNote = await page.getByText("Only the business owner can approve").isVisible();
check("collaborator sees owner-only note", ownerOnlyNote);

/* ---------------------------------------------- collaborator price suggest */
await go("/products/product_bookmarks");
await page.waitForTimeout(400);
const suggestBtn = page.getByRole("button", { name: "Suggest a price" });
check("collaborator gets suggest-price control", await suggestBtn.isVisible());

/* ------------------------------------------------------- content workflow */
await go("/content");
await page.waitForTimeout(400);
check("content studio lists drafts", (await page.locator("li").filter({ hasText: "Caspian Blue" }).count()) > 0);
check(
  "no-publishing notice shown",
  await page.getByText("LoomLock does not post to social media for you").isVisible(),
);
await page.screenshot({ path: `${SHOTS}/05-content.png`, fullPage: true });

/* ------------------------------------------------------------ order board */
await go("/orders");
await page.waitForTimeout(400);
const boardStages = await page.getByRole("heading", { level: 2 }).count();
check("order board has stage columns", boardStages >= 6, `${boardStages} headings`);
const beforeMove = await page
  .locator("section", { hasText: "Discussing details" })
  .locator("li")
  .count();
await page
  .locator("li", { hasText: "NT-118" })
  .getByRole("button", { name: /Move forward/ })
  .click();
await page.waitForTimeout(600);
const afterMove = await page
  .locator("section", { hasText: "Discussing details" })
  .locator("li")
  .count();
check("order moved between stages", afterMove === beforeMove + 1, `${beforeMove} -> ${afterMove}`);
await page.screenshot({ path: `${SHOTS}/06-orders.png`, fullPage: true });

/* -------------------------------------------------------------- learning */
await go("/learn/organising-orders");
await page.waitForTimeout(400);
await page.getByRole("textbox").first().fill("NT-119 is mine. Next: check UK postage before replying.");
await page.getByRole("button", { name: "Mark as finished" }).click();
await page.waitForTimeout(600);
check("lesson marked finished", await page.getByText("Finished").first().isVisible());
await go("/learn");
await page.waitForTimeout(400);
await page.screenshot({ path: `${SHOTS}/07-learn.png`, fullPage: true });

/* ------------------------------------------------- storefront -> enquiry */
await go("/store/nergiz-textile-studio");
await page.waitForTimeout(500);
check("storefront shows artisan story", await page.getByText(/learned to weave from her mother/).isVisible());
const ordersBeforeEnquiry = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("loomlock.demo.v1")).orders.length,
);
await page.locator("#enquiry").scrollIntoViewIfNeeded();
await page.getByLabel("Your name").fill("Aysel Quliyeva");
await page.getByLabel("Email or phone").fill("aysel@example.az");
await page.getByLabel("Your message").fill("Do you make the runner in a 200 cm length for a long table?");
await page.getByRole("button", { name: "Send the enquiry" }).click();
await page.waitForTimeout(700);
check("enquiry confirmation shown", await page.getByText(/your message has arrived/).isVisible());
const ordersAfterEnquiry = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("loomlock.demo.v1")).orders.length,
);
check(
  "enquiry created an order",
  ordersAfterEnquiry === ordersBeforeEnquiry + 1,
  `${ordersBeforeEnquiry} -> ${ordersAfterEnquiry}`,
);
await page.screenshot({ path: `${SHOTS}/08-storefront.png`, fullPage: true });

await go("/orders");
await page.waitForTimeout(400);
check("enquiry appears on the board", (await page.getByText("Aysel Quliyeva").count()) > 0);

/* -------------------------------------------------------------- language */
await go("/dashboard");
await page.getByRole("radio", { name: "AZ" }).click();
await page.waitForTimeout(600);
check("interface switched to Azerbaijani", await page.getByText("İdarə paneli").first().isVisible());
const htmlLang = await page.evaluate(() => document.documentElement.lang);
check("html lang updated", htmlLang === "az", htmlLang);
await go("/products");
await page.waitForTimeout(400);
check(
  "demo content translated",
  (await page.getByText("Nar naxışlı süfrə yolluğu").count()) > 0,
);
await page.screenshot({ path: `${SHOTS}/09-azerbaijani.png`, fullPage: true });

await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(500);
check("language persisted across reload", (await page.getByText("Məhsullar").count()) > 0);

// back to English for the remaining checks
await page.getByRole("radio", { name: "EN" }).click();
await page.waitForTimeout(500);

/* ------------------------------------------------------- keyboard access */
await go("/dashboard");
await page.keyboard.press("Tab");
const firstFocus = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? "");
check("skip link is first tab stop", /Skip to main content/i.test(firstFocus), firstFocus);

await go("/products");
await page.waitForTimeout(400);
await page.getByRole("tab", { name: /^All/ }).focus();
await page.keyboard.press("ArrowRight");
await page.waitForTimeout(300);
const selectedTab = await page.getByRole("tab", { selected: true }).textContent();
check("filter tabs respond to arrow keys", /Drafts/.test(selectedTab ?? ""), selectedTab ?? "");

/* ------------------------------------------------------------- mobile */
const mobile = await context.newPage();
await mobile.setViewportSize({ width: 390, height: 844 });
await mobile.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
await mobile.waitForTimeout(600);
const hScroll = await mobile.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
);
check("no horizontal page scroll on mobile", !hScroll);
await mobile.screenshot({ path: `${SHOTS}/10-mobile-dashboard.png`, fullPage: true });

await mobile.getByRole("button", { name: "Open menu" }).click();
await mobile.waitForTimeout(400);
check("mobile drawer opens", await mobile.getByRole("dialog", { name: "Main menu" }).isVisible());
await mobile.screenshot({ path: `${SHOTS}/11-mobile-menu.png` });

await mobile.goto(`${BASE}/orders`, { waitUntil: "networkidle" });
await mobile.waitForTimeout(600);
const hScrollOrders = await mobile.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
);
check("order board does not break mobile layout", !hScrollOrders);
await mobile.screenshot({ path: `${SHOTS}/12-mobile-orders.png` });

/* ------------------------------------------------------------ reset demo */
await page.bringToFront();
await go("/settings");
await page.waitForTimeout(400);
await page.getByRole("button", { name: "Reset the demo" }).first().click();
await page.getByRole("dialog").getByRole("button", { name: "Reset the demo" }).click();
await page.waitForTimeout(800);
const ordersAfterReset = await page.evaluate(() => {
  const raw = localStorage.getItem("loomlock.demo.v1");
  return raw ? JSON.parse(raw).orders.length : -1;
});
check("reset restores seed data", ordersAfterReset === 7, `${ordersAfterReset} orders`);

/* --------------------------------------------------------------- report */
console.log("\n--- console errors ---");
const realErrors = consoleErrors.filter((e) => !/favicon|404 \(Not Found\)/i.test(e));
if (realErrors.length === 0) console.log("(none)");
else realErrors.slice(0, 10).forEach((e) => console.log(e));

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
await browser.close();
process.exit(failed.length > 0 || realErrors.length > 0 ? 1 : 0);
