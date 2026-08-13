import { Search, ChevronDown } from "lucide-react";
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

function formatDateForDisplay(value: string): string {
  if (!value) return "";

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) return "";

  return `${day}/${month}/${year}`;
}

function formatDateForApi(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 8);

  if (cleaned.length !== 8) return "";

  const day = cleaned.slice(0, 2);
  const month = cleaned.slice(2, 4);
  const year = cleaned.slice(4, 8);

  return `${year}-${month}-${day}`;
}

interface StyledSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
}

function StyledSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: StyledSelectProps) {
  return (
    <div className="relative flex-1 lg:flex-none lg:w-40">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="appearance-none w-full rounded-xl px-3 py-2.5 pr-9 text-sm font-semibold outline-none cursor-pointer"
        style={selectStyle}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        style={{ color: BRAND.inkSoft }}
      />
    </div>
  );
}

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative flex-1 min-w-0">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
        style={{
          border: `1px solid ${BRAND.line}`,
          background: BRAND.card,
          color: value ? BRAND.ink : BRAND.inkSoft,
        }}
      />

      {!value && (
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm bg-white px-1"
          style={{ color: "rgba(34,29,23,0.45)" }}
        >
          mm/dd/yyyy
        </span>
      )}
    </div>
  );
}

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
      {/* Search + filters */}
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

        {/* Type */}
        <StyledSelect
          value={type}
          onChange={(value) => onTypeChange(value as FeedType)}
          options={TYPE_OPTIONS}
          ariaLabel="Filter by type"
        />

        {/* Date */}
        <StyledSelect
          value={range}
          onChange={(value) =>
            onRangeChange(value as DateRangePreset)
          }
          options={RANGE_OPTIONS}
          ariaLabel="Filter by date"
        />

        {/* Sort */}
        <StyledSelect
          value={sort}
          onChange={(value) => onSortChange(value as FeedSort)}
          options={[
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
            { value: "amount_desc", label: "Highest amount" },
            { value: "amount_asc", label: "Lowest amount" },
          ]}
          ariaLabel="Sort"
        />
      </div>

      {/* Custom date range */}
      {range === "custom" && (
        <div className="flex gap-2 mt-2">
          <DateInput
            value={dateFrom}
            onChange={onDateFromChange}
          />

          <DateInput
            value={dateTo}
            onChange={onDateToChange}
          />
        </div>
      )}
    </div>
  );
}