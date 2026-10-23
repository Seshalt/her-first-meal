import assert from 'node:assert/strict';
import test from 'node:test';
import { contentTranslator } from './content-translate.ts';

test('preserves surrounding whitespace and leaves unknown values unchanged', () => {
  const translate = contentTranslator({ 'Hello': 'Hola' });
  assert.equal(translate('  Hello\n'), '  Hola\n');
  assert.equal(translate('Unknown'), 'Unknown');
  const value = { label: 'Hello' };
  assert.equal(translate(value), value);
  assert.equal(translate(49), 49);
});

test('preserves dynamic values when translations reorder placeholders', () => {
  const translate = contentTranslator({ 'Week {v0}: {v1}': '{v1} — semana {v0}', 'Paid (${v0})': 'Pagado (${v0})' });
  assert.equal(translate('Week 37: Ready'), 'Ready — semana 37');
  assert.equal(translate('Paid ($1500)'), 'Pagado ($1500)');
  assert.equal(translate('Paid [$1500]'), 'Paid [$1500]');
});

test('reuses a translator for a loaded dictionary', () => {
  const dictionary = { Hello: 'Hola' };
  assert.equal(contentTranslator(dictionary), contentTranslator(dictionary));
});

test('handles compound labels and prototype-like customer text safely', () => {
  const translate = contentTranslator({ Vegan: 'Vegano', 'Gluten-free': 'Sin gluten' });
  assert.equal(translate('vegan · gluten-free'), 'Vegano · Sin gluten');
  assert.equal(translate('constructor'), 'constructor');
  assert.equal(translate('toString'), 'toString');
});
