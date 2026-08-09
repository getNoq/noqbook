export interface PhoneCheck {
  empty: boolean;
  valid: boolean;
  intl: string | null; // "234XXXXXXXXXX" — used for wa.me links
  local: string | null; // "0XXXXXXXXXX"
}

// Valid Nigerian mobile prefixes (2 digits, after stripping the leading 0).
const VALID_PREFIX_PATTERN = /^(70|80|81|90|91)\d{8}$/;

/**
 * Nigerian mobile numbers, local format only: 11 digits starting with
 * 0, or 10 digits with no leading 0, starting with one of the five
 * valid prefixes. Single source of truth — the invoice form, signup
 * form, and dashboard share links all import this.
 */
export function normalizeNGPhone(raw: string): PhoneCheck {
  const trimmed = (raw || "").trim();
  if (!trimmed) return { empty: true, valid: true, intl: null, local: null };

  const digitsOnly = trimmed.replace(/\D/g, "");
  let rest: string | null = null;
  if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
    rest = digitsOnly.slice(1);
  } else if (digitsOnly.length === 10 && !digitsOnly.startsWith("0")) {
    rest = digitsOnly;
  }

  const ok = !!rest && VALID_PREFIX_PATTERN.test(rest);
  return {
    empty: false,
    valid: ok,
    intl: ok ? "234" + rest : null,
    local: ok ? "0" + rest : null,
  };
}