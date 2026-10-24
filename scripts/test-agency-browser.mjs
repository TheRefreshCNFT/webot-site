import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "proof-results", "agency-overhaul");
const server = spawn("python3", ["-m", "http.server", "4180", "--bind", "127.0.0.1"], {
  cwd: root,
  detached: true,
  stdio: "ignore"
});
const report = { status: "FAIL", viewports: [], keyboard: "NOT_RUN", reducedMotion: "NOT_RUN" };

try {
  await waitFor("http://127.0.0.1:4180/");
  const { chromium } = await import(pathToFileURL(path.resolve(root, "../webot-platform/node_modules/playwright/index.mjs")).href);
  const browser = await chromium.launch({ headless: true });
  await mkdir(output, { recursive: true });
  try {
    for (const width of [320, 375, 414, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
      await page.route("**/api/agency/chat", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: { message: "Unavailable" } }) }));
      await page.goto("http://127.0.0.1:4180/", { waitUntil: "networkidle" });
      const dimensions = await page.evaluate(() => ({
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        rootOverflow: getComputedStyle(document.documentElement).overflowX,
        bodyOverflow: getComputedStyle(document.body).overflowX
      }));
      assert(dimensions.documentWidth <= width + 1, `${width}: document overflow`);
      assert(dimensions.bodyWidth <= width + 1, `${width}: body overflow`);
      assert.equal(dimensions.rootOverflow, "clip");
      assert.equal(dimensions.bodyOverflow, "clip");
      assert(await page.getByRole("heading", { name: "Need to streamline your flow? We Bot You." }).isVisible());
      assert(await page.getByRole("link", { name: "Book a free 30-minute consultation" }).first().isVisible());
      const ocrImages = page.locator("#ocr-showcase img");
      assert.equal(await ocrImages.count(), 2);
      for (const image of await ocrImages.all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((node) => node.decode());
        assert(await image.evaluate((node) => node.complete && node.naturalWidth === 1440 && node.naturalHeight === 900), `${width}: OCR image did not decode at contract dimensions`);
        const box = await image.boundingBox();
        assert(box && box.x >= 0 && box.x + box.width <= width + 1, `${width}: OCR image clipped`);
      }
      assert(await page.getByRole("link", { name: "Discuss your document workflow" }).isVisible());
      const smallButtons = await page.locator("a.button, button").evaluateAll((nodes) => nodes.filter((node) => {
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.height < 44;
      }).length);
      assert.equal(smallButtons, 0, `${width}: interactive target below 44px`);
      const proofImages = page.locator(".proof-figure img");
      for (let index = 0; index < await proofImages.count(); index++) {
        const image = proofImages.nth(index);
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((node) => node.decode());
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: path.join(output, `homepage-${width}.png`), fullPage: true });
      assert.equal(errors.length, 0, `${width}: ${errors.join(" | ")}`);
      report.viewports.push({ width, overflow: false, errors });
      await page.close();
    }

    const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto("http://127.0.0.1:4180/", { waitUntil: "networkidle" });
    const menu = page.locator(".nav-toggle");
    await menu.focus();
    await page.screenshot({ path: path.join(output, "keyboard-focus.png") });
    await page.keyboard.press("Enter");
    assert.equal(await menu.getAttribute("aria-expanded"), "true");
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("button", { name: "Menu" }).getAttribute("aria-expanded"), "false");
    assert.equal(await page.evaluate(() => document.activeElement?.classList.contains("nav-toggle")), true);
    const faq = page.locator(".faq-list summary").first();
    await faq.focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator(".faq-list details").first().getAttribute("open"), "");
    report.keyboard = "PASS";

    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), "auto");
    report.reducedMotion = "PASS";
    assert.equal(errors.length, 0, `keyboard: ${errors.join(" | ")}`);
    report.status = "PASS";
    await page.close();
  } finally {
    await browser.close();
  }
} catch (error) {
  report.error = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  if (server.pid) try { process.kill(-server.pid, "SIGTERM"); } catch {}
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, "browser-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}

async function waitFor(url) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try { if ((await fetch(url)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Timed out waiting for ${url}`);
}
