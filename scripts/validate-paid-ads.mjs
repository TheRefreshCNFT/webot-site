#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const files = {
  search: resolve(root, ".handoffs/paid-ads/google-microsoft-search-rsa.csv"),
  meta: resolve(root, ".handoffs/paid-ads/meta-link-ads.csv"),
  linkedin: resolve(root, ".handoffs/paid-ads/linkedin-single-image-ads.csv")
};

const forbiddenClaims = [
  /guaranteed?/i,
  /#1/i,
  /best in the world/i,
  /instant results/i,
  /top results/i,
  /free money/i,
  /risk[- ]free/i
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    if (row.some((value) => value.length > 0)) rows.push(row);
  }

  const [headers, ...records] = rows;
  return records.map((record, index) => {
    const item = { __line: index + 2 };
    headers.forEach((header, headerIndex) => {
      item[header] = record[headerIndex] ?? "";
    });
    return item;
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertLimit(label, value, limit) {
  assert(value.length <= limit, `${label} is ${value.length}/${limit}: ${value}`);
}

function validateUrl(label, value) {
  assert(value.startsWith("https://webot.studio/") || value.startsWith("https://webot.agency/"), `${label} must use a WeBot HTTPS landing URL`);
  assert(value.includes("utm_source="), `${label} missing utm_source`);
  assert(value.includes("utm_medium="), `${label} missing utm_medium`);
  assert(value.includes("utm_campaign="), `${label} missing utm_campaign`);
  assert(value.includes("utm_content="), `${label} missing utm_content`);
}

function validateClaims(label, values) {
  const combined = values.join(" ");
  for (const claim of forbiddenClaims) {
    assert(!claim.test(combined), `${label} contains risky claim pattern ${claim}`);
  }
}

function load(name) {
  return parseCsv(readFileSync(files[name], "utf8"));
}

for (const ad of load("search")) {
  const label = `Search line ${ad.__line} ${ad.campaign}/${ad.ad_group}`;
  validateUrl(`${label} landing_url`, ad.landing_url);
  assertLimit(`${label} path1`, ad.path1, 15);
  assertLimit(`${label} path2`, ad.path2, 15);
  const headlines = [];
  const descriptions = [];
  for (let i = 1; i <= 15; i += 1) {
    const value = ad[`headline_${i}`];
    assert(value, `${label} missing headline_${i}`);
    assertLimit(`${label} headline_${i}`, value, 30);
    headlines.push(value);
  }
  for (let i = 1; i <= 4; i += 1) {
    const value = ad[`description_${i}`];
    assert(value, `${label} missing description_${i}`);
    assertLimit(`${label} description_${i}`, value, 90);
    descriptions.push(value);
  }
  validateClaims(label, [...headlines, ...descriptions]);
}

for (const ad of load("meta")) {
  const label = `Meta line ${ad.__line} ${ad.campaign}/${ad.ad_set}`;
  validateUrl(`${label} landing_url`, ad.landing_url);
  assertLimit(`${label} primary_text`, ad.primary_text, 125);
  assertLimit(`${label} headline`, ad.headline, 40);
  assertLimit(`${label} description`, ad.description, 30);
  validateClaims(label, [ad.primary_text, ad.headline, ad.description]);
}

for (const ad of load("linkedin")) {
  const label = `LinkedIn line ${ad.__line} ${ad.campaign}/${ad.ad_set}`;
  validateUrl(`${label} landing_url`, ad.landing_url);
  assertLimit(`${label} intro_text`, ad.intro_text, 150);
  assertLimit(`${label} headline`, ad.headline, 70);
  assertLimit(`${label} description`, ad.description, 70);
  validateClaims(label, [ad.intro_text, ad.headline, ad.description]);
}

console.log("PASS paid ads validation");
console.log(`Search ads: ${load("search").length}`);
console.log(`Meta ads: ${load("meta").length}`);
console.log(`LinkedIn ads: ${load("linkedin").length}`);
