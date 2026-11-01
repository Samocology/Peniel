/**
 * Chat privacy guard: customers and vendors may never exchange phone numbers,
 * emails or off-platform contact handles inside Peniel chat.
 */
const EMAIL = /[A-Z0-9._%+-]+\s*(@|\(at\)|\[at\])\s*[A-Z0-9.-]+\s*(\.|\(dot\)|dot)\s*[A-Z]{2,}/gi;
// 10+ digits (phone-like), allowing spaces, dashes, dots, brackets and a leading +
const PHONE = /(?<![₦#\d])\+?\d[\d\s().-]{7,}\d/g;
const WORD_DIGITS = /\b(zero|one|two|three|four|five|six|seven|eight|nine)(\s*[-,]?\s*(zero|one|two|three|four|five|six|seven|eight|nine)){6,}\b/gi;
const HANDLES = /\b(whatsapp|wa\.me|telegram|t\.me|call me|text me|my number|dm me on)\b/gi;

export function sanitizeChat(input: string): { text: string; blocked: boolean } {
  let blocked = false;
  const hide = () => {
    blocked = true;
    return "•••• hidden ••••";
  };
  const text = input
    .replace(EMAIL, hide)
    .replace(PHONE, (m) => (m.replace(/\D/g, "").length >= 10 ? hide() : m))
    .replace(WORD_DIGITS, hide)
    .replace(HANDLES, hide);
  return { text, blocked };
}
