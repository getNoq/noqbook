import { useCallback, useEffect, useState } from "react";
import type { Invoice } from "../../lib/invoiceTypes";
import { useAuth } from "../auth/AuthContext";
import { fetchInvoices, markInvoicePaid } from "./invoicesApi";

export function useDashboardInvoices() {
  const { accessToken } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      setInvoices(await fetchInvoices(accessToken));
    } catch (err: any) {
      setError(err?.message || "Couldn't load your invoices.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const markAsPaid = async (invoiceId: string) => {
    if (!accessToken) return;
    const paidDate = new Date().toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
    const updated = await markInvoicePaid(accessToken, invoiceId, paidDate);
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
  };

  return { invoices, isLoading, error, markAsPaid, refresh: load };
}