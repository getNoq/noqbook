import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MoreVertical, Eye, Wallet, Bell, Share2, Link as LinkIcon } from "lucide-react";
import { BRAND } from "../../lib/theme";
import type { Invoice } from "../../lib/invoiceTypes";

interface RowActionsMenuProps {
  invoice: Invoice;
  onSendReminder: () => void;
  onShareAsImage: () => void;
  onShareLink: () => void;
}

export function RowActionsMenu({ invoice, onSendReminder, onShareAsImage, onShareLink }: RowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const itemClass = "w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left hover:bg-black/[0.03]";

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setOpen((v) => !v)} className="p-1.5 rounded-lg" style={{ color: BRAND.inkSoft }} aria-label="Row actions" aria-expanded={open}>
        <MoreVertical size={18} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-52 rounded-xl py-1.5 z-20" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}`, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
          <Link to={`/dashboard/sales/${invoice.id}`} onClick={() => setOpen(false)} className={itemClass} style={{ color: BRAND.ink }}>
            <Eye size={15} style={{ color: BRAND.inkSoft }} /> View details
          </Link>
          {invoice.status !== "paid" && (
            <Link to={`/dashboard/sales/${invoice.id}`} onClick={() => setOpen(false)} className={itemClass} style={{ color: BRAND.ink }}>
              <Wallet size={15} style={{ color: BRAND.inkSoft }} /> Record payment
            </Link>
          )}
          {invoice.status !== "paid" && !!invoice.customerPhone && (
            <button onClick={() => { setOpen(false); onSendReminder(); }} className={itemClass} style={{ color: BRAND.ink }}>
              <Bell size={15} style={{ color: BRAND.inkSoft }} /> Send reminder
            </button>
          )}
          <button onClick={() => { setOpen(false); onShareAsImage(); }} className={itemClass} style={{ color: BRAND.ink }}>
            <Share2 size={15} style={{ color: BRAND.inkSoft }} /> Share as image
          </button>
          <button onClick={() => { setOpen(false); onShareLink(); }} className={itemClass} style={{ color: BRAND.ink }}>
            <LinkIcon size={15} style={{ color: BRAND.inkSoft }} /> Share link
          </button>
        </div>
      )}
    </div>
  );
}