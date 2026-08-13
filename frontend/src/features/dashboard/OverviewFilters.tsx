import { Search } from "lucide-react";
import { BRAND } from "../../lib/theme";
import type { FeedType, DateRangePreset, FeedSort } from "./overviewApi";

interface OverviewFiltersProps {
  type: FeedType;
  onTypeChange: (t: FeedType) => void;
  range: DateRangePreset;
  onRangeChange: (r: DateRangePreset) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  sort: FeedSort;
  onSortChange: (s: FeedSort) => void;
  search: string;
  onSearchChange: (v: string) => void;
}

const TYPE_OPTIONS: { value: FeedType; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "sale", label: "Sales" },
  { value: "expense", label: "Expenses" },
];

const RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "This month" },
  { value: "custom", label: "Custom date" },
];

const selectStyle = {
  border: `1px solid ${BRAND.line}`,
  background: BRAND.card,
  color: BRAND.inkSoft,
};

export function OverviewFilters(props: OverviewFiltersProps) {
  const {
    type,
    onTypeChange,
    range,
    onRangeChange,
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
    sort,
    onSortChange,
    search,
    onSearchChange,
  } = props;

  return (
    <div className="mb-5">
      {/* Main filter row */}
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        <div className="relative w-full lg:flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 shrink-0"
            style={{ color: BRAND.inkSoft }}
          />

          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by customer name…"
            className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none"
            style={{
              border: `1px solid ${BRAND.line}`,
              background: BRAND.card,
            }}
          />
        </div>

        {/* Filter by type */}
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value as FeedType)}
          className="flex-1 lg:flex-none lg:w-40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none"
          style={selectStyle}
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Filter by date */}
        <select
          value={range}
          onChange={(e) =>
            onRangeChange(e.target.value as DateRangePreset)
          }
          className="flex-1 lg:flex-none lg:w-40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none"
          style={selectStyle}
        >
          {RANGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as FeedSort)}
          className="flex-1 lg:flex-none lg:w-40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none"
          style={selectStyle}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="amount_desc">Highest amount</option>
          <option value="amount_asc">Lowest amount</option>
        </select>
      </div>

      {/* Custom date range */}
      {range === "custom" && (
        <div className="flex gap-2 mt-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{
              border: `1px solid ${BRAND.line}`,
              background: BRAND.card,
            }}
          />

          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{
              border: `1px solid ${BRAND.line}`,
              background: BRAND.card,
            }}
          />
        </div>
      )}
    </div>
  );
}