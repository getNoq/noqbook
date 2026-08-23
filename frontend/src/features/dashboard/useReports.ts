import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  fetchReportSummary, fetchReportTrend, fetchExpenseBreakdown, fetchTopCustomers,
  type DateRangePreset, type ReportSummary, type TrendResponse, type ExpenseBreakdownRow, type TopCustomerRow,
} from "./reportsApi";

const EMPTY_SUMMARY: ReportSummary = { totalSales: 0, totalExpenses: 0, profit: 0, salesCount: 0 };

export function useReports() {
  const { accessToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const range = (searchParams.get("range") as DateRangePreset) || "month";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const setRange = (v: DateRangePreset) => updateParam("range", v === "all" ? "" : v);
  const setDateFrom = (v: string) => updateParam("dateFrom", v);
  const setDateTo = (v: string) => updateParam("dateTo", v);

  const [summary, setSummary] = useState<ReportSummary>(EMPTY_SUMMARY);
  const [trend, setTrend] = useState<TrendResponse>({ granularity: "month", points: [] });
  const [breakdown, setBreakdown] = useState<ExpenseBreakdownRow[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const [s, t, b, c] = await Promise.all([
        fetchReportSummary(accessToken, range, dateFrom, dateTo),
        fetchReportTrend(accessToken, range, dateFrom, dateTo),
        fetchExpenseBreakdown(accessToken, range, dateFrom, dateTo),
        fetchTopCustomers(accessToken, range, dateFrom, dateTo),
      ]);
      setSummary(s); setTrend(t); setBreakdown(b); setTopCustomers(c);
    } catch (err: any) {
      setError(err?.message || "Couldn't load your reports.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, range, dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  return { range, setRange, dateFrom, setDateFrom, dateTo, setDateTo, summary, trend, breakdown, topCustomers, isLoading, error };
}