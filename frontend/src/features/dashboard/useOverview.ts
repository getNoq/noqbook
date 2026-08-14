import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  fetchOverviewSummary, fetchOverviewFeed,
  type FeedType, type DateRangePreset, type FeedSort, type FeedItem, type OverviewSummary,
} from "./overviewApi";

const EMPTY_SUMMARY: OverviewSummary = { totalSales: 0, totalExpenses: 0, profit: 0, totalOutstanding: 0 };
const PAGE_SIZE = 10;

export function useOverview() {
  const { accessToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters live in the URL, not local state — so navigating to a sale/
  // expense detail page and coming back preserves them automatically,
  // without a separate persistence layer.
  const type = (searchParams.get("type") as FeedType) || "all";
  const range = (searchParams.get("range") as DateRangePreset) || "all";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const sort = (searchParams.get("sort") as FeedSort) || "newest";
  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page")) || 1;

  const updateParams = (updates: Record<string, string | number>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === "all" || (key === "page" && value === 1)) next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next, { replace: true });
  };

  const setType = (v: FeedType) => updateParams({ type: v, page: 1 });
  const setRange = (v: DateRangePreset) => updateParams({ range: v, page: 1 });
  const setDateFrom = (v: string) => updateParams({ dateFrom: v, page: 1 });
  const setDateTo = (v: string) => updateParams({ dateTo: v, page: 1 });
  const setSort = (v: FeedSort) => updateParams({ sort: v, page: 1 });
  const setSearch = (v: string) => updateParams({ search: v, page: 1 });
  const goToPage = (p: number) => updateParams({ page: p });

  const [summary, setSummary] = useState<OverviewSummary>(EMPTY_SUMMARY);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    if (!accessToken) return;
    try {
      setSummary(await fetchOverviewSummary(accessToken, { range, dateFrom, dateTo }));
    } catch {
      // non-fatal
    }
  }, [accessToken, range, dateFrom, dateTo]);

  const loadFeed = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchOverviewFeed(accessToken, { type, range, dateFrom, dateTo, search, sort, page });
      setItems(data.results);
      setTotalCount(data.count);
    } catch (err: any) {
      setError(err?.message || "Couldn't load your activity.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, type, range, dateFrom, dateTo, search, sort, page]);

  useEffect(() => {
    const handle = setTimeout(() => loadFeed(), 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, range, dateFrom, dateTo, search, sort, page]);

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return {
    type, setType, range, setRange, dateFrom, setDateFrom, dateTo, setDateTo, sort, setSort, search, setSearch,
    summary, items, isLoading, error, page, totalPages, goToPage,
    refresh: () => { loadFeed(); loadSummary(); },
  };
}