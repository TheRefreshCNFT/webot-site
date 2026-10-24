import test from 'node:test';
import assert from 'node:assert/strict';
import { consumeConsultationHandoff, HANDOFF_KEY } from '../js/consultation-handoff.mjs';

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
