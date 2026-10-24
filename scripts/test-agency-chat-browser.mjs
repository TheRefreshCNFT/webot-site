import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "proof-results", "agency-chat");
const homeURL = "http://127.0.0.1:4180/";
const consultationURL = "http://127.0.0.1:4180/consultation.html";
const chatURL = "https://api.webot.agency/api/agency/chat";
const slotsURL = "https://book.webot.agency/api/slots";
const bookURL = "https://book.webot.agency/api/book";
const handoffKey = "webot.consultationHandoff.v1";
const slots = { "Tuesday, October 27": [{ time: "2026-10-27T14:00:00.000Z", label: "10:00 AM" }] };
const report = {
  status: "FAIL",
  scenarios: [],
  network: "chat and booking APIs intercepted; all other outbound traffic guarded",
  networkEvidence: { chat: [], slots: [], book: [], unexpected: [], expectedResources: [] },
  console: { pageErrors: [], unexpected: [], expectedSyntheticResources: [] },
  cleanup: { browser: "NOT_RUN", staticServer: "NOT_RUN", port: "NOT_RUN" }
};
let server;
let browser;

try {
  await assertPortFree();
  server = spawn("python3", ["-m", "http.server", "4180", "--bind", "127.0.0.1"], {
    cwd: root,
    detached: true,
    stdio: "ignore"
  });
  await waitFor(homeURL);
  assert.equal(server.exitCode, null, "Owned static server exited during startup");
  const { chromium } = await import(pathToFileURL(path.resolve(root, "../webot-platform/node_modules/playwright/index.mjs")).href);
  browser = await chromium.launch({ headless: true });
  await mkdir(output, { recursive: true });

  await supportedAudioAndApprovedHandoff();
  await boundedHistoryAndOversizedPair();
  await failedTurnAlternativesAndResponsive();
  await malformedResponsesAreSafe();
  await summaryValidationAndStorageDenial();

  assert.deepEqual(report.networkEvidence.unexpected, [], "Unexpected or unintercepted outbound request");
  assert.deepEqual(report.console.pageErrors, [], "Unexpected browser page error");
  assert.deepEqual(report.console.unexpected, [], "Unexpected browser console error");
  assert(report.networkEvidence.chat.length > 0, "Chat endpoint was not exercised");
  assert(report.networkEvidence.slots.length > 0, "Slots endpoint was not exercised");
  report.scenarios.push({
    networkGuard: "PASS",
    unexpectedConsoleErrors: 0,
    pageErrors: 0,
    expectedSyntheticResourceConsoleEntries: report.console.expectedSyntheticResources.length
  });
  report.status = "PASS";
} catch (error) {
  report.status = "FAIL";
  report.error = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  const cleanupErrors = [];
  if (browser) {
    try {
      await browser.close();
      report.cleanup.browser = "PASS";
    } catch (error) {
      cleanupErrors.push(error);
      report.cleanup.browser = "FAIL";
    }
  }
  try {
    await stopOwnedServer();
    report.cleanup.staticServer = "PASS";
  } catch (error) {
    cleanupErrors.push(error);
    report.cleanup.staticServer = "FAIL";
  }
  try {
    await assertPortFree();
    report.cleanup.port = "PASS";
  } catch (error) {
    cleanupErrors.push(error);
    report.cleanup.port = "FAIL";
  }
  if (cleanupErrors.length) {
    report.status = "FAIL";
    report.cleanupError = cleanupErrors.map((error) => error instanceof Error ? error.message : String(error)).join(" | ");
  }
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, "browser-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (cleanupErrors.length) throw cleanupErrors[0];
}

async function supportedAudioAndApprovedHandoff() {
  const page = await newPage();
  const writes = await instrumentHandoffWrites(page);
  await routeChat(page, async (body) => {
    assert(body.messages.at(-1).content.includes("audio"), "Audio question not sent");
    return json({ reply: "Audio transcription is a common fit.", fit: "common_fit", handoff: { summary: "Transcribe weekly meeting audio", requestQuote: true } });
  });
  await openChat(page);
  assert(await page.getByText("Automated capability and fit assistant", { exact: false }).isVisible());
  assert.equal(await page.evaluate((key) => sessionStorage.getItem(key), handoffKey), null);
  assert.equal(writes.length, 0, "Opening chat wrote session storage");

  await sendQuestion(page, "Can your bots use audio?", "Audio transcription is a common fit.");
  assert.equal(await page.inputValue("#handoff-summary"), "Transcribe weekly meeting audio");
  assert.equal(await page.locator(".handoff-quote").isChecked(), true);
  assert.equal(await page.evaluate(() => document.activeElement?.id), "handoff-summary", "Response handoff must focus #handoff-summary");
  assert.equal(writes.length, 0, "Revealing a handoff wrote session storage");

  const summary = "Transcribe our weekly 30-minute team meeting";
  await page.fill("#handoff-summary", summary);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(output, "chat-handoff-mobile.png"), fullPage: true });
  await page.getByRole("button", { name: "Approve and continue to booking" }).click();
  await page.waitForURL(consultationURL);
  await page.locator(".slot-btn").waitFor();
  await waitForCondition(() => writes.length === 1, "Exactly one approved handoff write");
  assert.equal(writes[0].key, handoffKey);
  assert.deepEqual(JSON.parse(writes[0].value), { version: 1, summary, requestQuote: true });
  assert.equal(await page.inputValue("#bookSummary"), summary);
  assert.equal(await page.locator("#quoteRequested").isChecked(), true);
  assert.equal(await page.evaluate((key) => sessionStorage.getItem(key), handoffKey), null, "Booking did not clear the handoff");
  assert.equal(writes.length, 1, "Handoff transferred more than once");
  report.scenarios.push({
    supportedAudio: "PASS",
    responseHandoffFocus: "#handoff-summary",
    noStorageBeforeApproval: "PASS",
    approvedSummary: "PASS",
    quoteHandoff: "PASS",
    exactlyOneTransfer: "PASS",
    bookingClearedHandoff: "PASS"
  });
  await page.close();
}

async function boundedHistoryAndOversizedPair() {
  const page = await newPage();
  const start = report.networkEvidence.chat.length;
  const oversizedReply = "X".repeat(4000);
  await routeChat(page, async (body) => {
    const question = body.messages.at(-1).content;
    if (question === "Oversized answer") return json({ reply: oversizedReply, fit: "common_fit", handoff: null });
    if (question.startsWith("count-") || question.startsWith("total-")) return json({ reply: "A".repeat(question.length), fit: "common_fit", handoff: null });
    return json({ reply: "short answer", fit: "common_fit", handoff: null });
  });
  await openChat(page);
  await sendQuestion(page, "Oversized answer", oversizedReply);
  const visibleOversized = await page.locator('.chat-message[data-role="assistant"]').last().textContent();
  assert.equal(visibleOversized, oversizedReply, "4000-character reply was not preserved in the visible log");
  assert.equal(await page.evaluate(() => document.activeElement?.id), "chat-question", "handoff:null must restore question focus");

  await sendQuestion(page, "After oversized", "short answer");
  let requests = report.networkEvidence.chat.slice(start);
  assert.deepEqual(requests.at(-1).body.messages, [{ role: "user", content: "After oversized" }], "Oversized assistant pair was not excluded");

  for (let index = 0; index < 6; index++) {
    const question = `count-${index}-${"u".repeat(492)}`;
    await sendQuestion(page, question, "A".repeat(500));
  }
  requests = report.networkEvidence.chat.slice(start);
  assert.equal(requests.at(-1).body.messages.length, 11, "Count bound did not select five complete pairs plus current user");

  for (let index = 0; index < 4; index++) {
    const question = `total-${index}-${"v".repeat(992)}`;
    await sendQuestion(page, question, "A".repeat(1000));
  }
  requests = report.networkEvidence.chat.slice(start);
  const finalMessages = requests.at(-1).body.messages;
  assert.equal(finalMessages.length, 9, "Total bound did not select only complete pairs");
  assert.equal(finalMessages.reduce((total, message) => total + message.content.length, 0), 8000);
  for (const request of requests) {
    assert(request.body.messages.every((message) => message.content !== oversizedReply), "Oversized assistant content entered a later request");
  }
  report.scenarios.push({
    boundedHistory: "PASS",
    requestsChecked: requests.length,
    maxMessagesObserved: Math.max(...requests.map((request) => request.body.messages.length)),
    countBoundObserved: 11,
    totalBoundObserved: 8000,
    oversizedReplyVisible: 4000,
    oversizedPairExcluded: "PASS",
    nullHandoffFocus: "#chat-question"
  });
  await page.close();
}

async function failedTurnAlternativesAndResponsive() {
  const page = await newPage({ scenario: "failed question", url: chatURL, status: 503 });
  await routeChat(page, async (body) => {
    const question = body.messages.at(-1).content;
    if (question === "failed question") {
      return { status: 503, contentType: "application/json", body: JSON.stringify({ error: "unavailable" }) };
    }
    return json({ reply: "short answer", fit: "common_fit", handoff: null });
  });
  await openChat(page);
  await sendQuestion(page, "first question", "short answer");
  await sendQuestion(page, "failed question");
  await page.getByText("Ask WeBot is unavailable", { exact: false }).waitFor();
  assert(await page.getByRole("button", { name: "Book directly" }).isVisible());
  assert(await page.getByRole("link", { name: "hello@webot.agency" }).first().isVisible());
  assert(await page.getByRole("link", { name: "+1 754 210 1827" }).first().isVisible());
  assert.equal(await page.locator(".handoff-form").isVisible(), false);
  assert(await page.getByText("failed question", { exact: true }).isVisible(), "Failed question disappeared from the visible log");

  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), "auto");
  for (const width of [320, 375, 414, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.evaluate(() => ({
      viewport: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth
    }));
    assert(dimensions.documentWidth <= width + 1, `${width}: document overflow`);
    assert(dimensions.bodyWidth <= width + 1, `${width}: body overflow`);
    assert(await page.getByRole("button", { name: "Send question" }).isVisible());
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(output, `chat-${width}.png`), fullPage: true });
    report.scenarios.push({ responsiveWidth: width, overflow: false, reducedMotion: "PASS" });
  }
  report.scenarios.push({ backendFailure: "PASS", alternativesRemain: "PASS", failedQuestionVisible: "PASS" });

  await page.setViewportSize({ width: 375, height: 900 });
  await sendQuestion(page, "third question", "short answer");
  const finalRequest = report.networkEvidence.chat.at(-1).body;
  assert.deepEqual(finalRequest.messages, [
    { role: "user", content: "first question" },
    { role: "assistant", content: "short answer" },
    { role: "user", content: "third question" }
  ], "Failed question entered the next successful request history");
  report.scenarios.push({ failedQuestionExcluded: "PASS" });
  await page.close();
}

async function malformedResponsesAreSafe() {
  const cases = [
    ["blank reply", { reply: " ", fit: "common_fit", handoff: null }],
    ["4001-character reply", { reply: "Z".repeat(4001), fit: "common_fit", handoff: null }],
    ["invalid fit", { reply: "Malformed reply", fit: "invalid", handoff: null }],
    ["missing handoff", { reply: "Malformed reply", fit: "common_fit" }],
    ["blank summary", { reply: "Malformed reply", fit: "common_fit", handoff: { summary: " ", requestQuote: true } }],
    ["1001-character summary", { reply: "Malformed reply", fit: "common_fit", handoff: { summary: "S".repeat(1001), requestQuote: true } }],
    ["string quote preference", { reply: "Malformed reply", fit: "common_fit", handoff: { summary: "Valid summary", requestQuote: "true" } }]
  ];
  const page = await newPage();
  let activeCase;
  await routeChat(page, async () => json(activeCase[1]));
  for (const testCase of cases) {
    activeCase = testCase;
    await openChat(page);
    await sendQuestion(page, `Malformed case: ${testCase[0]}`);
    await page.getByText("Ask WeBot is unavailable", { exact: false }).waitFor();
    assert.equal(await page.locator(".handoff-form").isVisible(), false, `${testCase[0]} revealed a handoff`);
    assert.equal(await page.getByText("Malformed reply", { exact: true }).count(), 0, `${testCase[0]} displayed the malformed reply`);
    assert(await page.getByRole("button", { name: "Book directly" }).isVisible());
    report.scenarios.push({ malformedResponse: testCase[0], safeUnavailable: "PASS", handoffHidden: "PASS" });
  }
  await page.close();
}

async function summaryValidationAndStorageDenial() {
  const page = await newPage();
  const writes = await instrumentHandoffWrites(page);
  await routeChat(page, async () => json({ reply: "Ready for review.", fit: "technical_review", handoff: { summary: "Original summary", requestQuote: true } }));
  await openChat(page);
  await sendQuestion(page, "Prepare my handoff", "Ready for review.");
  assert.equal(writes.length, 0, "Response handoff wrote storage");

  await page.fill("#handoff-summary", "");
  await page.getByRole("button", { name: "Approve and continue to booking" }).click();
  await page.getByText("Add a use-case summary before continuing.", { exact: true }).waitFor();
  assert.equal(page.url(), homeURL);
  assert.equal(writes.length, 0, "Empty summary wrote storage");
  report.scenarios.push({ emptyEditedSummary: "visible error; no storage; no navigation" });

  await page.locator("#handoff-summary").evaluate((node, value) => {
    node.value = value;
    node.dispatchEvent(new Event("input", { bubbles: true }));
  }, "E".repeat(1001));
  assert.equal(await page.locator("#handoff-summary").inputValue(), "E".repeat(1001));
  await page.getByRole("button", { name: "Approve and continue to booking" }).click();
  await page.getByText("Summary must be 1,000 characters or fewer before continuing.", { exact: true }).waitFor();
  assert.equal(page.url(), homeURL);
  assert.equal(writes.length, 0, "Oversized summary wrote storage");
  report.scenarios.push({ oversizedEditedSummary: "visible error; no storage; no navigation" });

  const preserved = "Preserve this summary";
  await page.fill("#handoff-summary", preserved);
  await page.evaluate(() => { window.__denyHandoffWrites = true; });
  await page.getByRole("button", { name: "Approve and continue to booking" }).click();
  await page.getByText("Your summary was not transferred.", { exact: false }).waitFor();
  await waitForCondition(() => writes.length === 1, "Denied handoff write attempt");
  assert.equal(page.url(), homeURL, "Denied storage navigated away");
  assert.equal(await page.inputValue("#handoff-summary"), preserved);
  assert.equal(await page.evaluate(() => document.activeElement?.id), "handoff-summary");
  assert.equal(await page.locator(".handoff-form").isVisible(), true);

  await page.getByRole("link", { name: "Continue without transferring" }).click();
  await page.waitForURL(consultationURL);
  await page.locator(".slot-btn").waitFor();
  assert.equal(await page.inputValue("#bookSummary"), "", "Fallback transferred a summary");
  assert.equal(await page.locator("#quoteRequested").isChecked(), false, "Fallback transferred a quote preference");
  assert.equal(await page.evaluate((key) => sessionStorage.getItem(key), handoffKey), null);
  assert.equal(writes.length, 1, "Fallback caused another storage write");
  report.scenarios.push({
    deniedStorageAnnounced: "PASS",
    deniedStorageSummaryPreserved: "PASS",
    deniedStorageNoNavigation: "PASS",
    deniedStorageFocus: "#handoff-summary",
    continueWithoutTransfer: "PASS"
  });
  await page.close();
}

async function newPage(expectedSyntheticResource = null) {
  const expected = expectedSyntheticResource ? { ...expectedSyntheticResource, seen: false } : null;
  const page = await browser.newPage({ viewport: { width: 375, height: 900 }, reducedMotion: "reduce" });
  page.setDefaultTimeout(10_000);
  page.on("pageerror", (error) => report.console.pageErrors.push({ url: page.url(), message: error.message }));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const entry = { text: message.text(), location: message.location() };
    const isExpected = expected && !expected.seen && entry.location.url === expected.url && entry.text.includes(`Failed to load resource: the server responded with a status of ${expected.status}`);
    if (isExpected) {
      expected.seen = true;
      report.console.expectedSyntheticResources.push({ ...entry, scenario: expected.scenario, url: expected.url, status: expected.status });
    } else {
      report.console.unexpected.push(entry);
    }
  });
  await page.route("**/*", guardOutboundTraffic);
  await page.route(slotsURL, async (route) => {
    report.networkEvidence.slots.push({ url: route.request().url(), method: route.request().method() });
    await route.fulfill(json({ success: true, slots }));
  });
  await page.route(bookURL, async (route) => {
    report.networkEvidence.book.push({ url: route.request().url(), method: route.request().method(), body: route.request().postDataJSON() });
    await route.fulfill(json({ success: true, event: { time: "Tuesday, October 27 at 10:00 AM" } }));
  });
  return page;
}

async function guardOutboundTraffic(route) {
  const request = route.request();
  const url = new URL(request.url());
  if (url.origin === new URL(homeURL).origin) return route.continue();
  if (url.origin === "https://fonts.googleapis.com") {
    report.networkEvidence.expectedResources.push({ url: request.url(), action: "empty synthetic stylesheet" });
    return route.fulfill({ status: 200, contentType: "text/css", body: "" });
  }
  report.networkEvidence.unexpected.push({ url: request.url(), method: request.method(), resourceType: request.resourceType() });
  return route.abort();
}

async function routeChat(page, responder) {
  await page.route(chatURL, async (route) => {
    const body = route.request().postDataJSON();
    report.networkEvidence.chat.push({ url: route.request().url(), method: route.request().method(), body });
    assertRequest(body);
    const response = await responder(body);
    await route.fulfill(response);
  });
}

function assertRequest(body) {
  assert(body && typeof body === "object", "Chat request body must be an object");
  assert.match(body.sessionId, /^webot_[0-9a-f-]{36}$/);
  assert(Array.isArray(body.messages), "Messages must be an array");
  assert(body.messages.length >= 1 && body.messages.length <= 12, "History exceeds 12 messages or is empty");
  assert.equal(body.messages.at(-1).role, "user", "History must end with a user message");
  let total = 0;
  body.messages.forEach((message, index) => {
    assert.equal(message.role, index % 2 === 0 ? "user" : "assistant", "History roles must alternate from user");
    assert.equal(typeof message.content, "string");
    assert(message.content.trim().length > 0, "History contains blank content");
    assert(message.content.length <= 2000, "History contains content over 2000 characters");
    total += message.content.length;
  });
  assert(total <= 8000, "History content exceeds 8000 characters");
}

async function instrumentHandoffWrites(page) {
  const writes = [];
  await page.exposeBinding("__recordHandoffWrite", (_source, entry) => { writes.push(entry); });
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (this === window.sessionStorage) {
        window.__recordHandoffWrite({ key: String(key), value: String(value) });
        if (window.__denyHandoffWrites) throw new DOMException("Synthetic sessionStorage denial", "QuotaExceededError");
      }
      return original.call(this, key, value);
    };
  });
  return writes;
}

async function openChat(page) {
  await page.goto(homeURL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Ask WeBot about your workflow" }).click();
  await page.locator("#chat-question").waitFor({ state: "visible" });
}

async function sendQuestion(page, question, expectedReply) {
  await page.fill("#chat-question", question);
  await page.getByRole("button", { name: "Send question" }).click();
  if (expectedReply) {
    await page.getByText(expectedReply, { exact: true }).last().waitFor();
  } else {
    await page.waitForFunction(() => !document.querySelector(".chat-send").disabled && document.querySelector(".chat-status").textContent !== "Sending your question…");
  }
}

function json(body) {
  return { status: 200, contentType: "application/json", body: JSON.stringify(body) };
}

async function assertPortFree() {
  await new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: "127.0.0.1", port: 4180 });
    const done = (error) => {
      socket.destroy();
      if (error) reject(error); else resolve();
    };
    socket.once("connect", () => done(new Error("Port 4180 is already occupied; refusing to reuse or kill an unknown server")));
    socket.once("error", (error) => {
      if (error.code === "ECONNREFUSED") done();
      else done(error);
    });
    socket.setTimeout(1000, () => done(new Error("Timed out checking port 4180")));
  });
}

async function stopOwnedServer() {
  if (!server?.pid || server.exitCode !== null || server.signalCode !== null) return;
  const exited = new Promise((resolve) => server.once("exit", resolve));
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
  await Promise.race([
    exited,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Owned static server did not stop after SIGTERM")), 5000))
  ]);
}

async function waitFor(target) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(target)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Timed out waiting for ${target}`);
}

async function waitForCondition(condition, description) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (condition()) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`Timed out waiting for ${description}`);
}
