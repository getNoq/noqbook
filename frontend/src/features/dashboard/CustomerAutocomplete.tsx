import { useEffect, useRef, useState } from "react";
import { BRAND } from "../../lib/theme";
import { useAuth } from "../auth/AuthContext";
import { fetchCustomers } from "./customersApi";
import type { Customer } from "../../lib/customerTypes";

interface CustomerAutocompleteProps {
  value: string;
  onChange: (name: string) => void;
  onSelectCustomer: (customer: Customer) => void;
  invalid: boolean;
}

export function CustomerAutocomplete({ value, onChange, onSelectCustomer, invalid }: CustomerAutocompleteProps) {
  const { accessToken } = useAuth();
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  useEffect(() => {
    if (!accessToken || value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        const data = await fetchCustomers(accessToken, value.trim(), 1);
        setSuggestions(data.results.slice(0, 5));
      } catch {
        // non-fatal — autocomplete just stays empty
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [accessToken, value]);

  return (
    <div className="relative" ref={containerRef}>
      <input
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="e.g. Chidinma"
        className="w-full rounded-xl px-4 py-3 text-sm outline-none"
        style={{ border: `1px solid ${invalid ? BRAND.red : BRAND.line}` }}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 rounded-xl py-1.5 z-20" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}`, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
          {suggestions.map((c) => (
            <button
              key={c.id}
              onClick={() => { onSelectCustomer(c); setOpen(false); }}
              className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-left hover:bg-black/[0.03]"
              style={{ color: BRAND.ink }}
            >
              <span className="font-semibold">{c.name}</span>
              {c.phone && <span className="text-xs" style={{ color: BRAND.inkSoft }}>{c.phone}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}