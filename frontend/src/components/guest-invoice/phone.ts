import type { PhoneCheck } from "./types";

/** Validates + normalizes a Nigerian phone number. Empty input is "valid" (field is optional). */
export function normalizeNGPhone(raw: string): PhoneCheck {
  const trimmed = (raw || "").trim();
  if (!trimmed) return { empty: true, valid: true, intl: null, local: null };

  const cleaned = trimmed.replace(/[^\d+]/g, "");
  let rest: string | null = null;

  if (cleaned.startsWith("+234")) rest = cleaned.slice(4);
  else if (cleaned.startsWith("234") && cleaned.length === 13) rest = cleaned.slice(3);
  else if (cleaned.startsWith("0") && cleaned.length === 11) rest = cleaned.slice(1);

  const ok = !!rest && /^[7-9]\d{9}$/.test(rest);
  return {
    empty: false,
    valid: ok,
    intl: ok ? "234" + rest : null,
    local: ok ? "0" + rest : null,
  };
}