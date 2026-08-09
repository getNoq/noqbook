import type { Invoice, InvoiceStatus } from "./invoiceTypes";
import { normalizeNGPhone } from "./phone";

export const formatNaira = (n: number, currency: "symbol" | "code" = "symbol"): string => {
  const amount = Number(n || 0).toLocaleString("en-NG");
  return currency === "code" ? `NGN ${amount}` : `₦${amount}`;
};

export const docLabel = (status: InvoiceStatus): string => (status === "paid" ? "Receipt" : "Invoice");

export const invoiceText = (inv: Invoice): string => {
  const lines = inv.items
    .map((it) => `• ${it.description} — ${formatNaira(Number(it.qty) * Number(it.unitPrice))}`)
    .join("\n");
  return `${docLabel(inv.status)} ${inv.invoiceNumber} from ${inv.businessName}\nCustomer: ${inv.customerName}\n\n${lines}\n\nTotal: ${formatNaira(inv.total)}\nStatus: ${inv.status === "paid" ? "PAID" : "OUTSTANDING"}\n\nCreated with Yousual (https://yousual.com)`;
};

export const reminderText = (inv: Invoice): string =>
  `Hi ${inv.customerName}, just a friendly reminder — ${formatNaira(inv.total)} for ${inv.items
    .map((i) => i.description)
    .join(", ")} (${inv.invoiceNumber}) is still outstanding. Thank you!\n\n— ${inv.businessName}, via Yousual`;

export const shareCaption = (inv: Invoice, link?: string): string => {
  const base =
    inv.status === "paid"
      ? `Thanks for your payment! Here's your receipt from ${inv.businessName}.`
//       : `Hi ${inv.customerName}, here's your invoice from ${inv.businessName}. You can view or download it using the link below.`;
//   return link ? `${base}\n${link}` : base;
      : `Hi ${inv.customerName}, here's your invoice from ${inv.businessName}.`;
  return link ? `${base}\n${link}` : base;
};

export const openWhatsApp = (text: string, phone: string) => {
  const encoded = encodeURIComponent(text);
  const { intl } = normalizeNGPhone(phone);
  const url = intl ? `https://wa.me/${intl}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  window.open(url, "_blank");
};