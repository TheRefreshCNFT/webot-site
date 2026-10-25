import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { consumeConsultationHandoff, HANDOFF_KEY, LANES } from '../js/consultation-handoff.mjs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

function storage(value) {
  return {
    value,
    getItem(key) { assert.equal(key, HANDOFF_KEY); return this.value; },
    removeItem(key) { assert.equal(key, HANDOFF_KEY); this.value = null; }
  };
}

test('valid handoff is consumed once', () => {
  const target = storage(JSON.stringify({ version: 1, summary: 'Sort invoices every Friday', requestQuote: true }));
  assert.deepEqual(consumeConsultationHandoff(target), { summary: 'Sort invoices every Friday', requestQuote: true });
  assert.equal(target.value, null);
});

test('invalid, oversized, and non-quote handoffs fail closed and clear', () => {
  for (const value of ['{', JSON.stringify({ version: 1, summary: '', requestQuote: true }), JSON.stringify({ version: 1, summary: 'x'.repeat(4001), requestQuote: true })]) {
    const target = storage(value);
    assert.equal(consumeConsultationHandoff(target), null);
    assert.equal(target.value, null);
  }
  const noQuote = storage(JSON.stringify({ version: 1, summary: 'Discuss research', requestQuote: false }));
  assert.deepEqual(consumeConsultationHandoff(noQuote), { summary: 'Discuss research', requestQuote: false });
});

test('storage read failures fail closed and still attempt removal', () => {
  let removedKey = null;
  const target = {
    getItem(key) { assert.equal(key, HANDOFF_KEY); throw new Error('Storage read denied'); },
    removeItem(key) { removedKey = key; }
  };
  assert.equal(consumeConsultationHandoff(target), null);
  assert.equal(removedKey, HANDOFF_KEY);
});

test('storage removal failures fail closed without escaping', () => {
  const target = storage(JSON.stringify({ version: 1, summary: 'Discuss research', requestQuote: false }));
  target.removeItem = (key) => { assert.equal(key, HANDOFF_KEY); throw new Error('Storage removal denied'); };
  assert.equal(consumeConsultationHandoff(target), null);
});

test('handoff carries a valid lane and rejects unknown lanes', () => {
  for (const lane of LANES) {
    const target = storage(JSON.stringify({ version: 1, summary: 'Set up local assistant', requestQuote: false, lane }));
    assert.deepEqual(consumeConsultationHandoff(target), { summary: 'Set up local assistant', requestQuote: false, lane });
    assert.equal(target.value, null);
  }
  for (const lane of ['business', 'enterprise', 123]) {
    const target = storage(JSON.stringify({ version: 1, summary: 'Set up local assistant', requestQuote: false, lane }));
    assert.equal(consumeConsultationHandoff(target), null);
    assert.equal(target.value, null);
  }
});

test('consultation form has SMB/Home lane tabs', () => {
  const html = read('consultation.html');
  assert.match(html, /role="tablist"/);
  assert.match(html, /id="laneSmb"[^>]*role="tab"/);
  assert.match(html, /id="laneHome"[^>]*role="tab"/);
  assert.match(html, /Small\/Medium Business/);
  assert.match(html, />Home</);
  assert.match(html, /aria-controls="smbFields"/);
  assert.match(html, /aria-controls="homeFields"/);
});

test('consultation form has Home skill and hardware fields with required validation', () => {
  const html = read('consultation.html');
  for (const id of ['bookSkill', 'bookOs', 'bookCpu', 'bookRam', 'bookStorage', 'bookGraphics', 'bookFormFactor']) {
    assert.match(html, new RegExp(`id="${id}"[^>]*required`));
  }
  assert.match(html, /No experience/);
  assert.match(html, /Can follow instructions/);
  assert.match(html, /Power user/);
  assert.match(html, /Desktop/);
  assert.match(html, /Laptop/);
  assert.match(html, /Always-on box/);
});

test('Home summary guidance maps the four qualifying questions', () => {
  const html = read('consultation.html');
  const section = html.slice(html.indexOf('homeFields'));
  assert.match(section, /trying to set up/i);
  assert.match(section, /trying to achieve/i);
  assert.match(section, /already know/i);
  assert.match(section, /device and specs/i);
});

test('consultation form preserves SMB quote checkbox and guidance', () => {
  const html = read('consultation.html');
  assert.match(html, /id="quoteRequested"/);
  assert.match(html, /id="quoteGuidance"/);
});
