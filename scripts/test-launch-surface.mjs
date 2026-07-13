import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const agencyRoot = path.resolve(import.meta.dirname, "..");
const studioRoot = path.resolve(agencyRoot, "../webot-studio");
const proofRoot = path.resolve(process.env.PROOF_DIR || path.join(agencyRoot, "proof-results", "launch-surface"));
const servers = [serve(agencyRoot, 4180), serve(studioRoot, 4181)];
try {
  await Promise.all([waitFor("http://127.0.0.1:4180/"), waitFor("http://127.0.0.1:4181/")]);
  const { chromium } = await import(pathToFileURL(path.resolve(agencyRoot, "../webot-platform/node_modules/playwright/index.mjs")).href);
  const browser = await chromium.launch({ headless: true });
  await mkdir(proofRoot, { recursive: true });
  for (const viewport of [{ name: "desktop", width: 1440, height: 1000 }, { name: "mobile", width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const agency = await context.newPage();
    await agency.goto("http://127.0.0.1:4180/", { waitUntil: "networkidle" });
    await revealPage(agency);
    await agency.addStyleTag({ content: ".fade-in{opacity:1!important;transform:none!important}" });
    if (await agency.locator("#agents .agent-card").count() !== 8) throw new Error(`${viewport.name}: Agency must show eight custom lanes`);
    if (!await agency.locator("#agents").getByText("separate, exact five-family offer", { exact: false }).isVisible()) throw new Error(`${viewport.name}: Agency/Studio distinction missing`);
    const agencyLinks = agency.locator("#agents .agent-card a.btn-primary");
    if (!await agency.locator("#agents .agent-card").first().isVisible()) throw new Error(`${viewport.name}: Agency cards are not visible`);
    for (let index = 0; index < await agencyLinks.count(); index += 1) {
      if (await agencyLinks.nth(index).getAttribute("href") !== "/consultation.html") throw new Error(`${viewport.name}: Agency lane bypasses consultation`);
    }
    if (await agency.locator("body").evaluate((body) => body.scrollWidth > body.clientWidth + 1)) throw new Error(`${viewport.name}: Agency overflow`);
    if (await agency.locator('form[action*="formspree.io/f/placeholder"]').count()) throw new Error(`${viewport.name}: placeholder contact endpoint exposed`);
    if (!await agency.locator('form.contact-form[action^="mailto:hello@webot.agency"]').count()) throw new Error(`${viewport.name}: contact fallback missing`);
    await agency.screenshot({ path: path.join(proofRoot, `${viewport.name}-agency.png`), fullPage: true });

    const studio = await context.newPage();
    await studio.goto("http://127.0.0.1:4181/", { waitUntil: "networkidle" });
    await revealPage(studio);
    if (await studio.locator("#agents .agent-card").count() !== 5) throw new Error(`${viewport.name}: Studio must show five certified families`);
    if (!await studio.getByRole("heading", { name: "Music & Sound", exact: true }).isVisible()) throw new Error(`${viewport.name}: Music & Sound missing`);
    if (await studio.locator("body").evaluate((body) => body.scrollWidth > body.clientWidth + 1)) throw new Error(`${viewport.name}: Studio overflow`);
    await studio.screenshot({ path: path.join(proofRoot, `${viewport.name}-studio.png`), fullPage: true });
    await context.close();
  }
  await browser.close();
  console.log(`PASS launch-surface browser proof: ${proofRoot}`);
} finally {
  for (const server of servers) if (server.pid) try { process.kill(-server.pid, "SIGTERM"); } catch {}
}

function serve(root, port) {
  return spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: root, detached: true, stdio: "ignore" });
}

async function waitFor(url) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try { if ((await fetch(url)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function revealPage(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(300, window.innerHeight * 0.7)) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
    window.scrollTo(0, 0);
  });
}
