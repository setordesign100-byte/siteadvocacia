/** Public office contact information. Leave empty until confirmed by RTM. */
export const contact = {
  whatsappNumber: '+55 (31) 99196-7003',
  whatsappMessage: 'Olá! Gostaria de informações sobre o atendimento da RTM Advocacia.',
};

const brazilianAreaCodes = new Set([
  '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '21', '22', '24', '27', '28',
  '31', '32', '33', '34', '35', '37', '38',
  '41', '42', '43', '44', '45', '46', '47', '48', '49',
  '51', '53', '54', '55',
  '61', '62', '63', '64', '65', '66', '67', '68', '69',
  '71', '73', '74', '75', '77', '79',
  '81', '82', '83', '84', '85', '86', '87', '88', '89',
  '91', '92', '93', '94', '95', '96', '97', '98', '99',
]);

/** Build a click-to-chat link only for a complete, plausible Brazilian number. */
export function getWhatsAppUrl(number: string, message = contact.whatsappMessage): string | null {
  const formatted = number.trim();
  if (!formatted || !/^\+?[\d\s().-]+$/.test(formatted)) return null;

  let digits = formatted.replace(/[\s().+-]/g, '');
  if (formatted.startsWith('+') && !digits.startsWith('55')) return null;
  // An office number supplied with DDD can use Brazil's country code by default.
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  if (!/^55\d{10,11}$/.test(digits)) return null;
  if (!brazilianAreaCodes.has(digits.slice(2, 4))) return null;

  const subscriber = digits.slice(4);
  if (!(subscriber.length === 8 ? /^[2-5]\d{7}$/.test(subscriber) : /^9\d{8}$/.test(subscriber))) return null;

  const text = message.trim();
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
