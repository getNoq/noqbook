export interface InvoiceItem {
  id: string;
  description: string;
  qty: number | "";
  unitPrice: number | "";
}

export type InvoiceStatus = "paid" | "due";

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-001"
  businessName: string;
  customerName: string;
  customerPhone: string; // local format, e.g. "08031234567", or "" if not given
  items: InvoiceItem[];
  total: number;
  status: InvoiceStatus;
  createdAt: string;
  paidDate: string | null;
}

export interface PhoneCheck {
  empty: boolean;
  valid: boolean;
  intl: string | null; // "234XXXXXXXXXX" — required format for wa.me links
  local: string | null; // "0XXXXXXXXXX"
}