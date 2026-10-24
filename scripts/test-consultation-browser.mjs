import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "proof-results", "agency-booking");
const url = "http://127.0.0.1:4180/consultation.html";
const report = {
  status: "FAIL",
  scenarios: [],
  network: "local static and expected resources allowed; booking APIs intercepted; all other outbound traffic guarded",
  networkEvidence: { intercepted: [], unexpected: [], expectedResources: [] },
  console: { pageErrors: [], unexpected: [], expectedSyntheticResources: [] },
  cleanup: "NOT_RUN"
};
const slot = { time: "2026-10-27T14:00:00.000Z", label: "10:00 AM" };
const slots = { "Tuesday, October 27": [slot] };
const pageEvidence = new WeakMap();
let server;

try {
  await assertPortFree();
  server = spawn("python3", ["-m", "http.server", "4180", "--bind", "127.0.0.1"], {
    cwd: root,
    detached: true,
    stdio: "ignore"
  });
  await waitFor(url);
  assert.equal(server.exitCode, null, "Owned static server exited during startup");
  const { chromium } = await import(pathToFileURL(path.resolve(root, "../webot-platform/node_modules/playwright/index.mjs")).href);
  const browser = await chromium.launch({ headless: true });
  await mkdir(output, { recursive: true });
  try {
    for (const width of [320, 375, 414, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      attachErrorEvidence(page, `responsive ${width}`);
      let posted = null;
      await guardOutboundNetwork(page);
      await page.route("https://book.webot.agency/api/slots", (route) => intercept(route, json({ success: true, slots })));
      await page.route("https://book.webot.agency/api/book", async (route) => {
        posted = route.request().postDataJSON();
        await intercept(route, json({ success: true, event: { time: "Tuesday, October 27 at 10:00 AM", meetLink: "https://meet.google.com/test-only" } }));
      });
      await page.goto(url, { waitUntil: "networkidle" });
      assert(await page.getByText("Book a free 30-minute consultation.", { exact: false }).first().isVisible());
      assert.equal(await page.locator("#quoteRequested").isChecked(), false);
      assert.equal(await page.locator("#quoteGuidance").isVisible(), false);
      assert.equal(await page.locator("#bookBtn").isDisabled(), true);
      assert.equal(await page.locator("#successScreen").isVisible(), false);
      await page.locator("#quoteRequested").check();
      assert.equal(await page.locator("#quoteGuidance").isVisible(), true);
      for (const text of ["repetitive steps", "apps, websites, files, or systems", "How often", "output or finished result", "deadline or budget range"]) {
        assert(await page.getByText(text, { exact: false }).isVisible());
      }
      await page.fill("#bookName", "Alex");
      await page.fill("#bookEmail", "alex@example.test");
      await page.fill("#bookSummary", "Sort invoices every Friday");
      await page.locator(".slot-btn").click();
      assert.equal(await page.locator("#bookBtn").isEnabled(), true);
      const dimensions = await page.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
        columns: getComputedStyle(document.querySelector("#bookingForm")).gridTemplateColumns
      }));
      assert(dimensions.scroll <= dimensions.width + 1, `${width}: horizontal overflow`);
      if (width <= 768) assert.equal(dimensions.columns.split(" ").length, 1, `${width}: booking layout must be one column`);
      if (width === 375) {
        await page.locator("#bookBtn").click();
        await page.locator("#successScreen").waitFor({ state: "visible" });
        assert.deepEqual(posted, {
          name: "Alex",
          email: "alex@example.test",
          summary: "Sort invoices every Friday\n\nProject quote requested: Yes",
          slotTime: slot.time
        });
        assert.equal(await page.evaluate(() => document.activeElement?.id), "successScreen", "Successful booking must focus #successScreen");
        report.quoteSummary = posted.summary;
        report.successFocus = "PASS";
      }
      await page.screenshot({ path: path.join(output, `consultation-${width}.png`), fullPage: true });
      const consoleEvidence = assertNoUnexpectedErrors(page);
      report.scenarios.push({ width, result: "PASS", quotePosted: width === 375, successFocused: width === 375, console: consoleEvidence });
      await page.close();
    }

    const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
    attachErrorEvidence(page, "handoff");
    await guardOutboundNetwork(page);
    await page.addInitScript(() => sessionStorage.setItem("webot.consultationHandoff.v1", JSON.stringify({ version: 1, summary: "Prepare a weekly lead list", requestQuote: true })));
    await page.route("https://book.webot.agency/api/slots", (route) => intercept(route, json({ success: true, slots })));
    await page.route("https://book.webot.agency/api/book", (route) => intercept(route, json({ success: false })));
    await page.goto(url, { waitUntil: "networkidle" });
    assert.equal(await page.inputValue("#bookSummary"), "Prepare a weekly lead list");
    assert.equal(await page.locator("#quoteRequested").isChecked(), true);
    assert.equal(await page.evaluate(() => sessionStorage.getItem("webot.consultationHandoff.v1")), null);
    report.scenarios.push({ handoff: "PASS" });

    setScenario(page, "noAvailability");
    await page.unroute("https://book.webot.agency/api/slots");
    await page.route("https://book.webot.agency/api/slots", (route) => intercept(route, json({ success: true, slots: {} })));
    await page.reload({ waitUntil: "networkidle" });
    assert(await page.getByText("No available times", { exact: false }).isVisible());
    assert.equal(await page.locator("#successScreen").isVisible(), false);
    report.scenarios.push({ noAvailability: "PASS" });

    setScenario(page, "loadFailure");
    await page.unroute("https://book.webot.agency/api/slots");
    await page.route("https://book.webot.agency/api/slots", (route) => intercept(route, { status: 500, contentType: "application/json", body: JSON.stringify({ success: false }) }));
    await page.reload({ waitUntil: "networkidle" });
    assert(await page.getByText("Could not load available times", { exact: false }).isVisible());
    assert(await page.locator("#slotPicker").getByRole("link", { name: "email hello@webot.agency" }).isVisible());
    report.scenarios.push({ loadFailure: "PASS" });

    setScenario(page, "loadingState");
    await page.unroute("https://book.webot.agency/api/slots");
    await page.route("https://book.webot.agency/api/slots", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await intercept(route, json({ success: true, slots }));
    });
    const navigation = page.goto(url, { waitUntil: "networkidle" });
    await page.getByText("Loading available times", { exact: false }).waitFor({ state: "visible" });
    await navigation;
    await page.locator(".slot-btn").waitFor();
    report.scenarios.push({ loadingState: "PASS" });

    setScenario(page, "validation");
    await page.unroute("https://book.webot.agency/api/book");
    await page.route("https://book.webot.agency/api/book", (route) => intercept(route, { status: 500, contentType: "application/json", body: JSON.stringify({ success: false, error: "Synthetic booking failure" }) }));
    await page.fill("#bookName", "Alex");
    await page.fill("#bookEmail", "not-an-email");
    await page.fill("#bookSummary", "Sort invoices every Friday");
    await page.locator(".slot-btn").click();
    assert.equal(await page.locator("#bookBtn").isDisabled(), true);
    await page.fill("#bookEmail", "alex@example.test");
    assert.equal(await page.locator("#bookBtn").isEnabled(), true);
    await page.locator("#bookBtn").click();
    await page.locator("#formError").waitFor({ state: "visible" });
    assert.equal(await page.locator("#formError").textContent(), "Synthetic booking failure");
    assert.equal(await page.locator("#bookingForm").isVisible(), true);
    assert.equal(await page.locator("#successScreen").isVisible(), false);
    report.scenarios.push({ validation: "PASS", bookingFailureDoesNotShowSuccess: "PASS" });

    setScenario(page, "staleSlot");
    await page.unroute("https://book.webot.agency/api/book");
    await page.route("https://book.webot.agency/api/book", (route) => intercept(route, { status: 409, contentType: "application/json", body: JSON.stringify({ success: false, error: "This slot is no longer available. Please pick another." }) }));
    await page.locator("#bookBtn").click();
    await page.getByText("This slot is no longer available", { exact: false }).waitFor();
    await page.locator(".slot-btn").waitFor();
    assert.equal(await page.locator(".slot-btn.selected").count(), 0);
    assert.equal(await page.locator("#bookBtn").isDisabled(), true);
    assert.equal(await page.locator("#successScreen").isVisible(), false);
    report.scenarios.push({ staleSlot: "PASS" });
    const consoleEvidence = assertNoUnexpectedErrors(page);
    report.scenarios.push({ laterPageConsole: consoleEvidence });
    await page.close();
    assert.deepEqual(report.networkEvidence.unexpected, [], "Unexpected/unintercepted outbound request");
    assert.deepEqual(report.console.pageErrors, [], "Unexpected browser page error");
    assert.deepEqual(report.console.unexpected, [], "Unexpected browser console error");
    assert.equal(report.console.expectedSyntheticResources.length, 3, "Expected synthetic 500/409 resource-console entries were not classified exactly once");
    assert(report.networkEvidence.intercepted.some((entry) => entry.endsWith("/api/slots")));
    assert(report.networkEvidence.intercepted.some((entry) => entry.endsWith("/api/book")));
    report.status = "PASS";
  } finally {
    await browser.close();
  }
} catch (error) {
  report.status = "FAIL";
  report.error = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  let cleanupError;
  try {
    await stopOwnedServer();
    await assertPortFree();
    report.cleanup = "PASS";
  } catch (error) {
    cleanupError = error;
    report.status = "FAIL";
    report.cleanup = "FAIL";
    report.cleanupError = error instanceof Error ? error.message : String(error);
  }
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, "browser-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (cleanupError) throw cleanupError;
}

function json(body) {
  return { status: 200, contentType: "application/json", body: JSON.stringify(body) };
}

async function intercept(route, response) {
  const requestURL = route.request().url();
  report.networkEvidence.intercepted.push(requestURL);
  const evidence = pageEvidence.get(route.request().frame().page());
  if (response.status >= 400) {
    evidence.expectedFailures.push({ scenario: evidence.scenario, url: requestURL, status: response.status, seen: false });
  }
  await route.fulfill(response);
}

function attachErrorEvidence(page, scenario) {
  const evidence = { scenario, pageErrors: [], unexpected: [], expectedSyntheticResources: [], expectedFailures: [] };
  pageEvidence.set(page, evidence);
  page.on("pageerror", (error) => {
    const entry = { scenario: evidence.scenario, url: page.url(), message: error.message };
    evidence.pageErrors.push(entry);
    report.console.pageErrors.push(entry);
  });
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const location = message.location();
    const text = message.text();
    const expected = evidence.expectedFailures.find((failure) => !failure.seen && failure.url === location.url && text.includes(`Failed to load resource: the server responded with a status of ${failure.status}`));
    const entry = { scenario: expected?.scenario ?? evidence.scenario, text, location };
    if (expected) {
      expected.seen = true;
      const expectedEntry = { ...entry, url: expected.url, status: expected.status };
      evidence.expectedSyntheticResources.push(expectedEntry);
      report.console.expectedSyntheticResources.push(expectedEntry);
    } else {
      evidence.unexpected.push(entry);
      report.console.unexpected.push(entry);
    }
  });
}

function setScenario(page, scenario) {
  pageEvidence.get(page).scenario = scenario;
}

function assertNoUnexpectedErrors(page) {
  const evidence = pageEvidence.get(page);
  assert.deepEqual(evidence.pageErrors, [], `${evidence.scenario}: unexpected page errors`);
  assert.deepEqual(evidence.unexpected, [], `${evidence.scenario}: unexpected console errors`);
  return {
    pageErrors: evidence.pageErrors,
    unexpected: evidence.unexpected,
    expectedSyntheticResources: evidence.expectedSyntheticResources
  };
}

async function guardOutboundNetwork(page) {
  await page.route("**/*", (route) => {
    const request = route.request();
    const requestURL = new URL(request.url());
    if (requestURL.origin === new URL(url).origin) return route.continue();
    if (requestURL.origin === "https://fonts.googleapis.com") {
      report.networkEvidence.expectedResources.push({ url: request.url(), action: "empty synthetic stylesheet" });
      return route.fulfill({ status: 200, contentType: "text/css", body: "" });
    }
    report.networkEvidence.unexpected.push({ url: request.url(), method: request.method(), resourceType: request.resourceType() });
    return route.abort();
  });
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
