import { BRAND } from "../../lib/theme";
import type { InvoiceStatus } from "./types";

// Where the header logo / "Exit guest mode" link should send people.
export const MARKETING_SITE_URL = "/";

// Guest mode is capped on purpose: unlimited local history would remove
// the reason to ever create an account. Unlimited history + cross-device
// backup stays a genuine paid/free-account benefit. Raise this if you want
// guest mode to feel more generous, but keep some cap.
export const MAX_GUEST_HISTORY = 3;
// export const STORAGE_KEY = "owobook_guest_invoices";
export { GUEST_INVOICE_STORAGE_KEY as STORAGE_KEY } from "../../lib/guestInvoiceStorage";
export const INVOICE_COUNTER_KEY = "owobook_invoice_counter";

// Free accounts get to pick from these; guests only get to look. Values
// are illustrative -- swap for whatever the real signed-in picker uses.
export const PRESET_COLORS: { name: string; value: string }[] = [
  { name: "Yousual Green", value: BRAND.green },
  { name: "Blue", value: "#3B82F6" },
  { name: "Black", value: "#141414" },
  { name: "Purple", value: "#7C3AED" },
  { name: "Orange", value: "#F97316" },
];

// Default note text by document type. "Quote" isn't a status this app
// tracks yet (only paid/due exist) -- left here as a ready slot for when
// a quote/estimate document type gets added, rather than wired up now.
export const NOTE_DEFAULTS: Record<InvoiceStatus, string> = {
  due: "Payment due within 7 days.",
  paid: "Thank you for your payment!",
};