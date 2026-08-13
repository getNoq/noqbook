import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  fetchOverviewSummary, fetchOverviewFeed,
  type FeedType, type DateRangePreset, type FeedSort, type FeedItem, type OverviewSummary,
} from "./overviewApi";

const EMPTY_SUMMARY: OverviewSummary = { totalSales: 0, totalExpenses: 0, profit: 0, totalOutstanding: 0 };
const PAGE_SIZE = 10;

export function useOverview() {
  const { accessToken } = useAuth();
  const [type, setType] = useState<FeedType>("all");
  const [range, setRange] = useState<DateRangePreset>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<FeedSort>("newest");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

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
      // non-fatal — cards just stay at their last known values
    }
  }, [accessToken, range, dateFrom, dateTo]);

  const loadFeed = useCallback(
    async (targetPage: number) => {
      if (!accessToken) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchOverviewFeed(accessToken, { type, range, dateFrom, dateTo, search, sort, page: targetPage });
        setItems(data.results);
        setTotalCount(data.count);
        setPage(targetPage);
      } catch (err: any) {
        setError(err?.message || "Couldn't load your activity.");
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, type, range, dateFrom, dateTo, search, sort]
  );

  // Small debounce so every keystroke in search doesn't fire a request.
  useEffect(() => {
    const handle = setTimeout(() => loadFeed(1), 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, range, dateFrom, dateTo, search, sort]);

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return {
    type, setType, range, setRange, dateFrom, setDateFrom, dateTo, setDateTo, sort, setSort, search, setSearch,
    summary, items, isLoading, error, page, totalPages,
    goToPage: loadFeed,
    refresh: () => { loadFeed(page); loadSummary(); },
  };
}