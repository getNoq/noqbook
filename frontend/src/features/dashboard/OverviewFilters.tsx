import { useEffect, useRef, useState } from "react";
import { Search, ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
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

// --- date picker field ----------------------------------------------------
// Replaces the native <input type="date"> entirely. This is a plain button
// styled exactly like the other filter fields (so it always shows a real,
// controllable "dd/mm/yyyy" placeholder, and never triggers iOS's native
// -webkit-appearance chrome) that opens a react-day-picker calendar
// popover on click/tap. No native browser date UI is involved anywhere in
// this component, so there's nothing left for iOS or desktop browsers to
// render inconsistently.
//
// Requires: npm install react-day-picker
// The "react-day-picker/style.css" import only needs to happen once
// anywhere in the app — safe to leave here, or move to a root layout file.

function isoToDate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function dateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isoToDisplay(iso: string): string {
  const date = isoToDate(iso);
  if (!date) return "";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}

interface DatePickerFieldProps {
  value: string; // ISO yyyy-mm-dd, empty string if unset
  onChange: (iso: string) => void;
  placeholder?: string;
  className?: string;
}

function DatePickerField({
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
  className = "",
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const display = isoToDisplay(value);

  return (
    <div ref={containerRef} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm outline-none"
        style={{
          border: `1px solid ${BRAND.line}`,
          background: BRAND.card,
          color: display ? undefined : BRAND.inkSoft,
        }}
      >
        <span className="truncate">{display || placeholder}</span>
        <CalendarIcon size={16} className="shrink-0" style={{ color: BRAND.inkSoft }} />
      </button>

      {open && (
        <div
          className="absolute z-20 mt-1 rounded-xl p-2 shadow-lg"
          style={{ border: `1px solid ${BRAND.line}`, background: BRAND.card }}
        >
          <DayPicker
            mode="single"
            selected={isoToDate(value)}
            onSelect={(date) => {
              if (date) {
                onChange(dateToIso(date));
                setOpen(false);
              }
            }}
            defaultMonth={isoToDate(value)}
          />
        </div>
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
          <DatePickerField value={dateFrom} onChange={onDateFromChange} />
          <DatePickerField value={dateTo} onChange={onDateToChange} />
        </div>
      )}
    </div>
  );
}