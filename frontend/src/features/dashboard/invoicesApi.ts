import type { Invoice } from "../../lib/invoiceTypes";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/invoices`;

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
}

export async function fetchInvoices(accessToken: string): Promise<Invoice[]> {
  const res = await fetch(`${API_BASE}/`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error("Couldn't load your invoices. Try again.");
  return res.json();
}

export async function markInvoicePaid(accessToken: string, invoiceId: string, paidDate: string): Promise<Invoice> {
  const res = await fetch(`${API_BASE}/${invoiceId}/mark-paid/`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ paidDate }),
  });
  if (!res.ok) throw new Error("Couldn't mark this as paid. Try again.");
  return res.json();
}