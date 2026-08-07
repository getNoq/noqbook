export function validateBusinessName(businessName: string): string | null {
  if (!businessName.trim()) return "Business name is required.";
  return null;
}

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

interface PhoneCheck {
  valid: boolean;
  local: string | null; // normalized "0XXXXXXXXXX"
}

/** Accepts 0803..., +234803..., or 234803... and normalizes to local format. */
export function normalizeNGPhone(raw: string): PhoneCheck {
  const cleaned = (raw || "").trim().replace(/[^\d+]/g, "");
  let rest: string | null = null;

  if (cleaned.startsWith("+234")) rest = cleaned.slice(4);
  else if (cleaned.startsWith("234") && cleaned.length === 13) rest = cleaned.slice(3);
  else if (cleaned.startsWith("0") && cleaned.length === 11) rest = cleaned.slice(1);

  const ok = !!rest && /^[7-9]\d{9}$/.test(rest);
  return { valid: ok, local: ok ? "0" + rest : null };
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return "Phone number is required.";
  const { valid } = normalizeNGPhone(phone);
  return valid ? null : "Enter a valid Nigerian number, e.g. 0803 123 4567.";
}
