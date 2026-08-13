import { Search, ChevronDown } from "lucide-react";
import { BRAND } from "../../lib/theme";
import type { FeedType, DateRangePreset, FeedSort } from "./overviewApi";

interface OverviewFiltersProps {
  type: FeedType;
  onTypeChange: (t: FeedType) => void;
  range: DateRangePreset;
  onRangeChange: (r: DateRangePreset) => void;
  dateFrom: string; // ISO yyyy-mm-dd, empty string if unset
  dateTo: string; // ISO yyyy-mm-dd, empty string if unset
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

// --- Shared "custom select" styling ---------------------------------------
// iOS Safari draws its own chrome on <select> and ignores a lot of border/
// padding rules unless -webkit-appearance is reset. Font size must stay
// >=16px or iOS will zoom the page in on focus. We also draw our own
// chevron since the native one disappears once appearance is reset.

const selectStyle: React.CSSProperties = {
  border: `1px solid ${BRAND.line}`,
  background: BRAND.card,
  color: BRAND.inkSoft,
  WebkitAppearance: "none",
  MozAppearance: "none",
  appearance: "none",
//   fontSize: 16, // prevents iOS auto-zoom on focus
  backgroundImage: "none",
};

const inputBaseStyle: React.CSSProperties = {
  border: `1px solid ${BRAND.line}`,
  background: BRAND.card,
//   fontSize: 16, // prevents iOS auto-zoom on focus
};

function SelectWrap({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 shrink-0"
        style={{ color: BRAND.inkSoft }}
      />
    </div>
  );
}

// --- date range fields --------------------------------------------------
// Native <input type="date"> has no `placeholder` support in any browser —
// the empty-state segments (dd/mm/yyyy vs mm/dd/yyyy) and the picker's own
// format are both driven by locale instead. By default that locale is
// whatever the browser/OS is set to, which for most US-default setups
// renders mm/dd/yyyy. Setting `lang="en-GB"` on the input tells the browser
// to use British date ordering (dd/mm/yyyy) for both the placeholder
// segments and the native picker, while keeping the real tap-to-open
// calendar/wheel picker intact.

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
            className="w-full rounded-xl pl-9 pr-3 py-2.5 text-base md:text-sm outline-none"
            style={inputBaseStyle}
          />
        </div>

        {/* Filter by type */}
        <SelectWrap className="flex-1 lg:flex-none lg:w-40">
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value as FeedType)}
            className="w-full rounded-xl pl-3 pr-8 py-2.5 text-base md:text-sm font-normal outline-none"
            style={selectStyle}
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </SelectWrap>

        {/* Filter by date */}
        <SelectWrap className="flex-1 lg:flex-none lg:w-40">
          <select
            value={range}
            onChange={(e) => onRangeChange(e.target.value as DateRangePreset)}
            className="w-full rounded-xl pl-3 pr-8 py-2.5 text-base md:text-sm font-normal outline-none"
            style={selectStyle}
          >
            {RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </SelectWrap>

        {/* Sort */}
        <SelectWrap className="flex-1 lg:flex-none lg:w-40">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as FeedSort)}
            className="w-full rounded-xl pl-3 pr-8 py-2.5 text-base md:text-[14px] font-normal outline-none"
            style={selectStyle}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="amount_desc">Highest amount</option>
            <option value="amount_asc">Lowest amount</option>
          </select>
        </SelectWrap>
      </div>

      {/* Custom date range */}
      {range === "custom" && (
        <div className="flex gap-2 mt-2">
          <input
            type="date"
            lang="en-GB"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
            style={inputBaseStyle}
          />

          <input
            type="date"
            lang="en-GB"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
            style={inputBaseStyle}
          />
        </div>
      )}
    </div>
  );
}