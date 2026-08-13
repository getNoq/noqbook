import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Eye, Wallet, Bell, Share2, Link as LinkIcon, Download, ExternalLink } from "lucide-react";
import { BRAND } from "../../lib/theme";
import type { Invoice } from "../../lib/invoiceTypes";
import { reminderText, shareCaption, openWhatsApp, docLabel } from "../../lib/invoiceHelpers";
import { renderInvoiceImage } from "../../lib/invoiceImage";
import { uploadInvoiceAndGetLink } from "../../lib/invoiceClientApi";
import { renderExpenseVoucherImage } from "../../lib/expenseVoucherImage";
import { fetchInvoiceDetail } from "./invoicesApi";
import { useAuth } from "../auth/AuthContext";
import type { FeedItem } from "./overviewApi";

export function OverviewRowMenu({ item }: { item: FeedItem }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { accessToken, user } = useAuth();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const close = () => setOpen(false);
  const itemClass = "w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left hover:bg-black/[0.03] disabled:opacity-50";

  // FeedItem is a lightweight summary — sharing/reminding needs the
  // full invoice (line items, phone number), so fetch it only when
  // one of these actions is actually clicked, not for every row.
  const withFullInvoice = async (action: (inv: Invoice) => void | Promise<void>) => {
    if (!accessToken || !item.invoiceId) return;
    setBusy(true);
    try {
      const invoice = await fetchInvoiceDetail(accessToken, item.invoiceId);
      await action(invoice);
    } finally {
      setBusy(false);
      close();
    }
  };

  const downloadExpenseVoucher = async () => {
    close();
    const blob = await renderExpenseVoucherImage(
      { amount: item.amount, categoryDisplay: item.metaLabel, expenseDateDisplay: item.dateDisplay, title: item.title },
      user?.businessName || ""
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expense-voucher-${item.number}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="p-1.5 rounded-lg" style={{ color: BRAND.inkSoft }} aria-label="Row actions" aria-expanded={open}>
        <MoreVertical size={18} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-52 rounded-xl py-1.5 z-20" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}`, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
          <button
            onClick={() => { close(); navigate(item.type === "sale" ? `/dashboard/invoices/${item.invoiceId}` : `/dashboard/expenses/${item.expenseId}`); }}
            className={itemClass} style={{ color: BRAND.ink }}
          >
            <Eye size={15} style={{ color: BRAND.inkSoft }} /> View details
          </button>

          {item.type === "sale" && item.status !== "paid" && (
            <button onClick={() => { close(); navigate(`/dashboard/invoices/${item.invoiceId}`); }} disabled={busy} className={itemClass} style={{ color: BRAND.ink }}>
              <Wallet size={15} style={{ color: BRAND.inkSoft }} /> Record payment
            </button>
          )}

          {item.type === "sale" && item.status !== "paid" && (
            <button
              disabled={busy}
              onClick={() => withFullInvoice((inv) => { if (inv.customerPhone) openWhatsApp(reminderText(inv), inv.customerPhone); })}
              className={itemClass} style={{ color: BRAND.ink }}
            >
              <Bell size={15} style={{ color: BRAND.inkSoft }} /> Send reminder
            </button>
          )}

          {item.type === "sale" && (
            <button
              disabled={busy}
              onClick={() =>
                withFullInvoice(async (inv) => {
                  const blob = await renderInvoiceImage(inv);
                  const file = new File([blob], `${docLabel(inv.status).toLowerCase()}.png`, { type: "image/png" });
                  const nav = navigator as Navigator & { canShare?: (d?: ShareData) => boolean };
                  if (nav.canShare && nav.canShare({ files: [file] })) {
                    await navigator.share({ files: [file], text: shareCaption(inv) });
                  } else {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${docLabel(inv.status).toLowerCase()}-${inv.customerName}-${inv.invoiceNumber}.png`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }
                })
              }
              className={itemClass} style={{ color: BRAND.ink }}
            >
              <Share2 size={15} style={{ color: BRAND.inkSoft }} /> Share as image
            </button>
          )}

          {item.type === "sale" && (
            <button
              disabled={busy}
              onClick={() =>
                withFullInvoice(async (inv) => {
                  const link = await uploadInvoiceAndGetLink(inv, accessToken);
                  openWhatsApp(shareCaption(inv, link), inv.customerPhone);
                })
              }
              className={itemClass} style={{ color: BRAND.ink }}
            >
              <LinkIcon size={15} style={{ color: BRAND.inkSoft }} /> Share link
            </button>
          )}

          {item.type === "expense" && item.receiptUrl && (
            <a href={item.receiptUrl} target="_blank" rel="noopener noreferrer" onClick={close} className={itemClass} style={{ color: BRAND.ink }}>
              <ExternalLink size={15} style={{ color: BRAND.inkSoft }} /> View receipt
            </a>
          )}

          {item.type === "expense" && (
            <button onClick={downloadExpenseVoucher} className={itemClass} style={{ color: BRAND.ink }}>
              <Download size={15} style={{ color: BRAND.inkSoft }} /> Download voucher
            </button>
          )}
        </div>
      )}
    </div>
  );
}