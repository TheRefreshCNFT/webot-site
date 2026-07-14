#!/usr/bin/env node
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { extname, join, resolve, relative } from "node:path";
import { execFileSync } from "node:child_process";
import vm from "node:vm";

const siteRoot = resolve(new URL("..", import.meta.url).pathname);
const studioRoot = resolve(process.env.WEBOT_STUDIO_ROOT || "/Users/webot/Projects/webot-studio");
const liveMode = process.argv.includes("--live");
const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "Z");
const outputRoot = resolve(process.env.WEBOT_TEST_OUTPUT || `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-${timestamp}`);
const screenshotDir = join(outputRoot, "screenshots");

const playwrightPackageCandidates = [
  "/Users/webot/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.61.0/node_modules/playwright/package.json",
  "/Users/webot/.npm/_npx/0cf6ff1fad43f633/node_modules/playwright/package.json",
  "/Users/webot/.npm/_npx/420ff84f11983ee5/node_modules/playwright/package.json",
  "/Users/webot/.npm/_npx/d537ee5ee2a13f03/node_modules/playwright/package.json",
  "/Users/webot/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/package.json",
  "/Users/webot/.npm/_npx/48b1ca104c3549f4/node_modules/playwright/package.json"
];

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function logStep(message) {
  console.log(`\n== ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function runGitDiffCheck(root) {
  execFileSync("git", ["diff", "--check"], { cwd: root, stdio: "pipe" });
}

function readProjectFile(root, file) {
  return readFileSync(join(root, file), "utf8");
}

function parseJsonLd(label, html) {
  const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert(matches.length > 0, `${label}: missing JSON-LD script`);
  for (const [index, match] of matches.entries()) {
    JSON.parse(match[1]);
    console.log(`${label}: JSON-LD ${index + 1} parses`);
  }
}

function compileInlineScripts(label, html) {
  const scripts = [...html.matchAll(/<script(?![^>]*type=)(?:[^>]*)>([\s\S]*?)<\/script>/g)];
  for (const [index, match] of scripts.entries()) {
    new vm.Script(match[1], { filename: `${label}-inline-script-${index + 1}.js` });
  }
  console.log(`${label}: ${scripts.length} plain inline script(s) compile`);
}

function assertIncludes(label, haystack, needles) {
  for (const needle of needles) {
    assert(haystack.includes(needle), `${label}: missing ${needle}`);
  }
}

function assertNotIncludes(label, haystack, needles) {
  for (const needle of needles) {
    assert(!haystack.includes(needle), `${label}: should not include ${needle}`);
  }
}

function validateStaticContent() {
  logStep("Static content checks");
  runGitDiffCheck(siteRoot);
  runGitDiffCheck(studioRoot);

  const agencyHtml = readProjectFile(siteRoot, "index.html");
  const consultationHtml = readProjectFile(siteRoot, "consultation.html");
  const privacyHtml = readProjectFile(siteRoot, "privacy.html");
  const successHtml = readProjectFile(siteRoot, "success.html");
  const projectsHtml = readProjectFile(siteRoot, "projects.html");
  const agencyRobots = readProjectFile(siteRoot, "robots.txt");
  const agencySitemap = readProjectFile(siteRoot, "sitemap.xml");
  const agencyLlms = readProjectFile(siteRoot, "llms.txt");
  const studioHtml = readProjectFile(studioRoot, "index.html");
  const studioRobots = readProjectFile(studioRoot, "robots.txt");
  const studioSitemap = readProjectFile(studioRoot, "sitemap.xml");
  const studioLlms = readProjectFile(studioRoot, "llms.txt");

  parseJsonLd("Agency", agencyHtml);
  parseJsonLd("Studio", studioHtml);
  compileInlineScripts("Agency", agencyHtml);
  compileInlineScripts("Studio", studioHtml);

  assertIncludes("Agency", agencyHtml, [
    "Plan & Itinerary",
    "Vacation itinerary planner",
    "date night planner",
    "business get-together planner",
    "road trip planner",
    "<link rel=\"canonical\" href=\"https://webot.agency/\">",
    "<meta name=\"robots\" content=\"index,follow\">",
    "og:site_name",
    "twitter:description",
    "Payment + Intake",
    "Fresh Review",
    "Approval",
    "Complete"
  ]);
  assertNotIncludes("Agency", agencyHtml, ["per-job credits", "Studio credits", "marketplace credits", "credit packs", "<meta name=\"keywords\""]);
  assertIncludes("Agency consultation", consultationHtml, ["<link rel=\"canonical\" href=\"https://webot.agency/consultation.html\">", "og:title", "twitter:description"]);
  assertIncludes("Agency privacy", privacyHtml, ["<link rel=\"canonical\" href=\"https://webot.agency/privacy.html\">", "og:title", "twitter:description"]);
  assertNotIncludes("Agency privacy", privacyHtml, ["product or credit selected", "credits, subscriptions", "subscriptions, credits"]);
  assertIncludes("Agency success", successHtml, ["<meta name=\"robots\" content=\"noindex,follow\">", "<link rel=\"canonical\" href=\"https://webot.agency/success.html\">"]);
  assertIncludes("Agency projects", projectsHtml, ["<meta name=\"robots\" content=\"noindex, nofollow\">", "<link rel=\"canonical\" href=\"https://webot.agency/projects.html\">"]);

  assertIncludes("Studio", studioHtml, [
    "Create &amp; Design",
    "Music &amp; Sound",
    "Voice &amp; Audio",
    "Documents &amp; Data",
    "Research",
    "Human test desk",
    "Run Short Demo",
    "Product images - Maya",
    "Vendor comparison - Sam",
    "routeAgentFamily",
    "<meta name=\"robots\" content=\"index,follow\">",
    "og:site_name",
    "twitter:description",
    "Pilot Test",
    "Payment + Intake",
    "Agent Route",
    "Agent Draft",
    "Approval",
    "Complete"
  ]);
  assertNotIncludes("Studio", studioHtml, ["Small Job Credit", "Standard Job Credit Pack", "Deep Job Credit Pack", "job credits", "credit packs", "<meta name=\"keywords\""]);

  assert(agencySitemap.includes("<lastmod>2026-07-13</lastmod>"), "Agency homepage sitemap lastmod not updated");
  assert(!agencySitemap.includes("projects.html"), "Agency sitemap includes noindex projects.html");
  assert(!agencySitemap.includes("success.html"), "Agency sitemap includes noindex success.html");
  assert(agencyRobots.includes("Sitemap: https://webot.agency/sitemap.xml"), "Agency robots missing sitemap");
  assert(agencyLlms.includes("Plan & Itinerary"), "Agency llms.txt missing Plan & Itinerary");
  assert(studioRobots.includes("Sitemap: https://webot.studio/sitemap.xml"), "Studio robots missing sitemap");
  assert(studioSitemap.includes("https://webot.studio/"), "Studio sitemap missing root URL");
  assert(studioLlms.includes("Pilot Test: $7.50/mo"), "Studio llms.txt missing current Pilot Test summary");
  console.log("Static content checks passed");
}

function safePath(root, requestUrl) {
  const url = new URL(requestUrl, "http://127.0.0.1");
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith("/")) pathname += "index.html";
  const filePath = resolve(root, `.${pathname}`);
  if (!filePath.startsWith(root)) {
    return null;
  }
  return filePath;
}

function serveStatic(root) {
  return new Promise((resolveServer) => {
    const server = createServer((request, response) => {
      const filePath = safePath(root, request.url || "/");
      if (!filePath || !existsSync(filePath)) {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }
      const ext = extname(filePath).toLowerCase();
      response.writeHead(200, { "content-type": mimeTypes[ext] || "application/octet-stream" });
      response.end(readFileSync(filePath));
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolveServer({ server, url: `http://127.0.0.1:${port}` });
    });
  });
}

function loadPlaywright() {
  const packagePath = playwrightPackageCandidates.find((candidate) => existsSync(candidate));
  assert(packagePath, "Could not find bundled Playwright package. Update scripts/test-itinerary-flow.mjs playwrightPackageCandidates.");
  const require = createRequire(packagePath);
  return require("playwright");
}

async function auditPage(page, label, url, width, height, screenshotName) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width, height });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.screenshot({ path: join(screenshotDir, screenshotName), fullPage: true, caret: "initial" });
  const audit = await page.evaluate((pageLabel) => {
    const wrap = document.querySelector(".wrap, .container");
    const rect = wrap ? wrap.getBoundingClientRect() : { left: 0, right: innerWidth, width: innerWidth };
    return {
      innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      center: Math.round((rect.left + rect.right) / 2),
      expectedCenter: Math.round(innerWidth / 2),
      title: document.title,
      hasAgencyOffer: pageLabel.startsWith("Agency")
        ? document.body.innerText.includes("Plan & Itinerary")
        : document.body.innerText.includes("Music & Sound"),
      hasServiceText: pageLabel.startsWith("Agency")
        ? /vacation|date night|road trip|business get-together/i.test(document.body.innerText)
        : /Create & Design|Documents & Data|Voice & Audio|Research/i.test(document.body.innerText)
    };
  }, label);
  assert(audit.scrollWidth <= audit.innerWidth + 1, `${label}: overflow ${audit.scrollWidth} > ${audit.innerWidth}`);
  assert(Math.abs(audit.center - audit.expectedCenter) <= 14, `${label}: off-center ${audit.center} vs ${audit.expectedCenter}`);
  assert(audit.hasAgencyOffer, `${label}: missing current primary offer text`);
  assert(audit.hasServiceText, `${label}: missing current service-family text`);
  assert(errors.length === 0, `${label}: console/page errors: ${errors.join(" | ")}`);
  console.log(`${label}: centered, no overflow, screenshot ${screenshotName}`);
}

async function validateBrowserFlow(agencyBase, studioBase) {
  logStep("Browser interaction checks");
  mkdirSync(screenshotDir, { recursive: true });
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({ headless: true });
  try {
    const scenarios = {
      images: "Create & Design",
      brand: "Create & Design",
      pdf: "Documents & Data",
      scrape: "Documents & Data",
      decision: "Research",
      factcheck: "Research",
      voice: "Voice & Audio",
      transcript: "Voice & Audio"
    };

    for (const [label, url, width, height, screenshot] of [
      ["Agency desktop", `${agencyBase}/`, 1440, 1000, "agency-desktop.png"],
      ["Agency mobile", `${agencyBase}/`, 390, 900, "agency-mobile.png"],
      ["Studio desktop", `${studioBase}/`, 1440, 1000, "studio-desktop.png"],
      ["Studio mobile", `${studioBase}/`, 390, 900, "studio-mobile.png"]
    ]) {
      const page = await browser.newPage();
      await auditPage(page, label, url, width, height, screenshot);
      await page.close();
    }

    const routePage = await browser.newPage({ viewport: { width: 1280, height: 920 } });
    await routePage.goto(`${studioBase}/`, { waitUntil: "networkidle" });
    for (const [scenario, expectedAgent] of Object.entries(scenarios)) {
      await routePage.click(`[data-scenario="${scenario}"]`);
      await routePage.waitForTimeout(50);
      const actualAgent = (await routePage.textContent("#testAgent")).trim();
      const selectedAgent = await routePage.$eval(".agent-card.is-selected", (element) => element.dataset.agent);
      const dashboardMeta = await routePage.textContent("#dashboardMeta");
      const freshReview = await routePage.textContent("#freshReviewCard");
      assert(actualAgent === expectedAgent, `${scenario}: visible agent ${actualAgent} !== ${expectedAgent}`);
      assert(selectedAgent === expectedAgent, `${scenario}: selected card ${selectedAgent} !== ${expectedAgent}`);
      assert(dashboardMeta.includes(expectedAgent), `${scenario}: dashboard did not include ${expectedAgent}`);
      assert(/Fresh-context|Fresh/.test(freshReview), `${scenario}: missing fresh-context review`);
      console.log(`${scenario}: routed to ${expectedAgent}`);
    }

    await routePage.fill("#chatInput", "Review this code script and the spreadsheet automation formula risks.");
    await routePage.click("#chatSend");
    await routePage.waitForTimeout(50);
    const chatAgent = (await routePage.textContent("#testAgent")).trim();
    assert(chatAgent === "Documents & Data", `chat route expected Documents & Data, got ${chatAgent}`);
    await routePage.click("[data-scenario=\"images\"]");
    await routePage.click("#demoRun");
    await routePage.waitForTimeout(50);
    const demoState = await routePage.evaluate(() => ({
      status: document.querySelector("#testStatus")?.textContent || "",
      dashboard: document.querySelector("#dashboardStatus")?.textContent || "",
      customerReview: document.querySelector("#customerReviewCard")?.textContent || "",
      messages: document.querySelectorAll("#chatWindow .chat-message").length
    }));
    assert(demoState.status.includes("Short paid-flow demo complete"), `short demo status did not complete: ${demoState.status}`);
    assert(demoState.dashboard.includes("Ready for customer review"), `short demo dashboard not customer-ready: ${demoState.dashboard}`);
    assert(demoState.customerReview.includes("Ready for customer approval"), `short demo customer review not ready: ${demoState.customerReview}`);
    assert(demoState.messages >= 7, `short demo expected at least 7 chat messages, got ${demoState.messages}`);
    await routePage.screenshot({ path: join(screenshotDir, "studio-test-desk-routes.png"), fullPage: true, caret: "initial" });
    await routePage.close();

    const paymentPage = await browser.newPage({ viewport: { width: 1280, height: 920 } });
    await paymentPage.goto(`${studioBase}/?payment=confirmed&product=studio-business&session_id=test_session`, { waitUntil: "networkidle" });
    await paymentPage.waitForTimeout(120);
    const paymentState = await paymentPage.evaluate(() => ({
      title: document.querySelector("#confirmedTitle")?.textContent || "",
      text: document.querySelector("#confirmedText")?.textContent || "",
      plan: document.querySelector("#summaryPlan")?.textContent || "",
      label: document.querySelector("#paymentLabel")?.textContent || ""
    }));
    assert(paymentState.title.includes("confirmed"), "Payment return title did not confirm");
    assert(paymentState.text.includes("fresh-context review"), "Payment return copy missing fresh-context review");
    assert(paymentState.plan.trim() === "Pilot Test", `Payment return plan expected Pilot Test, got ${paymentState.plan}`);
    assert(paymentState.label.includes("Pilot Test"), `Payment return label expected Pilot Test, got ${paymentState.label}`);
    await paymentPage.screenshot({ path: join(screenshotDir, "studio-payment-confirmed.png"), fullPage: true, caret: "initial" });
    await paymentPage.close();
  } finally {
    await browser.close();
  }
}

async function main() {
  validateStaticContent();
  if (liveMode) {
    console.log("Mode: live domains");
    await validateBrowserFlow("https://webot.agency", "https://webot.studio");
  } else {
    console.log("Mode: local static servers");
    const agency = await serveStatic(siteRoot);
    const studio = await serveStatic(studioRoot);
    try {
      await validateBrowserFlow(agency.url, studio.url);
    } finally {
      agency.server.close();
      studio.server.close();
    }
  }

  logStep("Result");
  console.log(`PASS itinerary flow validation`);
  console.log(`Output: ${outputRoot}`);
  console.log(`Screenshots:`);
  for (const file of readdirSync(screenshotDir).sort()) {
    console.log(`- ${relative(process.cwd(), join(screenshotDir, file))}`);
  }
}

main().catch((error) => {
  console.error(`\nFAIL itinerary flow validation`);
  console.error(error.stack || error.message);
  process.exit(1);
});
