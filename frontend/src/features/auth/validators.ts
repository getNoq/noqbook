// export function validateBusinessName(businessName: string): string | null {
//   if (!businessName.trim()) return "Business name is required.";
//   return null;
// }

// export function validateEmail(email: string): string | null {
//   const trimmed = email.trim();
//   if (!trimmed) return "Email is required.";
//   const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
//   return ok ? null : "Enter a valid email address.";
// }

// export function validatePassword(password: string): string | null {
//   if (!password) return "Password is required.";
//   if (password.length < 8) return "Use at least 8 characters.";
//   if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
//     return "Include at least one letter and one number.";
//   }
//   return null;
// }

// export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
//   if (!confirmPassword) return "Confirm your password.";
//   if (password !== confirmPassword) return "Passwords don't match.";
//   return null;
// }

// interface PhoneCheck {
//   valid: boolean;
//   local: string | null; // normalized "0XXXXXXXXXX"
// }

// // Valid Nigerian mobile prefixes (2 digits, after stripping the leading 0).
// const VALID_PREFIX_PATTERN = /^(70|80|81|90|91)\d{8}$/;

// /**
//  * Accepts local Nigerian format only: 11 digits starting with 0, or
//  * 10 digits with no leading 0. Must start with 70, 80, 81, 90, or 91.
//  */
// export function normalizeNGPhone(raw: string): PhoneCheck {
//   const digitsOnly = (raw || "").replace(/\D/g, "");

//   let rest: string | null = null;
//   if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
//     rest = digitsOnly.slice(1);
//   } else if (digitsOnly.length === 10 && !digitsOnly.startsWith("0")) {
//     rest = digitsOnly;
//   }

//   const ok = !!rest && VALID_PREFIX_PATTERN.test(rest);
//   return { valid: ok, local: ok ? "0" + rest : null };
// }

// export function validatePhone(phone: string): string | null {
//   if (!phone.trim()) return "Phone number is required.";
//   const { valid } = normalizeNGPhone(phone);
//   return valid ? null : "Enter a valid Nigerian number, e.g. 0803 123 4567.";
// }

import { normalizeNGPhone } from "../../lib/phone";

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required.";
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  return ok ? null : "Enter a valid email address.";
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Include at least one letter and one number.";
  }
  return null;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) return "Confirm your password.";
  if (password !== confirmPassword) return "Passwords don't match.";
  return null;
}

export function validateBusinessName(businessName: string): string | null {
  if (!businessName.trim()) return "Business name is required.";
  return null;
}

export { normalizeNGPhone };

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return "Phone number is required.";
  const { valid } = normalizeNGPhone(phone);
  return valid ? null : "Enter a valid Nigerian number, e.g. 08031234567.";
}