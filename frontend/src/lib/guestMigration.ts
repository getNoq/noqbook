import { loadGuestInvoices, clearGuestInvoices } from "./guestInvoiceStorage";

/**
 * Sends any invoices created in guest mode on this device to the newly
 * authenticated account, then clears them locally. Called after both
 * signup and login — someone might sign up on one visit and only log
 * back in later on the same device, with guest invoices still sitting
 * there either way. Best-effort: failures are swallowed so a flaky
 * connection never blocks auth itself.
 */
export async function migrateGuestInvoicesToAccount(accessToken: string): Promise<void> {
  const guestInvoices = loadGuestInvoices();
  if (guestInvoices.length === 0) return;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/invoices/import-guest/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ invoices: guestInvoices }),
    });
    if (res.ok) clearGuestInvoices();
  } catch {
    // offline / backend briefly unreachable — leave guest invoices in
    // place, they'll just get imported next time
  }
}