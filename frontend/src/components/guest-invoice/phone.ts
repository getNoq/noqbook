// import type { PhoneCheck } from "./types";

// // Valid Nigerian mobile prefixes (2 digits, after stripping the leading 0).
// const VALID_PREFIX_PATTERN = /^(70|80|81|90|91)\d{8}$/;

// /**
//  * Nigerian mobile numbers, local format only. Accepts either:
//  *  - 11 digits starting with 0   (e.g. "08031234567")
//  *  - 10 digits with no leading 0 (e.g. "8031234567")
//  * The number (after stripping any leading 0) must start with one of
//  * 70, 80, 81, 90, or 91, followed by 8 more digits. No +234 / 234
//  * input accepted; wa.me links still need the country code, so it's
//  * derived internally in `intl`.
//  */
// export function normalizeNGPhone(raw: string): PhoneCheck {
//   const digitsOnly = (raw || "").replace(/\D/g, "");
//   if (!digitsOnly) return { empty: true, valid: true, intl: null, local: null };

//   let rest: string | null = null;
//   if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
//     rest = digitsOnly.slice(1);
//   } else if (digitsOnly.length === 10 && !digitsOnly.startsWith("0")) {
//     rest = digitsOnly;
//   }

//   const ok = !!rest && VALID_PREFIX_PATTERN.test(rest);
//   return {
//     empty: false,
//     valid: ok,
//     intl: ok ? "234" + rest : null,
//     local: ok ? "0" + rest : null,
//   };
// }

export { normalizeNGPhone } from "../../lib/phone";