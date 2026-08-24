import { Search, ChevronDown } from "lucide-react";
import { BRAND } from "../../lib/theme";
import type { FeedType, DateRangePreset, FeedSort } from "./overviewApi";
import { DatePickerField } from "../../components/ui/DatePickerField";

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
  status: string;
  onStatusChange: (v: string) => void;
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

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "paid", label: "Paid" },
  { value: "partially_paid", label: "Part payment" },
  { value: "due", label: "Unpaid" },
  { value: "recorded", label: "Recorded (expenses)" },
];

const selectStyle = {
  border: `1px solid ${BRAND.line}`,
  background: BRAND.card,
  color: BRAND.inkSoft,
};

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
    <div className="relative shrink-0 w-28 lg:flex-none lg:w-32">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="appearance-none w-full rounded-xl px-3 py-2.5 pr-9 text-base md:text-sm font-normal outline-none cursor-pointer"
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
    status,
    onStatusChange,
  } = props;

  return (
    <div className="mb-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-2">
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
            placeholder="Search by name or title…"
            className="w-full rounded-xl pl-9 pr-3 py-2.5 text-base md:text-sm outline-none"
            style={{
              border: `1px solid ${BRAND.line}`,
              background: BRAND.card,
            }}
          />
        </div>

        {/* Filters — horizontal scroll on mobile, inline row on desktop */}
        <div className="flex gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
          <StyledSelect
            value={type}
            onChange={(value) => onTypeChange(value as FeedType)}
            options={TYPE_OPTIONS}
            ariaLabel="Filter by type"
          />

          <StyledSelect
            value={range}
            onChange={(value) => onRangeChange(value as DateRangePreset)}
            options={RANGE_OPTIONS}
            ariaLabel="Filter by date"
          />

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

          <StyledSelect
            value={status}
            onChange={onStatusChange}
            options={STATUS_OPTIONS}
            ariaLabel="Filter by status"
          />
        </div>
      </div>

      {/* Custom date range */}
      {range === "custom" && (
        <div className="flex gap-2 mt-2">
          <DatePickerField
            value={dateFrom}
            onChange={onDateFromChange}
            className="flex-1"
            align="left"
          />
          <DatePickerField
            value={dateTo}
            onChange={onDateToChange}
            className="flex-1"
            align="right"
          />
        </div>
      )}
    </div>
  );
}
