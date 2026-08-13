import type { Invoice } from "../../lib/invoiceTypes";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/invoices`;

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
}

export interface PaginatedInvoices {
  count: number;
  next: string | null;
  previous: string | null;
  results: Invoice[];
}

export async function fetchInvoices(accessToken: string, page: number = 1): Promise<PaginatedInvoices> {
  const res = await fetch(`${API_BASE}/?page=${page}`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error("Couldn't load your sales. Try again.");
  return res.json();
}

export type OwedSort = "oldest" | "largest";

export async function fetchOwedInvoices(accessToken: string, sort: OwedSort, page: number = 1): Promise<PaginatedInvoices> {
  const res = await fetch(`${API_BASE}/owed/?sort=${sort}&page=${page}`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error("Couldn't load outstanding sales.");
  return res.json();
}

export interface InvoiceSummary {
  totalCount: number;
  totalReceived: number;
  totalOutstanding: number;
}

export async function fetchInvoiceSummary(accessToken: string): Promise<InvoiceSummary> {
  const res = await fetch(`${API_BASE}/summary/`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error("Couldn't load your summary.");
  return res.json();
}

export async function fetchInvoiceDetail(accessToken: string, invoiceId: string): Promise<Invoice> {
  const res = await fetch(`${API_BASE}/${invoiceId}/`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error("Couldn't load this sale.");
  return res.json();
}

export async function recordPayment(accessToken: string, invoiceId: string, amount: number): Promise<Invoice> {
  const res = await fetch(`${API_BASE}/${invoiceId}/payments/`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Couldn't record that payment. Try again.");
  }
  return res.json();
}

export interface CreateInvoicePayload {
  customerName: string;
  customerPhone?: string;
  items: { description: string; qty: number; unitPrice: number }[];
  amountPaidNow: number;
  note?: string;
  brandColor?: string;
}

export async function createInvoice(accessToken: string, payload: CreateInvoicePayload): Promise<Invoice> {
  const res = await fetch(`${API_BASE}/`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Couldn't record the sale. Try again.");
  }
  return res.json();
}