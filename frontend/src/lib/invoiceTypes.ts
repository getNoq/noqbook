export interface InvoiceItem {
  id: string;
  description: string;
  qty: number | "";
  unitPrice: number | "";
}

export type InvoiceStatus = "paid" | "due";

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
}