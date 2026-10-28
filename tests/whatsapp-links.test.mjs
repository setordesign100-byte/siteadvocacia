import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contact, getWhatsAppUrl } from '../src/data/contact.ts';

test('confirmed RTM number produces the exact Brazilian click-to-chat destination', () => {
  assert.equal(contact.whatsappNumber, '+55 (31) 99196-7003');
  const url = new URL(getWhatsAppUrl(contact.whatsappNumber));
  assert.equal(url.protocol, 'https:');
  assert.equal(url.hostname, 'wa.me');
  assert.equal(url.pathname, '/5531991967003');
  assert.equal(url.searchParams.get('text'), 'Olá! Gostaria de informações sobre o atendimento da RTM Advocacia.');
});

test('formatted national and international Brazilian mobile numbers are equivalent', () => {
  for (const input of ['+55 (31) 99196-7003', '5531991967003', '(31) 99196-7003', '31 99196 7003', '31991967003', '  +55 (31) 99196-7003  ']) {
    assert.equal(getWhatsAppUrl(input, ''), 'https://wa.me/5531991967003', input);
  }
});

test('a complete Brazilian landline is accepted without changing its subscriber digits', () => {
  assert.equal(getWhatsAppUrl('+55 (31) 3216-7003', ''), 'https://wa.me/553132167003');
  assert.equal(getWhatsAppUrl('(31) 3216-7003', ''), 'https://wa.me/553132167003');
});

test('an obsolete eight-digit mobile subscriber beginning with nine is rejected', () => {
  for (const input of ['(31) 9196-7003', '+55 (31) 9196-7003', '553191967003']) {
    assert.equal(getWhatsAppUrl(input), null, input);
  }
});

test('explicit foreign country codes are not reinterpreted as Brazilian area codes', () => {
  for (const input of ['+34 919 967 003', '+33 991 967 003', '+1 (212) 555-0199', '+44 20 7946 0958']) {
    assert.equal(getWhatsAppUrl(input), null, input);
  }
});

test('missing, alphabetic, incomplete and invalid area or subscriber numbers are rejected', () => {
  for (const input of ['', '   ', 'telefone', '+55 (31) 99196-7003 ramal 2', '(00) 99196-7003', '(20) 99196-7003', '+55 (31) 89196-7003', '(31) 8196-7003', '99196-7003', '++55 (31) 99196-7003', '+55 (31) 99196-700', '+55 (31) 99196-70033']) {
    assert.equal(getWhatsAppUrl(input), null, input);
  }
});

test('empty or whitespace-only messages do not add a query parameter', () => {
  for (const message of ['', '  ', '\n\t']) {
    assert.equal(getWhatsAppUrl('(31) 99196-7003', message), 'https://wa.me/5531991967003');
  }
});

test('custom message punctuation and Unicode are encoded once and trimmed at the edges', () => {
  const message = 'Olá, RTM! Contrato & imóvel? #consulta / 50% 🏠';
  const value = getWhatsAppUrl('(31) 99196-7003', `  ${message}  `);
  assert.equal(value, `https://wa.me/5531991967003?text=${encodeURIComponent(message)}`);
  const url = new URL(value);
  assert.equal(url.searchParams.get('text'), message);
  assert.deepEqual([...url.searchParams.keys()], ['text']);
  assert.equal(url.hash, '');
});
