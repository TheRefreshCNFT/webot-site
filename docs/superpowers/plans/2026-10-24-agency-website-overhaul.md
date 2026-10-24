# Agency Website Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy Studio-led Agency homepage with the approved Signal-designed SMB automation consultancy while preserving payment, contact, legal, and operational routes.

**Architecture:** Keep the canonical static site build-free. A complete `index.html` owns semantic content and metadata; root `tokens.css` owns the Signal system; `css/site.css` and `js/site.js` consolidate shared presentation and navigation behavior. Node's built-in test runner checks static contracts, and the existing Platform Playwright installation supplies local browser evidence without adding project dependencies.

**Tech Stack:** Semantic HTML, OKLCH CSS custom properties, vanilla JavaScript, Node 22 `node:test`, Playwright already installed in `webot-platform`.

**Linked tracks:** [Booking consultation](2026-10-24-booking-consultation.md) owns the booking form and real 30-minute service. [Ask WeBot chat](2026-10-24-agency-chat.md) owns the chat API, browser client, and handoff. This track creates only the shared tokens/styles those tracks consume.

## Global Constraints

- Canonical root: `/Users/webot/Projects/webot-site`; branch at planning: `master`; planning documentation HEAD: `f1a7fc5`.
- Preserve static HTML/CSS/JavaScript; no framework, package manager, `package.json`, or build step.
- Lead with exactly **“Need to streamline your flow? We Bot You.”** and the free 30-minute consultation.
- Primary navigation: **What We Automate · Our Work · Process · Skill Packs · FAQ · Book a Call**.
- Visual system: modern-minimal; Split Studio; custom Signal; carbon, warm white, sharp lime; Bricolage Grotesque display; Geist body; compact floating navigation; statement footer.
- Use a token-based OKLCH palette and 4-point spacing. No gradient text, stock robots, fake browser/IDE chrome, fabricated dashboards, decorative metrics, glassmorphism, or unnecessary animation.
- Do not invent testimonials, metrics, client results, capability claims, screenshots, or proof captions.
- Studio is only the client review/testing environment with optional hosting/support. Do not present a public Studio sales journey or claim client subdomains already exist.
- Preserve these Stripe URLs byte-for-byte: `https://buy.stripe.com/fZueVc2MDe0s2YJbjh2880s`, `https://buy.stripe.com/5kQ3cu5YP9Kc1UF1IH2880r`, `https://buy.stripe.com/14A6oGaf5aOg8j35YX2880q`.
- Do not alter Stripe products/prices, publish, submit payments, add tracking, or run outbound campaigns.
- Preserve unrelated dirty `.handoffs/REFLECTIONS.md` and `serena-socraticode-investigation-report.md`; do not stage them.
- The owner explicitly approved deleting exactly `create-polish.html`, `document-extraction.html`, `code-automation.html`, `research-decisions.html`, and `plan-itinerary.html`. Delete no other page or historical evidence.
- Publication is a separately authorized guarded release. Local acceptance never claims live deployment.

## File Map

- Create `tokens.css`: complete Signal color, font, spacing, type, radius, easing, and duration tokens.
- Create `css/site.css`: shared homepage, navigation, proof, footer, legal, and responsive rules.
- Create `js/site.js`: mobile disclosure and native FAQ behavior only.
- Modify `index.html`: approved content, real-proof figures, metadata, structured data, and unchanged checkout links.
- Create `assets/proof/discord-community-agent.png`: admitted owner-approved Discord capture.
- Create `assets/proof/mls-lead-platform.png`: admitted owner-approved MLS capture.
- Create `scripts/test-agency-static.mjs`: source, metadata, route, offer, and protected-link checks.
- Create `scripts/test-agency-browser.mjs`: local responsive, keyboard, reduced-motion, and screenshot harness.
- Modify `consultation.html`, `privacy.html`, `terms.html`: shared stylesheet links and verified public copy; booking-specific behavior belongs to the linked booking plan.
- Modify `llms.txt`, `sitemap.xml`: current offer and indexable routes only.
- Leave `robots.txt` unchanged unless a new route is added; this plan adds none.
- Delete exactly the five approved obsolete pages listed above.

---

### Task 1: Lock the Signal token and layout contract

**Files:**
- Create: `tokens.css`
- Create: `css/site.css`
- Create: `scripts/test-agency-static.mjs`

**Interfaces:**
- Consumes: approved Signal spec; no runtime dependencies.
- Produces: CSS custom properties `--color-*`, `--font-*`, `--space-*`, `--text-*`, `--ease-*`, `--dur-*`, `--rule-*`, and `--radius-*`; shared classes `.site-nav`, `.nav-toggle`, `.split`, `.proof-figure`, `.statement-footer`, and `.flow-content`.

- [ ] **Step 1: Write the failing static contract test**

Create `scripts/test-agency-static.mjs` with this initial suite. Later tasks append to the same file rather than creating parallel test runners.

```js
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
```

- [ ] **Step 2: Run the test and confirm the missing-system failure**

Run: `node --test scripts/test-agency-static.mjs`

Expected: FAIL with `ENOENT` for `tokens.css`; no browser or network starts.

- [ ] **Step 3: Add the complete token file**

Create `tokens.css`:

```css
/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V4
 * Hallmark · macrostructure: Split Studio · tone: technical, direct · anchor hue: sharp-lime
 * theme: custom (vibe: "capable direct approachable practical" · paper oklch(13% 0.01 110) · accent oklch(88% 0.22 125) lime · Bricolage Grotesque + Geist)
 * axes: dark / geometric-humanist-sans / chromatic-lime
 */
:root {
  color-scheme: dark;
  --color-paper: oklch(13% 0.01 110);
  --color-paper-raised: oklch(17% 0.012 110);
  --color-paper-soft: oklch(21% 0.014 110);
  --color-ink: oklch(96% 0.01 100);
  --color-ink-soft: oklch(79% 0.015 105);
  --color-ink-muted: oklch(68% 0.015 105);
  --color-accent: oklch(88% 0.22 125);
  --color-accent-ink: oklch(18% 0.035 125);
  --color-accent-soft: oklch(25% 0.045 125);
  --color-error: oklch(72% 0.17 28);
  --color-success: oklch(82% 0.16 145);
  --color-focus: oklch(88% 0.22 125);
  --color-rule: oklch(96% 0.01 100 / 14%);
  --color-rule-strong: oklch(96% 0.01 100 / 26%);
  --font-display: "Bricolage Grotesque", sans-serif;
  --font-body: "Geist", sans-serif;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 2rem;
  --text-4xl: clamp(2.25rem, 5vw, 4rem);
  --text-display-s: clamp(2.5rem, 6vw, 4.75rem);
  --text-display: clamp(3rem, 7vw, 6rem);
  --radius-sm: 0.375rem;
  --radius-md: 0.75rem;
  --radius-lg: 1.25rem;
  --rule: 1px solid var(--color-rule);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-fast: 120ms;
  --dur-base: 180ms;
}
```

- [ ] **Step 4: Add the shared stylesheet**

Create `css/site.css` with all rules below. Colors and fonts remain token references; only layout numbers appear inline.

```css
@import url("../tokens.css");

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: var(--space-24); }
html,
body { margin: 0; max-width: 100%; overflow-x: clip; }
body {
  min-width: 320px;
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
body.nav-open { overflow: hidden; }
img { display: block; max-width: 100%; height: auto; }
a { color: inherit; text-decoration-thickness: 1px; text-underline-offset: 0.2em; }
button, input, textarea { font: inherit; }
button, a { -webkit-tap-highlight-color: transparent; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.55; }
:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 4px; }
h1, h2, h3, p, figure { margin: 0; }
h1, h2, h3 {
  min-width: 0;
  overflow-wrap: anywhere;
  font-family: var(--font-display);
  font-style: normal;
  line-height: 1.02;
  letter-spacing: -0.035em;
}
h1 { max-width: 13ch; font-size: var(--text-display-s); }
h2 { max-width: 18ch; font-size: var(--text-4xl); }
h3 { font-size: var(--text-2xl); line-height: 1.15; }
p { max-width: 65ch; color: var(--color-ink-soft); }
ul, ol { margin: 0; padding: 0; }
[hidden] { display: none !important; }
.skip-link { position: fixed; left: var(--space-4); top: var(--space-4); z-index: 200; transform: translateY(-200%); }
.skip-link:focus { transform: translateY(0); }
.container { width: min(1120px, calc(100% - 2 * var(--space-6))); margin-inline: auto; min-width: 0; }
.flow-content { width: min(760px, calc(100% - 2 * var(--space-6))); margin-inline: auto; padding-block: var(--space-16); }
.flow-content section { padding-block: var(--space-6); }
.flow-content h1 { margin-bottom: var(--space-6); }
.flow-content h2 { margin-bottom: var(--space-4); font-size: var(--text-3xl); }
.flow-content p, .flow-content li { color: var(--color-ink-soft); }
.flow-content li { margin-left: var(--space-5); margin-bottom: var(--space-2); }
.site-nav {
  position: sticky;
  top: var(--space-3);
  z-index: 100;
  width: min(1180px, calc(100% - 2 * var(--space-4)));
  min-height: 64px;
  margin: var(--space-3) auto 0;
  padding: var(--space-2) var(--space-3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  background: var(--color-paper-raised);
  border: var(--rule);
  border-radius: var(--radius-md);
}
.brand { font-family: var(--font-display); font-size: var(--text-xl); font-weight: 750; text-decoration: none; white-space: nowrap; }
.brand-mark { color: var(--color-accent); }
.nav-links { display: flex; align-items: center; gap: var(--space-5); list-style: none; }
.nav-links a { display: inline-flex; align-items: center; min-height: 44px; color: var(--color-ink-soft); font-size: var(--text-sm); text-decoration: none; white-space: nowrap; }
.nav-links a:hover { color: var(--color-ink); }
.nav-toggle { display: none; width: 44px; height: 44px; border: var(--rule); border-radius: var(--radius-sm); background: transparent; color: var(--color-ink); }
.button {
  min-height: 44px;
  padding: var(--space-3) var(--space-5);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  transition: transform var(--dur-fast) var(--ease-out), background-color var(--dur-fast) var(--ease-out);
}
.button:hover { transform: translateY(-1px); }
.button:active { transform: translateY(0); }
.button-primary { background: var(--color-accent); color: var(--color-accent-ink); }
.button-secondary { border-color: var(--color-rule-strong); background: transparent; color: var(--color-ink); }
.button-small { padding: var(--space-2) var(--space-4); font-size: var(--text-sm); }
.hero { padding-block: var(--space-24) var(--space-20); }
.split { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); gap: var(--space-16); align-items: center; }
.hero-copy { display: grid; gap: var(--space-6); min-width: 0; }
.hero-copy > p { font-size: var(--text-lg); }
.actions { display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center; }
.contact-line { display: flex; flex-wrap: wrap; gap: var(--space-4); font-size: var(--text-sm); }
.contact-line a { min-height: 44px; display: inline-flex; align-items: center; }
.hero-proof { padding: var(--space-6); background: var(--color-paper-raised); border: var(--rule); border-radius: var(--radius-lg); }
.hero-proof strong { display: block; margin-bottom: var(--space-3); font-family: var(--font-display); font-size: var(--text-2xl); }
.hero-proof p + p { margin-top: var(--space-3); }
.section { padding-block: var(--space-20); border-top: var(--rule); }
.section-heading { display: grid; gap: var(--space-4); margin-bottom: var(--space-10); }
.problem-list, .automation-list, .process-list, .pack-list { list-style: none; }
.problem-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-6); }
.problem-list li { padding-top: var(--space-4); border-top: 2px solid var(--color-accent); }
.automation-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-8) var(--space-12); }
.automation-list h3 { margin-bottom: var(--space-2); font-size: var(--text-xl); }
.automation-list a { display: inline-flex; align-items: center; min-height: 44px; margin-top: var(--space-2); color: var(--color-accent); }
.proof-grid { display: grid; gap: var(--space-12); }
.proof-figure { min-width: 0; }
.proof-figure img { width: 100%; border: var(--rule); border-radius: var(--radius-sm); }
.proof-figure figcaption { display: grid; gap: var(--space-3); padding-top: var(--space-4); }
.proof-figure figcaption p { font-size: var(--text-sm); }
.process-list { counter-reset: process; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-6); }
.process-list li { counter-increment: process; }
.process-list li::before { content: counter(process); display: block; margin-bottom: var(--space-4); color: var(--color-accent); font-family: var(--font-display); font-size: var(--text-3xl); }
.process-list h3 { margin-bottom: var(--space-3); font-size: var(--text-xl); }
.pack-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-5); }
.pack-list li { min-width: 0; padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); background: var(--color-paper-raised); border: var(--rule); border-radius: var(--radius-md); }
.pack-list .button { margin-top: auto; align-self: flex-start; }
.pack-note { margin-bottom: var(--space-6); }
.faq-list { border-top: var(--rule); }
.faq-list details { border-bottom: var(--rule); }
.faq-list summary { min-height: 56px; padding-block: var(--space-4); display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); cursor: pointer; font-weight: 700; }
.faq-list details p { padding: 0 0 var(--space-5); }
.final-cta { padding-block: var(--space-20); display: grid; gap: var(--space-6); }
.statement-footer { padding-block: var(--space-12); border-top: var(--rule); }
.footer-grid { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--space-8); align-items: end; }
.footer-statement { font-family: var(--font-display); font-size: var(--text-4xl); line-height: 1; }
.footer-links { display: flex; flex-wrap: wrap; gap: var(--space-4); list-style: none; }
.footer-links a { min-height: 44px; display: inline-flex; align-items: center; color: var(--color-ink-soft); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

@media (max-width: 900px) {
  .nav-toggle { display: inline-flex; align-items: center; justify-content: center; }
  .nav-links { position: fixed; inset: 80px var(--space-4) auto; padding: var(--space-5); display: none; flex-direction: column; align-items: stretch; gap: var(--space-2); background: var(--color-paper-raised); border: var(--rule); border-radius: var(--radius-md); }
  .nav-links[data-open="true"] { display: flex; }
  .nav-links a { width: 100%; white-space: normal; }
  .split { grid-template-columns: minmax(0, 1fr); gap: var(--space-10); }
  .problem-list, .process-list, .pack-list { grid-template-columns: minmax(0, 1fr); }
  .hero { padding-block: var(--space-16); }
}

@media (max-width: 600px) {
  .container { width: min(100% - 2 * var(--space-4), 1120px); }
  .flow-content { width: min(100% - 2 * var(--space-4), 760px); }
  .site-nav > .button { display: none; }
  .automation-list { grid-template-columns: minmax(0, 1fr); }
  .section { padding-block: var(--space-16); }
  .actions { align-items: stretch; flex-direction: column; }
  .actions .button { width: 100%; white-space: normal; }
  .footer-grid { grid-template-columns: minmax(0, 1fr); align-items: start; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 150ms !important; }
  .button:hover, .button:active { transform: none; }
}
```

- [ ] **Step 5: Run the token/layout test**

Run: `node --test scripts/test-agency-static.mjs`

Expected: PASS, `1` test.

- [ ] **Step 6: Commit the design system**

```bash
git add tokens.css css/site.css scripts/test-agency-static.mjs
git commit -m "feat: add Agency Signal design system"
```

---

### Task 2: Replace the homepage content and metadata

**Files:**
- Modify: `index.html` (complete page replacement; no unrelated pages)
- Modify: `scripts/test-agency-static.mjs`

**Interfaces:**
- Consumes: `tokens.css`, `css/site.css`, and the approved business copy.
- Produces: section IDs `automate`, `work`, `process`, `skill-packs`, `faq`; chat mount `ask-webot`; unchanged Stripe anchors with `data-checkout-id` values `microsoft`, `google`, `complete`.

- [ ] **Step 1: Add failing content, metadata, and protected-link tests**

Append to `scripts/test-agency-static.mjs`:

```js
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
  assert.equal(service.offers.priceSpecification, undefined);
  assert.ok(!JSON.stringify(data).includes("Plan & Itinerary"));
  assert.ok(!JSON.stringify(data).includes("Studio subscriptions"));
  assert.match(html, /<meta name="description" content="WeBot designs, builds, and supports practical AI automations for small and medium businesses\. Book a free 30-minute consultation\.">/);
});
```

- [ ] **Step 2: Run the expanded suite and verify legacy-content failure**

Run: `node --test scripts/test-agency-static.mjs`

Expected: the Signal test passes; homepage tests FAIL on the old eight-lane content and checkout markup.

- [ ] **Step 3: Replace `index.html` with the approved page**

Use this complete page. Before saving, confirm no production file other than `index.html` is being replaced.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="WeBot designs, builds, and supports practical AI automations for small and medium businesses. Book a free 30-minute consultation.">
  <meta name="robots" content="index,follow">
  <meta name="theme-color" content="#171914">
  <link rel="canonical" href="https://webot.agency/">
  <meta property="og:title" content="WeBot Agency | Practical AI Automation for Your Business">
  <meta property="og:description" content="Need to streamline your flow? We Bot You. Book a free 30-minute consultation.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://webot.agency/">
  <meta property="og:site_name" content="WeBot Agency">
  <meta property="og:image" content="https://webot.agency/assets/og-webot-agency.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="WeBot Agency | Practical AI Automation">
  <meta name="twitter:description" content="Custom AI automation, built around the way your business works.">
  <meta name="twitter:image" content="https://webot.agency/assets/og-webot-agency.png">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,650;12..96,750&amp;family=Geist:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/site.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://webot.agency/#organization",
        "name": "WeBot Agency",
        "url": "https://webot.agency/",
        "email": "hello@webot.agency",
        "telephone": "+1-754-210-1827",
        "logo": "https://webot.agency/apple-touch-icon.png",
        "parentOrganization": { "@type": "Organization", "name": "F5 Products LLC" },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "sales",
          "email": "hello@webot.agency",
          "telephone": "+1-754-210-1827",
          "areaServed": "US",
          "availableLanguage": "English"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://webot.agency/#website",
        "url": "https://webot.agency/",
        "name": "WeBot Agency",
        "publisher": { "@id": "https://webot.agency/#organization" }
      },
      {
        "@type": "Service",
        "@id": "https://webot.agency/#automation-service",
        "name": "WeBot custom AI automation",
        "provider": { "@id": "https://webot.agency/#organization" },
        "serviceType": "Custom AI automation consulting and implementation",
        "areaServed": "US",
        "description": "Consultation, workflow scoping, implementation, client review, deployment, handoff, and optional hosting and support."
      },
      {
        "@type": "FAQPage",
        "@id": "https://webot.agency/#faq-schema",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How much does a custom automation cost?",
            "acceptedAnswer": { "@type": "Answer", "text": "Custom work is priced by quote after WeBot understands the workflow, deliverables, timeline, and support required. The first 30-minute consultation is free." }
          },
          {
            "@type": "Question",
            "name": "Can I review the automation before launch?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes. WeBot can review the automation with you in WeBot Studio, then hand it off, deploy it, or optionally host and support it." }
          }
        ]
      }
    ]
  }
  </script>
  <title>WeBot Agency | Practical AI Automation for Your Business</title>
  <script src="/js/site.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-nav" aria-label="Primary navigation">
    <a class="brand" href="/" aria-label="WeBot Agency home">We<span class="brand-mark">Bot</span></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links">Menu</button>
    <ul class="nav-links" id="nav-links">
      <li><a href="#automate">What We Automate</a></li>
      <li><a href="#work">Our Work</a></li>
      <li><a href="#process">Process</a></li>
      <li><a href="#skill-packs">Skill Packs</a></li>
      <li><a href="#faq">FAQ</a></li>
    </ul>
    <a class="button button-primary button-small" href="/consultation.html">Book a Call</a>
  </header>

  <main id="main">
    <section class="hero">
      <div class="container split">
        <div class="hero-copy">
          <h1>Need to streamline your flow? We Bot You.</h1>
          <p>We design, build, and support practical AI automations for small and medium businesses—built around your tools, your files, and the work your team repeats.</p>
          <div class="actions">
            <a class="button button-primary" href="/consultation.html">Book a free 30-minute consultation</a>
            <a class="button button-secondary" href="#work">See our work</a>
          </div>
          <div class="contact-line">
            <a href="tel:+17542101827">Call +1 754 210 1827</a>
            <a href="mailto:hello@webot.agency">hello@webot.agency</a>
          </div>
        </div>
        <aside class="hero-proof" aria-label="How WeBot works">
          <strong>Your workflow, made workable.</strong>
          <p>Bring the repetitive steps, disconnected tools, or backlog that keeps growing. We will help determine what is worth automating and what is not.</p>
          <p>Custom work is scoped and quoted after a free consultation. No instant estimates and no one-size-fits-all package.</p>
        </aside>
      </div>
    </section>

    <section class="section" aria-labelledby="problems-title">
      <div class="container">
        <div class="section-heading">
          <h2 id="problems-title">The work that keeps getting in the way.</h2>
        </div>
        <ul class="problem-list">
          <li><h3>Too much repetitive computer work.</h3><p>Copying, sorting, renaming, checking, and moving information by hand.</p></li>
          <li><h3>Tools that do not connect.</h3><p>Files, inboxes, websites, and business systems holding separate pieces of the same job.</p></li>
          <li><h3>More work than capacity.</h3><p>A growing workload that needs a dependable system before it needs another full-time hire.</p></li>
        </ul>
      </div>
    </section>

    <section class="section" id="automate" aria-labelledby="automate-title">
      <div class="container">
        <div class="section-heading">
          <h2 id="automate-title">What we automate.</h2>
          <p>These are common starting points, not rigid packages. We shape the workflow around your actual process.</p>
        </div>
        <ul class="automation-list">
          <li><h3>Document processing and OCR</h3><p>Read PDFs, scans, forms, and invoices; extract the fields you need; produce structured files.</p><a href="/consultation.html">Discuss document work</a></li>
          <li><h3>Web research and structured information</h3><p>Collect permitted public information, compare sources, and deliver an organized brief or dataset.</p><a href="/consultation.html">Discuss research work</a></li>
          <li><h3>Lead capture and follow-up</h3><p>Route inquiries, organize lead details, and prepare consistent follow-up for your review.</p><a href="/consultation.html">Discuss lead workflows</a></li>
          <li><h3>File and back-office operations</h3><p>Rename, sort, convert, validate, and move files through repeatable directory and admin processes.</p><a href="/consultation.html">Discuss back-office work</a></li>
          <li><h3>Image enhancement and bulk processing</h3><p>Prepare, improve, resize, and export image sets with a defined review step.</p><a href="/consultation.html">Discuss image workflows</a></li>
          <li><h3>Custom repeatable computer workflows</h3><p>Connect the steps, tools, checks, and handoffs that make your process dependable.</p><a href="/consultation.html">Describe your workflow</a></li>
        </ul>
      </div>
    </section>

    <section class="section" id="work" aria-labelledby="work-title">
      <div class="container">
        <div class="section-heading">
          <h2 id="work-title">Real systems. Real operating views.</h2>
          <p>No staged dashboards or invented outcomes. These captures show the systems; the captions explain only what they demonstrate.</p>
        </div>
        <div class="proof-grid">
          <figure class="proof-figure">
            <img src="/assets/proof/discord-community-agent.png" width="1440" height="900" loading="lazy" alt="Approved Discord view showing WeBot community-agent activity">
            <figcaption>
              <h3>Community-agent activity in Discord</h3>
              <p>A WeBot agent participating in a real Discord workflow. This view demonstrates the operating interface and agent activity; it is not a claim about response volume or business results.</p>
            </figcaption>
          </figure>
          <figure class="proof-figure">
            <img src="/assets/proof/mls-lead-platform.png" width="1440" height="900" loading="lazy" alt="Approved view of WeBot's live MLS lead-generation platform">
            <figcaption>
              <h3>MLS lead-generation platform</h3>
              <p>A live WeBot platform that organizes MLS lead-generation work. Behind the interface, agents handle defined research and processing steps before information reaches the review surface.</p>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section class="section" id="process" aria-labelledby="process-title">
      <div class="container">
        <div class="section-heading"><h2 id="process-title">A clear path from idea to working system.</h2></div>
        <ol class="process-list">
          <li><h3>Talk:</h3><p>Start with a free 30-minute consultation about the work and the result you need.</p></li>
          <li><h3>Scope:</h3><p>We recommend the workflow, deliverables, timeline, and quote.</p></li>
          <li><h3>Build and review:</h3><p>We implement the automation and review it with you in WeBot Studio.</p></li>
          <li><h3>Launch:</h3><p>We hand it off, deploy it, or optionally host and support it.</p></li>
        </ol>
      </div>
    </section>

    <section class="section" id="skill-packs" aria-labelledby="packs-title">
      <div class="container">
        <div class="section-heading">
          <h2 id="packs-title">Prefer to run it yourself?</h2>
          <p>Skill packs are installable, self-serve instructions for supported AI tools. They are separate from custom automation: you install and operate them; WeBot does not run your work.</p>
        </div>
        <ul class="pack-list">
          <li>
            <h3>Microsoft Office Skill Pack</h3>
            <p>Five packs: Excel Expert, Word Pro, PowerPoint Presenter, Outlook Organizer, and Teams Coordinator. For buyers who want guided AI assistance across Microsoft Office.</p>
            <p>Includes the five listed skill packs and their supplied instructions. Compatibility depends on the AI tool and Office environment you use.</p>
            <a class="button button-secondary" href="https://buy.stripe.com/fZueVc2MDe0s2YJbjh2880s" data-checkout-id="microsoft">Get the Microsoft pack — $19</a>
          </li>
          <li>
            <h3>Google Workspace Skill Pack</h3>
            <p>Five packs: Sheets Expert, Docs Pro, Slides Designer, Gmail Master, and Workspace Admin. For buyers who work primarily in Google Workspace.</p>
            <p>Includes the five listed skill packs and their supplied instructions. Review generated work before using it in your business.</p>
            <a class="button button-secondary" href="https://buy.stripe.com/5kQ3cu5YP9Kc1UF1IH2880r" data-checkout-id="google">Get the Google pack — $19</a>
          </li>
          <li>
            <h3>Complete Office Collection</h3>
            <p>All ten Microsoft and Google packs in one purchase. Best for buyers who regularly move between both suites.</p>
            <p>This is a self-serve product, not monthly Studio access, custom development, hosting, or a done-for-you automation.</p>
            <a class="button button-primary" href="https://buy.stripe.com/14A6oGaf5aOg8j35YX2880q" data-checkout-id="complete">Get all ten packs — $29</a>
          </li>
        </ul>
      </div>
    </section>

    <section class="section" id="faq" aria-labelledby="faq-title">
      <div class="container">
        <div class="section-heading"><h2 id="faq-title">Straight answers before we talk.</h2></div>
        <div class="faq-list">
          <details><summary>How much does custom automation cost?</summary><p>Custom work is priced by quote after we understand the workflow, deliverables, timeline, and support required. The first 30-minute consultation is free.</p></details>
          <details><summary>What can you automate?</summary><p>Repeatable digital work is often a good starting point: documents, research, lead handling, files, images, and connected back-office steps. Feasibility depends on your tools, access, exceptions, and review requirements. We will tell you when a workflow needs technical review or is not a fit.</p></details>
          <details><summary>What happens to my files?</summary><p>We use the information and files you provide to scope and deliver the work. Handling depends on the agreed workflow and providers. Do not send confidential or sensitive material through the website chat; we can discuss an appropriate intake path during scoping. See the privacy policy for current website handling.</p></details>
          <details><summary>Can I review it before launch?</summary><p>Yes. We can review the automation with you in WeBot Studio. Studio is the review and testing environment here, not a separate product you need to buy.</p></details>
          <details><summary>Can you host or maintain it?</summary><p>Optional hosting and support can be included in the scope and quote. Handoff and deployment options are agreed before launch.</p></details>
          <details><summary>Are skill packs the same as custom automation?</summary><p>No. Skill packs are self-serve products you install and operate. Custom automation is scoped, built, reviewed, and optionally supported by WeBot.</p></details>
          <details><summary>What happens on the first call?</summary><p>We discuss the current steps, tools, volume, desired result, timing, and constraints. You can also request a project quote when you book. We will recommend a next step rather than give an instant estimate.</p></details>
        </div>
      </div>
    </section>

    <section class="section" id="ask-webot" aria-labelledby="ask-title">
      <div class="container split">
        <div class="section-heading">
          <h2 id="ask-title">Not sure if your workflow fits?</h2>
          <p>Ask WeBot is an automated first-line assistant for capability and fit questions. It does not provide pricing. For a detailed answer, book a call or email us.</p>
        </div>
        <div id="chat-mount" data-chat-endpoint="https://api.webot.agency/api/agency/chat">
          <noscript><p>Ask WeBot needs JavaScript. You can still <a href="tel:+17542101827">call</a>, <a href="mailto:hello@webot.agency">email</a>, or <a href="/consultation.html">book directly</a>.</p></noscript>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container final-cta">
        <h2>Let’s make the work flow better.</h2>
        <p>Bring the process that takes too much time. Leave the first call with a clearer next step.</p>
        <div><a class="button button-primary" href="/consultation.html">Book a free 30-minute consultation</a></div>
      </div>
    </section>
  </main>

  <footer class="statement-footer">
    <div class="container footer-grid">
      <div><div class="footer-statement">We Bot You.</div><p>Practical AI automation for real work.</p></div>
      <ul class="footer-links">
        <li><a href="tel:+17542101827">Phone</a></li>
        <li><a href="mailto:hello@webot.agency">Email</a></li>
        <li><a href="/privacy.html">Privacy</a></li>
        <li><a href="/terms.html">Terms</a></li>
      </ul>
    </div>
  </footer>
  <script src="/js/chat.js" defer></script>
</body>
</html>
```

The proof captions above are the maximum permitted wording. During Task 3, narrow them if the admitted capture does not visibly support a statement. Do not strengthen them with outcomes or counts.

- [ ] **Step 4: Add the minimal navigation script**

Create `js/site.js`:

```js
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector("#nav-links");

if (toggle && links) {
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    links.dataset.open = String(open);
    document.body.classList.toggle("nav-open", open);
    toggle.textContent = open ? "Close" : "Menu";
  };

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  links.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
}
```

- [ ] **Step 5: Run static tests and syntax checks**

Run: `node --test scripts/test-agency-static.mjs && node --check js/site.js`

Expected: all static tests PASS and `node --check` exits `0`. The proof images are not opened by this test; Task 3 admits them.

- [ ] **Step 6: Commit the homepage**

```bash
git add index.html js/site.js scripts/test-agency-static.mjs
git commit -m "feat: reposition Agency around custom automation"
```

---

### Task 3: Admit real proof captures before browser acceptance

**Files:**
- Create: `assets/proof/discord-community-agent.png`
- Create: `assets/proof/mls-lead-platform.png`
- Modify: `index.html` only if owner review narrows a caption or alt text
- Create: `proof-results/agency-overhaul/proof-review.md`

**Interfaces:**
- Consumes: owner-approved Discord and MLS source captures selected during implementation.
- Produces: two local public images with a reviewed source/caption/confidentiality receipt.

- [ ] **Step 1: Add failing image-admission checks**

Append to `scripts/test-agency-static.mjs`:

```js
import { existsSync, statSync } from "node:fs";

test("real proof assets are present and bounded", () => {
  for (const path of ["assets/proof/discord-community-agent.png", "assets/proof/mls-lead-platform.png"]) {
    const url = new URL(`../${path}`, import.meta.url);
    assert.equal(existsSync(url), true, `${path} is not admitted`);
    assert.ok(statSync(url).size > 10_000, `${path} is unexpectedly small`);
    assert.ok(statSync(url).size < 3_000_000, `${path} exceeds the public image budget`);
  }
});
```

- [ ] **Step 2: Run the test and confirm missing captures stop the track**

Run: `node --test scripts/test-agency-static.mjs`

Expected: FAIL naming each capture that has not been admitted. Do not substitute generated, stock, or fabricated imagery.

- [ ] **Step 3: Copy and inspect only owner-approved captures**

Copy the selected approved Discord capture to `assets/proof/discord-community-agent.png` and the selected approved MLS capture to `assets/proof/mls-lead-platform.png`. If either source has not been supplied and approved, stop this task and keep the implementation unaccepted rather than inventing evidence.

Inspect both final images at full resolution. Confirm: no private names, email addresses, phone numbers, access tokens, customer records, confidential URLs, unrelated notifications, or unsupported performance figures. Resize/compress derivatives only; never overwrite the source capture. Keep each public derivative below 3 MB and record its actual pixel dimensions; update the HTML `width`/`height` attributes to those dimensions.

- [ ] **Step 4: Record human caption and confidentiality review**

Create `proof-results/agency-overhaul/proof-review.md`:

```markdown
# Agency proof review

Date: 2026-10-24
Result: PASS

## Discord community agent
- Public derivative: `assets/proof/discord-community-agent.png`
- Source approved by owner: yes
- Full-resolution confidentiality review: PASS
- Visible activity supports the published caption: PASS
- Outcome, volume, and performance claims added: none
- Final dimensions: record the admitted pixel width and height

## MLS lead-generation platform
- Public derivative: `assets/proof/mls-lead-platform.png`
- Source approved by owner: yes
- Full-resolution confidentiality review: PASS
- Visible platform view supports the published caption: PASS
- Behind-the-scenes wording checked against the owning implementation: PASS
- Outcome, volume, and performance claims added: none
- Final dimensions: record the admitted pixel width and height
```

Replace the two dimension instruction lines with actual numbers before marking PASS. If any review line cannot be affirmed, set `Result: BLOCKED`, narrow or remove the unsupported content, and repeat review.

- [ ] **Step 5: Verify image admission and exact asset references**

Run: `node --test scripts/test-agency-static.mjs`

Expected: all tests PASS.

- [ ] **Step 6: Commit admitted evidence**

```bash
git add assets/proof/discord-community-agent.png assets/proof/mls-lead-platform.png index.html proof-results/agency-overhaul/proof-review.md scripts/test-agency-static.mjs
git commit -m "docs: admit reviewed Agency operating proof"
```

---

### Task 4: Align secondary pages, crawler surfaces, and retire approved routes

**Files:**
- Modify: `consultation.html`, `privacy.html`, `terms.html`
- Modify: `llms.txt`, `sitemap.xml`
- Modify: `scripts/test-agency-static.mjs`
- Delete: `create-polish.html`
- Delete: `document-extraction.html`
- Delete: `code-automation.html`
- Delete: `research-decisions.html`
- Delete: `plan-itinerary.html`

**Interfaces:**
- Consumes: shared `css/site.css`; implemented chat behavior described in the linked chat plan.
- Produces: indexable routes `/`, `/consultation.html`, `/privacy.html`, `/terms.html`; no obsolete route or Studio subscription copy.

- [ ] **Step 1: Add failing route and policy tests**

Append to `scripts/test-agency-static.mjs`:

```js
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
```

- [ ] **Step 2: Run and confirm obsolete-route/privacy failures**

Run: `node --test scripts/test-agency-static.mjs`

Expected: FAIL because the five pages and old crawler/policy claims still exist.

- [ ] **Step 3: Update public summaries and sitemap**

Replace `llms.txt`:

```text
# WeBot Agency

> WeBot Agency designs, builds, and supports practical AI automations for small and medium businesses.

Canonical site: https://webot.agency/
Contact: hello@webot.agency
Phone: +1-754-210-1827

## Primary pages

- [Homepage](https://webot.agency/): custom AI automation consulting, implementation, client review, deployment, handoff, and optional hosting/support.
- [Consultation](https://webot.agency/consultation.html): free 30-minute consultation with an optional project-quote request.
- [Privacy](https://webot.agency/privacy.html): website, consultation, Ask WeBot, payment, and active-work data handling.
- [Terms](https://webot.agency/terms.html): custom work, skill packs, payments, customer responsibilities, and acceptable use.

## Offers

Custom automation is scoped and priced by quote. Common starting points include document processing and OCR, permitted web research and structured information, lead capture and follow-up, file/back-office operations, image enhancement and bulk processing, and repeatable computer workflows.

WeBot Studio is the client review/testing environment, not a separate public sales journey. Clients may choose handoff, deployment, or optional hosting/support.

Self-serve Microsoft Office and Google Workspace skill packs remain available from the homepage. They are installable products, not custom automation or monthly access.

## Search

The canonical sitemap is https://webot.agency/sitemap.xml. Search Console submission is not claimed by this file.
```

Replace `sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://webot.agency/</loc><lastmod>2026-10-24</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://webot.agency/consultation.html</loc><lastmod>2026-10-24</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://webot.agency/privacy.html</loc><lastmod>2026-10-24</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <url><loc>https://webot.agency/terms.html</loc><lastmod>2026-10-24</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>
</urlset>
```

- [ ] **Step 4: Apply shared styling and verified policy copy**

In each of `consultation.html`, `privacy.html`, and `terms.html`, remove the old inline palette/style block, add the same font links used by `index.html`, and add `<link rel="stylesheet" href="/css/site.css">`. Preserve canonical URLs, favicons, and noindex rules on unrelated routes.

For `privacy.html` and `terms.html`, use `<main class="flow-content">` with semantic `h1`/`h2` sections. Preserve the CrazyCade and payment sections unchanged. Replace only the Agency web sections with these verified statements:

```html
<section>
  <h2>Ask WeBot and consultation requests</h2>
  <p>Ask WeBot is an automated first-line assistant. Messages you type are sent to WeBot's server-side assistant so it can answer. The chat endpoint does not write a transcript database. Standard infrastructure logs may still record technical request metadata. Do not include confidential, sensitive, or payment information in chat.</p>
  <p>If you explicitly choose a booking or quote handoff, the approved use-case summary is stored in this browser tab's session storage until the consultation page reads and clears it. Booking sends your name, email, selected time, automation summary, and quote-request intent to the booking service so Google Calendar and Gmail can create the invitation and confirmation.</p>
  <p>We retain consultation and active-engagement information only as needed for the relationship, support, and applicable legal, tax, or dispute records. Contact us to request access or deletion.</p>
</section>
<section>
  <h2>When you browse webot.agency</h2>
  <p>Standard hosting and security logs may record IP address, browser type, referring URL, and request metadata for abuse prevention and aggregate traffic analysis. The site uses Google Analytics; its current measurement behavior is subject to Google's own privacy terms. We do not sell browsing data or use it to build advertising profiles.</p>
</section>
```

Remove the false consultation-CRM sentence, the old “no third-party tracking cookies” sentence, and the blanket “we do not use your data to train machine learning models” claim unless each current provider and operational path has separately verified it. Do not replace them with a stronger retention promise.

Add to `terms.html` under “Payments and scope”:

```html
<p>Custom work is scoped and priced by quote. The initial 30-minute consultation is free and does not create an instant estimate or a commitment to build. Skill packs are self-serve products and are separate from custom automation, hosting, and support.</p>
```

For `consultation.html`, change only shared head/style links in this track. The linked booking plan owns all duration, form, script, quote, and handoff changes.

- [ ] **Step 5: Delete exactly the approved obsolete pages**

Run:

```bash
git rm create-polish.html document-extraction.html code-automation.html research-decisions.html plan-itinerary.html
```

Expected: Git stages exactly those five deletions. Do not remove their historical evidence, `seo-audit/` captures, assets, or unrelated pages.

- [ ] **Step 6: Verify route, metadata, and link contracts**

Run:

```bash
node --test scripts/test-agency-static.mjs
python3 - <<'PY'
from pathlib import Path
from html.parser import HTMLParser
class Links(HTMLParser):
    def __init__(self): super().__init__(); self.links=[]
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in {'href','src'} and value: self.links.append(value)
for file in ['index.html','consultation.html','privacy.html','terms.html']:
    parser=Links(); parser.feed(Path(file).read_text())
    for link in parser.links:
        if link.startswith('/') and not link.startswith('//'):
            target=Path(link.split('#')[0].split('?')[0].lstrip('/')) or Path('index.html')
            if not target.suffix: target=target/'index.html'
            assert target.exists(), f'{file}: broken {link}'
print('PASS local HTML links')
PY
git diff --check
```

Expected: all tests PASS, `PASS local HTML links`, and no `git diff --check` output.

- [ ] **Step 7: Commit route and policy alignment**

```bash
git add consultation.html privacy.html terms.html llms.txt sitemap.xml scripts/test-agency-static.mjs
git add -u create-polish.html document-extraction.html code-automation.html research-decisions.html plan-itinerary.html
git commit -m "refactor: retire legacy Agency service lanes"
```

---

### Task 5: Produce human-style responsive and keyboard evidence

**Files:**
- Create: `scripts/test-agency-browser.mjs`
- Create: `proof-results/agency-overhaul/*.png`
- Create: `proof-results/agency-overhaul/browser-report.json`

**Interfaces:**
- Consumes: completed static pages and admitted proof images; existing Platform Playwright installation.
- Produces: deterministic local screenshots and assertions at 320, 375, 414, 768, and 1440 px.

- [ ] **Step 1: Write the browser harness before claiming responsive acceptance**

Create `scripts/test-agency-browser.mjs`:

```js
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
      assert.equal(errors.length, 0, `${width}: ${errors.join(" | ")}`);
      assert(await page.getByRole("heading", { name: "Need to streamline your flow? We Bot You." }).isVisible());
      assert(await page.getByRole("link", { name: "Book a free 30-minute consultation" }).first().isVisible());
      const smallButtons = await page.locator("a.button, button").evaluateAll((nodes) => nodes.filter((node) => {
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.height < 44;
      }).length);
      assert.equal(smallButtons, 0, `${width}: interactive target below 44px`);
      await page.screenshot({ path: path.join(output, `homepage-${width}.png`), fullPage: true });
      report.viewports.push({ width, overflow: false, errors: [] });
      await page.close();
    }

    const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
    await page.goto("http://127.0.0.1:4180/", { waitUntil: "networkidle" });
    const menu = page.getByRole("button", { name: "Menu" });
    await menu.focus();
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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitFor(url) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try { if ((await fetch(url)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Timed out waiting for ${url}`);
}
```

- [ ] **Step 2: Run the browser harness**

Run: `node scripts/test-agency-browser.mjs`

Expected: PASS report; screenshots for all five widths; no persistent Python, Node, or Playwright process after exit. Before chat implementation, `/js/chat.js` may produce a local 404 console message; Task 6 of the linked chat plan must rerun this harness after that file exists and require zero console errors as well as zero page errors.

- [ ] **Step 3: Perform visual review of the actual screenshots**

Open `homepage-320.png`, `homepage-375.png`, `homepage-414.png`, `homepage-768.png`, and `homepage-1440.png`. Confirm readable type, uncropped proof, no two-line primary CTA, no horizontal scroll, no overlay collision, clear lime restraint, and visible focus. If any fails, fix only the owning CSS/HTML and rerun Step 2.

- [ ] **Step 4: Run final static and workspace checks**

Run:

```bash
node --test scripts/test-agency-static.mjs
node --check js/site.js
node scripts/test-agency-browser.mjs
git diff --check
git status --short
```

Expected: all tests PASS; only in-scope changes plus preserved unrelated dirt are listed. Do not run `scripts/test-launch-surface.mjs` or `scripts/test-itinerary-flow.mjs` as acceptance for the redesign: both assert the retired eight-lane offer and Studio flows. Their replacement is this track's harness; do not edit Studio.

- [ ] **Step 5: Commit verified website evidence**

```bash
git add scripts/test-agency-browser.mjs proof-results/agency-overhaul
git commit -m "test: verify responsive Agency overhaul"
```

## Acceptance and Closeout

This track is locally accepted only when all static tests and the browser harness pass, all five screenshots receive human visual review, both proof captures pass confidentiality/caption review, and the final diff preserves all three checkout URLs and unrelated files. Booking and chat remain separately unaccepted until their linked plans pass. Do not publish.

### Spec coverage review

- Sections 2–4 and 7–9: Tasks 1–5 cover positioning, page flow, Signal design, process, skill packs, FAQ, accessibility, responsiveness, metadata, and proof.
- Section 8: Tasks 4–5 cover shared assets, policy/crawler alignment, exact five deletions, and protected payment links.
- Section 5: linked booking plan owns the real duration and quote behavior.
- Section 6: linked chat plan owns the real endpoint, assistant UI, privacy implementation, and handoff.
- Section 10: integrated acceptance and final documentation occur only after all three tracks pass; publication remains excluded.

### Placeholder and consistency review

- Public proof cannot be accepted until actual owner-approved captures are present; the tests fail closed instead of inventing evidence.
- `data-checkout-id` values, section IDs, CSS imports, image paths, and proof output paths match across tests and implementation.
- `js/chat.js` and the `sessionStorage` handoff are defined only in the linked chat plan; this plan does not duplicate their contract.
