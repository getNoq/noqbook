export interface InvoiceItem {
  id: string;
  description: string;
  qty: number | "";
  unitPrice: number | "";
}

export type InvoiceStatus = "paid" | "due" | "partially_paid";

export interface Payment {
  id: string;
  amount: number;
  paidDate: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  businessName: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  total: number;
  status: InvoiceStatus;
  createdAt: string;
  paidDate: string | null;
  note?: string;
  brandColor?: string;
  // Only ever populated for account (dashboard) invoices, fetched from
  // the backend — guest-mode invoices never have these; the payment
  // ledger is a signed-in-only feature.
  amountPaid?: number;
  amountDue?: number;
  payments?: Payment[]; // present only on the detail/creation response
}