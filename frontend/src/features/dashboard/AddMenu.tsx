import { useEffect, useRef, useState } from "react";
import { Plus, ShoppingBag, Receipt } from "lucide-react";
import { BRAND } from "../../lib/theme";

interface AddMenuProps {
  onRecordSale: () => void;
  onRecordExpense: () => void;
}

export function AddMenu({ onRecordSale, onRecordExpense }: AddMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold" style={{ background: BRAND.ink, color: BRAND.bg }}>
        <Plus size={16} /> <span className="hidden sm:inline">Record</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl py-1.5 z-20" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}`, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
          <button onClick={() => { setOpen(false); onRecordSale(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left hover:bg-black/[0.03]" style={{ color: BRAND.ink }}>
            <ShoppingBag size={15} style={{ color: BRAND.inkSoft }} /> Record a sale
          </button>
          <button onClick={() => { setOpen(false); onRecordExpense(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left hover:bg-black/[0.03]" style={{ color: BRAND.ink }}>
            <Receipt size={15} style={{ color: BRAND.inkSoft }} /> Record an expense
          </button>
        </div>
      )}
    </div>
  );
}