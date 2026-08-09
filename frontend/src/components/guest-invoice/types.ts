// export interface InvoiceItem {
//   id: string;
//   description: string;
//   qty: number | "";
//   unitPrice: number | "";
// }

// export type InvoiceStatus = "paid" | "due";

// export interface Invoice {
//   id: string;
//   invoiceNumber: string; // e.g. "INV-001"
//   businessName: string;
//   customerName: string;
//   customerPhone: string; // local format, e.g. "08031234567", or "" if not given
//   items: InvoiceItem[];
//   total: number;
//   status: InvoiceStatus;
//   createdAt: string;
//   paidDate: string | null;
// }

// export interface PhoneCheck {
//   empty: boolean;
//   valid: boolean;
//   intl: string | null; // "234XXXXXXXXXX" — required format for wa.me links
//   local: string | null; // "0XXXXXXXXXX"
// }

// Re-exported from shared lib locations so guest mode and the signed-in
// dashboard use identical types — guest invoices need to migrate onto a
// user's account byte-for-byte on signup, so these can't drift apart.
export type { Invoice, InvoiceItem, InvoiceStatus } from "../../lib/invoiceTypes";
export type { PhoneCheck } from "../../lib/phone";