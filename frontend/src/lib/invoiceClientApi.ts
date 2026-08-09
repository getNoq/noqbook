import type { Invoice } from "./invoiceTypes";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/invoices`;

/**
 * Creates a public, shareable snapshot of this invoice on the backend
 * and returns its hosted URL. Works with or without auth — guest mode
 * calls this with no access token at all.
 */
export async function uploadInvoiceAndGetLink(invoice: Invoice, accessToken?: string | null): Promise<string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}/share/`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      businessName: invoice.businessName,
      customerName: invoice.customerName,
      invoiceNumber: invoice.invoiceNumber,
      items: invoice.items,
      total: invoice.total,
      status: invoice.status,
      createdAt: invoice.createdAt,
      paidDate: invoice.paidDate,
    }),
  });

  if (!res.ok) throw new Error("Couldn't create a shareable link. Try again.");
  const data = await res.json();
  return data.url;
}