export type FeedType = "all" | "sale" | "expense";
export type DateRangePreset = "all" | "today" | "week" | "month" | "custom";
export type FeedSort = "newest" | "oldest" | "amount_desc" | "amount_asc";

export interface FeedItem {
  id: string;
  type: "sale" | "expense";
  number: string;
  date: string;
  dateDisplay: string;
  title: string;
  metaLabel: string;
  amount: number;
  status: string | null;
  invoiceId?: string | null;
  expenseId?: string | null;
  receiptUrl?: string | null;
}

export interface OverviewSummary {
  totalSales: number;
  totalExpenses: number;
  profit: number;
  totalOutstanding: number;
}

export interface PaginatedFeed {
  count: number;
  results: FeedItem[];
}

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/overview`;

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

export async function fetchOverviewSummary(
  accessToken: string,
  params: { range: DateRangePreset; dateFrom?: string; dateTo?: string }
): Promise<OverviewSummary> {
  const query = new URLSearchParams({ range: params.range });
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  const res = await fetch(`${API_BASE}/summary/?${query.toString()}`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error("Couldn't load your summary.");
  return res.json();
}

export interface FeedParams {
  type: FeedType;
  range: DateRangePreset;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sort: FeedSort;
  page: number;
  status?: string;
}

export async function fetchOverviewFeed(accessToken: string, params: FeedParams): Promise<PaginatedFeed> {
  const query = new URLSearchParams({ type: params.type, range: params.range, sort: params.sort, page: String(params.page) });
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  const res = await fetch(`${API_BASE}/feed/?${query.toString()}`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error("Couldn't load your activity.");
  return res.json();
}