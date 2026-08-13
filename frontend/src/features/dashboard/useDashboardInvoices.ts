import { useAuth } from "../auth/AuthContext";
import { createInvoice as createInvoiceApi, type CreateInvoicePayload } from "./invoicesApi";

/**
 * Slimmed down to just sale creation. The Overview page's list now
 * comes from useOverview (combined sales+expenses feed) instead of
 * this hook's old invoice-only list — keeping both would mean two
 * competing fetches on every dashboard load.
 */
export function useDashboardInvoices() {
  const { accessToken } = useAuth();

  const createInvoice = async (payload: CreateInvoicePayload) => {
    if (!accessToken) throw new Error("Not signed in.");
    return createInvoiceApi(accessToken, payload);
  };

  return { createInvoice };
}