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
