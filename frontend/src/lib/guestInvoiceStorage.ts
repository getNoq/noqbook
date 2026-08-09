import type { Invoice } from "./invoiceTypes";

// Must match the key guest-invoice/constants.ts uses — canonical here.
export const GUEST_INVOICE_STORAGE_KEY = "owobook_guest_invoices";

export function loadGuestInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(GUEST_INVOICE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Invoice[]) : [];
  } catch {
    return [];
  }
}

export function clearGuestInvoices(): void {
  try {
    localStorage.removeItem(GUEST_INVOICE_STORAGE_KEY);
  } catch {
    // storage unavailable — nothing to clean up
  }
}