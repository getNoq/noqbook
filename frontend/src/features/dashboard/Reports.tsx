import { useState } from "react";
import { Download } from "lucide-react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { BRAND, FONT_IMPORT_BLOCK } from "../../lib/theme";
import { useAuth } from "../auth/AuthContext";
import { Sidebar } from "./Sidebar";
import { useReports } from "./useReports";
import { downloadReportCsv, type DateRangePreset } from "./reportsApi";
import { DatePickerField } from "../../components/ui/DatePickerField";
import { BusinessPlanGate } from "./BusinessPlanGate";

const formatNaira = (n: number) => `₦${Number(n || 0).toLocaleString("en-NG")}`;

const RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "This month" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom" },
];

function formatPeriodLabel(period: string, granularity: "day" | "week" | "month"): string {
  const d = new Date(period);
  if (granularity === "day") return d.toLocaleDateString("en-NG", { day: "2-digit", month: "short" });
  if (granularity === "week") return `Wk ${d.toLocaleDateString("en-NG", { day: "2-digit", month: "short" })}`;
  return d.toLocaleDateString("en-NG", { month: "short", year: "numeric" });
}

export function Reports() {
  const { accessToken } = useAuth();
  const { range, setRange, dateFrom, setDateFrom, dateTo, setDateTo, summary, trend, breakdown, topCustomers, isLoading, error } = useReports();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!accessToken) return;
    setExporting(true);
    try {
      await downloadReportCsv(accessToken, range, dateFrom, dateTo);
    } catch {
      // best-effort — a failed export isn't worth a blocking error state
    } finally {
      setExporting(false);
    }
  };

  const chartData = trend.points.map((p) => ({ ...p, label: formatPeriodLabel(p.period, trend.granularity) }));

  return (
    <div className="min-h-dvh flex flex-col md:flex-row" style={{ background: BRAND.bg, fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      <style>{FONT_IMPORT_BLOCK}</style>
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 md:px-8 py-6 md:py-8">
        <div className="flex flex-col xxs:flex-row xxs:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl">Reports</h1>
            <p className="text-sm" style={{ color: BRAND.inkSoft }}>Trends, breakdowns, and exportable data for your business.</p>
          </div>
          <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shrink-0" style={{ background: BRAND.ink, color: BRAND.bg, opacity: exporting ? 0.6 : 1 }}>
            <Download size={16} /> {exporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>

        <BusinessPlanGate feature="Reports" description="Trends, category breakdowns, and exportable data — upgrade to unlock.">
        <div className="flex flex-nowrap gap-2 mb-3 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        {RANGE_OPTIONS.map((opt) => (
            <button
            key={opt.value}
            onClick={() => setRange(opt.value)}
            className="flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap"
            style={{ background: range === opt.value ? BRAND.ink : BRAND.card, color: range === opt.value ? BRAND.bg : BRAND.inkSoft, border: `1px solid ${BRAND.line}` }}
            >
            {opt.label}
            </button>
        ))}
        </div>
        {range === "custom" && (
        <div className="flex gap-2 mb-6 max-w-sm">
            <DatePickerField
            value={dateFrom}
            onChange={setDateFrom}
            placeholder="From"
            maxDate={dateTo || undefined}
            />
            <DatePickerField
            value={dateTo}
            onChange={setDateTo}
            placeholder="To"
            align="right"
            minDate={dateFrom || undefined}
            />
        </div>
        )}

        {error && <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: BRAND.peach, color: BRAND.red }}>{error}</div>}

        {isLoading ? (
          <div className="rounded-2xl p-10 text-center text-sm" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>Loading reports…</div>
        ) : (
          <>
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 sm:overflow-visible mb-6">
              {[
                { label: "Sales", value: formatNaira(summary.totalSales) },
                { label: "Expenses", value: formatNaira(summary.totalExpenses) },
                { label: "Profit", value: formatNaira(summary.profit), color: summary.profit >= 0 ? BRAND.green : BRAND.red },
                { label: "Sales recorded", value: String(summary.salesCount) },
              ].map((card) => (
                <div key={card.label} className="rounded-2xl p-5 shrink-0 w-[60%] sm:w-auto" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: BRAND.inkSoft }}>{card.label}</div>
                  <div className="font-heading text-2xl" style={{ color: card.color || BRAND.ink }}>{card.value}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-5 mb-6" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
              <h2 className="font-heading text-lg mb-4">Sales vs expenses</h2>
              {chartData.length === 0 ? (
                <p className="text-sm text-center py-10" style={{ color: BRAND.inkSoft }}>Not enough data yet for this range.</p>
              ) : (
                <div style={{ width: "100%", height: 280 }}>
                  <ResponsiveContainer>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={BRAND.line} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: BRAND.inkSoft }} />
                      <YAxis tick={{ fontSize: 11, fill: BRAND.inkSoft }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => formatNaira(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="sales" name="Sales" stroke={BRAND.green} strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="expenses" name="Expenses" stroke={BRAND.red} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
              <div className="rounded-2xl p-5" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
                <h2 className="font-heading text-lg mb-4">Expenses by category</h2>
                {breakdown.length === 0 ? (
                  <p className="text-sm text-center py-10" style={{ color: BRAND.inkSoft }}>No expenses in this range.</p>
                ) : (
                  <>
                    <div style={{ width: "100%", height: 220 }} className="mb-4">
                      <ResponsiveContainer>
                        <BarChart data={breakdown} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={BRAND.line} />
                          <XAxis type="number" tick={{ fontSize: 11, fill: BRAND.inkSoft }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                          <YAxis type="category" dataKey="categoryDisplay" tick={{ fontSize: 11, fill: BRAND.inkSoft }} width={110} />
                          <Tooltip formatter={(value: number) => formatNaira(value)} />
                          <Bar dataKey="total" fill={BRAND.lavStrong} radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-2">
                      {breakdown.map((row) => (
                        <div key={row.category} className="flex items-center justify-between text-sm">
                          <span>{row.categoryDisplay} <span style={{ color: BRAND.inkSoft }}>({row.count})</span></span>
                          <span className="font-semibold">{formatNaira(row.total)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-2xl p-5" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
                <h2 className="font-heading text-lg mb-4">Top customers</h2>
                {topCustomers.length === 0 ? (
                  <p className="text-sm text-center py-10" style={{ color: BRAND.inkSoft }}>No customer payments in this range.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {topCustomers.map((row, i) => (
                      <Link key={row.customerId} to={`/dashboard/customers/${row.customerId}`} className="flex items-center justify-between text-sm py-2 hover:bg-black/[0.02] rounded-lg px-1">
                        <span>{i + 1}. {row.customerName} <span style={{ color: BRAND.inkSoft }}>({row.salesCount} sale{row.salesCount === 1 ? "" : "s"})</span></span>
                        <span className="font-semibold" style={{ color: BRAND.green }}>{formatNaira(row.total)}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        </BusinessPlanGate>
      </main>
    </div>
  );
}