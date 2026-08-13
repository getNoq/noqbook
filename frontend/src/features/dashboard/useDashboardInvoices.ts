import { useCallback, useEffect, useState } from "react";
import type { Invoice } from "../../lib/invoiceTypes";
import { useAuth } from "../auth/AuthContext";
import {
  fetchInvoices,
  fetchInvoiceSummary,
  createInvoice,
  type CreateInvoicePayload,
  type InvoiceSummary,
} from "./invoicesApi";

const PAGE_SIZE = 10; // must match backend InvoicePagination.page_size
const EMPTY_SUMMARY: InvoiceSummary = { totalCount: 0, totalReceived: 0, totalOutstanding: 0 };

export function useDashboardInvoices() {
  const { accessToken } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<InvoiceSummary>(EMPTY_SUMMARY);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    if (!accessToken) return;
    try {
      setSummary(await fetchInvoiceSummary(accessToken));
    } catch {
      // non-fatal — overview cards just stay at their last known values
    }
  }, [accessToken]);

  const load = useCallback(
    async (targetPage: number = 1) => {
      if (!accessToken) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchInvoices(accessToken, targetPage);
        setInvoices(data.results);
        setTotalCount(data.count);
        setPage(targetPage);
      } catch (err: any) {
        setError(err?.message || "Couldn't load your invoices.");
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    load(1);
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // const markAsPaid = async (invoiceId: string) => {
  //   if (!accessToken) return;
  //   const paidDate = new Date().toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
  //   const updated = await markInvoicePaid(accessToken, invoiceId, paidDate);
  //   setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
  //   loadSummary();
  // };

  const create = async (payload: CreateInvoicePayload) => {
    if (!accessToken) throw new Error("Not signed in.");
    const created = await createInvoice(accessToken, payload);
    await load(1);
    loadSummary();
    return created;
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return {
    invoices,
    summary,
    isLoading,
    error,
    createInvoice: create,
    refreshSummary: loadSummary,
    page,
    totalPages,
    goToPage: load,
    refresh: () => load(page),
  };
}