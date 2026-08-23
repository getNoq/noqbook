export type DateRangePreset = "all" | "today" | "week" | "month" | "custom";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/reports`;

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

function buildQuery(range: DateRangePreset, dateFrom?: string, dateTo?: string) {
  const query = new URLSearchParams({ range });
  if (dateFrom) query.set("dateFrom", dateFrom);
  if (dateTo) query.set("dateTo", dateTo);
  return query;
}

export interface ReportSummary {
  totalSales: number;
  totalExpenses: number;
  profit: number;
  salesCount: number;
}

export async function fetchReportSummary(accessToken: string, range: DateRangePreset, dateFrom?: string, dateTo?: string): Promise<ReportSummary> {
  const res = await fetch(`${API_BASE}/summary/?${buildQuery(range, dateFrom, dateTo)}`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error("Couldn't load report summary.");
  return res.json();
}

export interface TrendPoint {
  period: string;
  sales: number;
  expenses: number;
  profit: number;
}

export interface TrendResponse {
  granularity: "day" | "week" | "month";
  points: TrendPoint[];
}

export async function fetchReportTrend(accessToken: string, range: DateRangePreset, dateFrom?: string, dateTo?: string): Promise<TrendResponse> {
  const res = await fetch(`${API_BASE}/trend/?${buildQuery(range, dateFrom, dateTo)}`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error("Couldn't load the trend chart.");
  return res.json();
}

export interface ExpenseBreakdownRow {
  category: string;
  categoryDisplay: string;
  total: number;
  count: number;
}

export async function fetchExpenseBreakdown(accessToken: string, range: DateRangePreset, dateFrom?: string, dateTo?: string): Promise<ExpenseBreakdownRow[]> {
  const res = await fetch(`${API_BASE}/expense-breakdown/?${buildQuery(range, dateFrom, dateTo)}`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error("Couldn't load the expense breakdown.");
  return res.json();
}

export interface TopCustomerRow {
  customerId: string;
  customerName: string;
  total: number;
  salesCount: number;
}

export async function fetchTopCustomers(accessToken: string, range: DateRangePreset, dateFrom?: string, dateTo?: string): Promise<TopCustomerRow[]> {
  const res = await fetch(`${API_BASE}/top-customers/?${buildQuery(range, dateFrom, dateTo)}`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error("Couldn't load top customers.");
  return res.json();
}

export async function downloadReportCsv(accessToken: string, range: DateRangePreset, dateFrom?: string, dateTo?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/export/?${buildQuery(range, dateFrom, dateTo)}`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error("Couldn't export the report.");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "yousual-report.csv";
  a.click();
  URL.revokeObjectURL(url);
}