import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Signal tokens and shared responsive rules are locked", () => {
  const tokens = read("tokens.css");
  const css = read("css/site.css");
  assert.match(tokens, /Hallmark · macrostructure: Split Studio/);
  assert.match(tokens, /--color-paper:\s*oklch\(13% 0\.01 110\)/);
  assert.match(tokens, /--color-ink:\s*oklch\(96% 0\.01 100\)/);
  assert.match(tokens, /--color-accent:\s*oklch\(88% 0\.22 125\)/);
  assert.match(tokens, /--font-display:\s*"Bricolage Grotesque"/);
  assert.match(tokens, /--font-body:\s*"Geist"/);
  assert.match(css, /@import url\("\.\.\/tokens\.css"\)/);
  assert.match(css, /html,\s*\nbody\s*\{[^}]*overflow-x:\s*clip/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(css, /overflow-x:\s*hidden|font-style:\s*italic|linear-gradient|radial-gradient/);
});

test("homepage follows the approved offer and preserves payment routes", () => {
  const html = read("index.html");
  assert.match(html, /Need to streamline your flow\? We Bot You\./);
  assert.match(html, /Book a free 30-minute consultation/);
  for (const id of ["automate", "work", "process", "skill-packs", "faq", "ask-webot"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  for (const text of ["Document processing and OCR", "Web research and structured information", "Lead capture and follow-up", "File and back-office operations", "Image enhancement and bulk processing", "Custom repeatable computer workflows"]) {
    assert.ok(html.includes(text), `missing ${text}`);
  }
  assert.match(html, /Talk:/);
  assert.match(html, /Scope:/);
  assert.match(html, /Build and review:/);
  assert.match(html, /Launch:/);
  assert.match(html, /assets\/proof\/discord-community-agent\.png/);
  assert.match(html, /assets\/proof\/mls-lead-platform\.png/);
  assert.match(html, /assets\/proof\/crm-conversation-tracking\.png/);
  assert.doesNotMatch(html, /Create & Polish|Gather & Extract|Plan & Itinerary|free 15-minute|newsletter|gradient/);
  const links = [...html.matchAll(/<a[^>]+href="(https:\/\/buy\.stripe\.com\/[^"]+)"[^>]*data-checkout-id="([^"]+)"/g)]
    .map((match) => [match[2], match[1]]);
  assert.deepEqual(links, [
    ["microsoft", "https://buy.stripe.com/fZueVc2MDe0s2YJbjh2880s"],
    ["google", "https://buy.stripe.com/5kQ3cu5YP9Kc1UF1IH2880r"],
    ["complete", "https://buy.stripe.com/14A6oGaf5aOg8j35YX2880q"]
  ]);
});

test("metadata and structured data describe only the implemented offer", () => {
  const html = read("index.html");
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(blocks.length, 1);
  const data = JSON.parse(blocks[0][1]);
  const service = data["@graph"].find((item) => item["@type"] === "Service");
  assert.equal(service.serviceType, "Custom AI automation consulting and implementation");
  assert.equal(service.offers?.priceSpecification, undefined);
  assert.ok(!JSON.stringify(data).includes("Plan & Itinerary"));
  assert.ok(!JSON.stringify(data).includes("Studio subscriptions"));
  assert.match(html, /<meta name="description" content="WeBot designs, builds, and supports practical AI automations for small and medium businesses, and private Home AI Setup on your own machine\. Book a free 30-minute consultation\.">/);
});

import { existsSync, statSync } from "node:fs";

test("real proof assets are present and bounded", () => {
  for (const path of ["assets/proof/discord-community-agent.png", "assets/proof/mls-lead-platform.png", "assets/proof/crm-conversation-tracking.png"]) {
    const url = new URL(`../${path}`, import.meta.url);
    assert.equal(existsSync(url), true, `${path} is not admitted`);
    assert.ok(statSync(url).size > 10_000, `${path} is unexpectedly small`);
    assert.ok(statSync(url).size < 3_000_000, `${path} exceeds the public image budget`);
  }
});

test("retired pages and references are gone", () => {
  for (const path of ["create-polish.html", "document-extraction.html", "code-automation.html", "research-decisions.html", "plan-itinerary.html"]) {
    assert.equal(existsSync(new URL(`../${path}`, import.meta.url)), false, `${path} must be retired`);
  }
  for (const path of ["index.html", "llms.txt", "sitemap.xml"]) {
    const source = read(path);
    for (const retired of ["create-polish", "document-extraction", "code-automation", "research-decisions", "plan-itinerary"]) {
      assert.ok(!source.includes(retired), `${path} retains ${retired}`);
    }
  }
});

test("crawler and policy surfaces match implemented behavior", () => {
  const llms = read("llms.txt");
  const sitemap = read("sitemap.xml");
  const privacy = read("privacy.html");
  const terms = read("terms.html");
  assert.match(llms, /free 30-minute consultation/);
  assert.doesNotMatch(llms, /Studio subscriptions|Pilot Test|eight broader/);
  assert.equal([...sitemap.matchAll(/<loc>/g)].length, 4);
  assert.match(sitemap, /<lastmod>2026-10-24<\/lastmod>/);
  assert.match(privacy, /Ask WeBot/);
  assert.match(privacy, /does not write a transcript database/);
  assert.doesNotMatch(privacy, /We do not use third-party tracking cookies/);
  assert.match(terms, /Custom work is scoped and priced by quote/);
});

test("consultation success screen starts hidden and is programmatically focusable", () => {
  const html = read("consultation.html");
  assert.match(html, /<section id="successScreen"[^>]*tabindex="-1"[^>]*hidden>/);
});

test("consultation uses the shared and dedicated stylesheets with an external module", () => {
  const html = read("consultation.html");
  const css = read("css/consultation.css");
  assert.match(html, /<link rel="stylesheet" href="\/css\/site\.css">/);
  assert.match(html, /<link rel="stylesheet" href="\/css\/consultation\.css">/);
  assert.match(html, /<script type="module" src="\/js\/consultation\.mjs"><\/script>/);
  assert.doesNotMatch(html, /<style|<script(?![^>]*type="module")/);
  assert.match(css, /\.booking-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1\.2fr\) minmax\(0, 0\.8fr\)/s);
  assert.match(css, /@media \(max-width: 780px\)\s*\{\s*\.booking-grid\s*\{\s*grid-template-columns:\s*minmax\(0, 1fr\)/s);
  assert.match(css, /\.slot-btn\s*\{[^}]*min-height:\s*44px/s);
});

test("OCR showcase has stable replaceable artwork and honest generic copy", () => {
  const html = read("index.html");
  const automate = html.indexOf('id="automate"');
  const ocr = html.indexOf('id="ocr-showcase"');
  const work = html.indexOf('id="work"');
  assert.ok(automate >= 0 && automate < ocr && ocr < work, "OCR showcase must follow automate and precede work");
  const section = html.slice(ocr, work);
  assert.match(section, /From document pile to structured data\./);
  assert.match(section, /src="\/assets\/ocr\/source-document\.png" width="1440" height="900"/);
  assert.match(section, /src="\/assets\/ocr\/structured-output\.png" width="1440" height="900"/);
  assert.match(section, /alt="Invoice document prepared for OCR processing\."/);
  assert.match(section, /alt="Structured fields extracted from an invoice\."/);
  assert.match(section, /href="\/consultation\.html"/);
  assert.doesNotMatch(section, /in development|coming soon|accuracy|%|upload|customer results/i);
});

test("OCR artwork and responsive layout preserve practical text legibility", () => {
  const generator = read("scripts/generate-ocr-artwork.py");
  const css = read("css/site.css");
  assert.match(generator, /KEY_SIZE = 64/);
  assert.match(generator, /DETAIL_SIZE = 60/);
  assert.ok((generator.match(/size=KEY_SIZE/g) ?? []).length >= 5, "source keys, heading, and repeated output keys must use the large artwork type");
  assert.match(css, /@media \(max-width: 1023px\) \{\s*\.ocr-flow \{ grid-template-columns: minmax\(0, 1fr\);/);
});

test("Home AI Setup lane is present, receptionist-level, and price-free", () => {
  const index = read("index.html");
  const consultation = read("consultation.html");
  const llms = read("llms.txt");
  assert.match(index, /id="home-ai-setup"/);
  assert.match(index, /home-lab enthusiasts, privacy-minded families, and power users/);
  assert.match(index, /one-time reviewed job/);
  assert.match(index, /optional monthly check-ins?/i);
  const homeSection = index.slice(index.indexOf('id="home-ai-setup"'), index.indexOf('id="work"'));
  assert.doesNotMatch(homeSection, /\$|\d+\s*(GB|TB|VRAM|RAM)\s*\$|price:|cost:/i);
  assert.doesNotMatch(homeSection, /Ollama|LM Studio|MLX|RustDesk|Kimi|Claude|Home Assistant|Whisper|PiPER/i);
  assert.match(consultation, /id="laneHome"/);
  assert.match(consultation, /id="bookSkill"/);
  assert.match(consultation, /id="bookOs"/);
  assert.match(consultation, /id="bookFormFactor"/);
  assert.match(llms, /Home AI Setup/);
  assert.match(llms, /one-time reviewed job/);
  assert.match(llms, /optional monthly check-in retainer/);
});
