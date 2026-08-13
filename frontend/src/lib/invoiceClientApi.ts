import type { Invoice } from "./invoiceTypes";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/invoices`;

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
      note: invoice.note || "",
      brandColor: invoice.brandColor || "",
      amountPaid: invoice.amountPaid ?? (invoice.status === "paid" ? invoice.total : 0),
    }),
  });

  if (!res.ok) throw new Error("Couldn't create a shareable link. Try again.");
  const data = await res.json();
  return data.url;
}