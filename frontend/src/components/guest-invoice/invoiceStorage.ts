import type { Invoice } from "./types";
import { STORAGE_KEY, INVOICE_COUNTER_KEY } from "./constants";

export function loadInvoicesFromStorage(): Invoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Invoice[]) : [];
  } catch {
    return [];
  }
}

export function saveInvoicesToStorage(invoices: Invoice[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  } catch {
    // storage full or unavailable (private browsing) — fail silently,
    // guest just loses persistence for this session
  }
}

/**
 * Sequential invoice numbers, stored separately from the invoice list so
 * numbering keeps climbing even once old invoices fall off the capped
 * history array. Falls back to a timestamp-derived number if storage is
 * unavailable (private browsing etc.) so generation never hard-fails.
 */
export function getNextInvoiceNumber(): string {
  let n: number;
  try {
    const raw = localStorage.getItem(INVOICE_COUNTER_KEY);
    n = raw ? parseInt(raw, 10) + 1 : 1;
    localStorage.setItem(INVOICE_COUNTER_KEY, String(n));
  } catch {
    n = Number(String(Date.now()).slice(-4));
  }
  return `INV-${String(n).padStart(3, "0")}`;
}