import { useEffect, useRef, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { BRAND } from "../../lib/theme"; // adjust relative path to match where this file lives

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
  /** Which edge the calendar popover anchors to — use "right" for a
   * field sitting near the right edge of the screen (e.g. a "to" date)
   * so the calendar doesn't overflow off-screen on mobile. */
  align?: "left" | "right";
  /** ISO yyyy-mm-dd. Dates after this are greyed out and unselectable. */
  maxDate?: string;
  /** ISO yyyy-mm-dd. Dates before this are greyed out and unselectable. */
  minDate?: string;
}

export function DatePickerField({
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
  className = "",
  align = "left",
  maxDate,
  minDate,
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
  const maxDateObj = maxDate ? isoToDate(maxDate) : undefined;
  const minDateObj = minDate ? isoToDate(minDate) : undefined;

  // Build the disabled matcher(s) for DayPicker. DateInterval requires both
    // `before` and `after` together, so a single partial object with either
    // one optional doesn't type-check — instead we pass separate DateAfter /
    // DateBefore matcher objects in an array, only including the bounds that
    // were actually provided.
    const disabledMatchers: Array<{ after: Date } | { before: Date }> = [];
    if (maxDateObj) disabledMatchers.push({ after: maxDateObj });
    if (minDateObj) disabledMatchers.push({ before: minDateObj });

  return (
    <div ref={containerRef} className={`relative min-w-0 w-full ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-base md:text-sm outline-none"
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
          className={`absolute z-20 mt-1 max-w-[92vw] overflow-x-auto rounded-xl p-2 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
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
            defaultMonth={isoToDate(value) ?? maxDateObj}
            disabled={disabledMatchers.length > 0 ? disabledMatchers : undefined}
            style={
              {
                "--rdp-cell-size": "clamp(1.75rem, 8.5vw, 2.25rem)",
              } as React.CSSProperties
            }
          />
        </div>
      )}
    </div>
  );
}