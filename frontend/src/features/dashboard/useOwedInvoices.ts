import { useCallback, useEffect, useState } from "react";
import type { Invoice } from "../../lib/invoiceTypes";
import { useAuth } from "../auth/AuthContext";
import { fetchOwedInvoices, type OwedSort } from "./invoicesApi";

const PAGE_SIZE = 10;

export function useOwedInvoices() {
  const { accessToken } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sort, setSort] = useState<OwedSort>("oldest");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (targetPage: number, targetSort: OwedSort) => {
      if (!accessToken) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchOwedInvoices(accessToken, targetSort, targetPage);
        setInvoices(data.results);
        setTotalCount(data.count);
        setPage(targetPage);
        setSort(targetSort);
      } catch (err: any) {
        setError(err?.message || "Couldn't load outstanding sales.");
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    load(1, "oldest");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return {
    invoices,
    isLoading,
    error,
    page,
    totalPages,
    sort,
    goToPage: (p: number) => load(p, sort),
    changeSort: (s: OwedSort) => load(1, s),
  };
}