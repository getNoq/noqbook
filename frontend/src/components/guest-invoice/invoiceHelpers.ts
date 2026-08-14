// import type { Invoice, InvoiceItem, InvoiceStatus } from "./types";
// import { MAX_GUEST_HISTORY } from "./constants";
// import { normalizeNGPhone } from "./phone";

// export const formatNaira = (
//   n: number,
//   currency: "symbol" | "code" = "symbol"
// ): string => {
//   const amount = Number(n || 0).toLocaleString("en-NG");
//   return currency === "code" ? `NGN ${amount}` : `₦${amount}`;
// };

// export const docLabel = (status: InvoiceStatus): string =>
//   status === "paid" ? "Receipt" : "Invoice";

// /**
//  * Single source of truth for the guest-mode status line shown under the
//  * header. One message, three states, instead of a separate "guest mode"
//  * pill plus a separate "N saved" banner saying overlapping things.
//  */
// export function guestStatusMessage(count: number): string {
//   if (count === 0) return "Guest Mode — invoices stay on this device only.";
//   if (count >= MAX_GUEST_HISTORY) {
//     return `${count} of ${MAX_GUEST_HISTORY} saved on this device (limit reached). Creating another invoice will replace your oldest one.`;
//   }
//   return `${count} of ${MAX_GUEST_HISTORY} used on this device. Create a free account to save unlimited ones.`;
// }

// export const invoiceText = (inv: Invoice): string => {
//   const lines = inv.items
//     .map((it) => `• ${it.description} — ${formatNaira(Number(it.qty) * Number(it.unitPrice))}`)
//     .join("\n");
//   return `${docLabel(inv.status)} ${inv.invoiceNumber} from ${inv.businessName}\nCustomer: ${inv.customerName}\n\n${lines}\n\nTotal: ${formatNaira(inv.total)}\nStatus: ${inv.status === "paid" ? "PAID" : "OUTSTANDING"}\n\nPowered by Yousual (https://yousual.ng)`;
// };

// export const reminderText = (inv: Invoice): string =>
//   `Hi ${inv.customerName}, just a friendly reminder — ${formatNaira(inv.total)} for ${inv.items
//     .map((i) => i.description)
//     .join(", ")} (${inv.invoiceNumber}) is still outstanding. Thank you!\n\n— ${inv.businessName}, via Yousual`;

// /**
//  * The friendly WhatsApp caption, replacing whatever generic text WhatsApp's
//  * own share sheet would otherwise show. Wording is chosen by status so it
//  * never says the wrong thing (a paid receipt never asks to be paid, etc).
//  */
// export const shareCaption = (inv: Invoice, link?: string): string => {
//   const base =
//     inv.status === "paid"
//       ? `Thanks for your payment! Here's your receipt from ${inv.businessName}.`
//       : `Hi ${inv.customerName}, here's your invoice from ${inv.businessName}. You can view or download it using the link below.`;
//   return link ? `${base}\n${link}` : base;
// };

// export const openWhatsApp = (text: string, phone: string) => {
//   const encoded = encodeURIComponent(text);
//   const { intl } = normalizeNGPhone(phone);
//   const url = intl ? `https://wa.me/${intl}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
//   window.open(url, "_blank");
// };

// export const emptyItem = (): InvoiceItem => ({
//   id: crypto.randomUUID(),
//   description: "",
//   qty: 1,
//   unitPrice: 0,
// });

import type { InvoiceItem } from "./types";
import { MAX_GUEST_HISTORY } from "./constants";

export { formatNaira, docLabel, invoiceText, reminderText, shareCaption, openWhatsApp } from "../../lib/invoiceHelpers";

export function guestStatusMessage(count: number): string {
  if (count === 0) return "Guest Mode — records stay on this device only.";
  if (count >= MAX_GUEST_HISTORY) {
    return `${count} of ${MAX_GUEST_HISTORY} saved on this device (limit reached). Creating another record will replace your oldest one.`;
  }
  return `${count} of ${MAX_GUEST_HISTORY} used on this device. Create a free account to save unlimited ones.`;
}

export const emptyItem = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  description: "",
  qty: 1,
  unitPrice: 0,
});