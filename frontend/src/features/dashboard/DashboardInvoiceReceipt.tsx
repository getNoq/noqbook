import { Share2, Copy, Check, Download, Link as LinkIcon, Bell, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { BRAND } from "../../lib/theme";
import type { Invoice } from "../../lib/invoiceTypes";
import { formatNaira, docLabel, shareCaption, reminderText, openWhatsApp } from "../../lib/invoiceHelpers";
import { renderInvoiceImage } from "../../lib/invoiceImage";
import { uploadInvoiceAndGetLink } from "../../lib/invoiceClientApi";
import { useAuth } from "../auth/AuthContext";

interface DashboardInvoiceReceiptProps {
  invoice: Invoice;
  onMarkAsPaid: () => void;
  onDone: () => void;
}

export function DashboardInvoiceReceipt({ invoice, onMarkAsPaid, onDone }: DashboardInvoiceReceiptProps) {
  const { accessToken } = useAuth();
//   const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);

  const shareAsImage = async () => {
    setImageBusy(true);
    try {
      const blob = await renderInvoiceImage(invoice);
      const file = new File([blob], `${docLabel(invoice.status).toLowerCase()}.png`, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: shareCaption(invoice) });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${docLabel(invoice.status).toLowerCase()}-${invoice.customerName}-${invoice.invoiceNumber}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setImageBusy(false);
    }
  };

  const shareLink = async () => {
    setLinkLoading(true);
    try {
      const link = await uploadInvoiceAndGetLink(invoice, accessToken);
      openWhatsApp(shareCaption(invoice, link), invoice.customerPhone);
    } finally {
      setLinkLoading(false);
    }
  };

  const copyLink = async () => {
    const link = await uploadInvoiceAndGetLink(invoice, accessToken);
    await navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1800);
  };

  return (
    <div className="max-w-xl mx-auto px-4 md:px-0 py-6">
      <div className="rounded-3xl p-7 mb-5" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
        <div className="text-center border-b pb-4 mb-4" style={{ borderColor: BRAND.line }}>
          <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: BRAND.inkSoft }}>{docLabel(invoice.status)} · {invoice.invoiceNumber}</div>
          <div className="font-heading text-[32px] leading-[32px]" style={{ color: invoice.brandColor || BRAND.ink }}>{invoice.businessName}</div>
          <div className="text-xs mt-1" style={{ color: BRAND.inkSoft }}>
            {invoice.status === "paid" ? `Paid ${invoice.paidDate}` : `Issued ${invoice.createdAt}`}
          </div>
        </div>
        <div className="flex justify-between text-sm mb-4 gap-4">
          <span style={{ color: BRAND.inkSoft }}>Customer</span>
          <span className="font-semibold">{invoice.customerName}</span>
        </div>
        <div className="flex flex-col gap-2 mb-4">
          {invoice.items.map((it) => (
            <div key={it.id} className="flex justify-between text-sm gap-4">
              <span>{it.qty} × {it.description}</span>
              <span>{formatNaira(Number(it.qty) * Number(it.unitPrice))}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center border-t pt-4" style={{ borderColor: BRAND.line }}>
          <span className="font-heading text-[24px]">Total</span>
          <span className="font-heading text-[32px]" style={{ color: invoice.brandColor || BRAND.ink }}>{formatNaira(invoice.total, "code")}</span>
        </div>
        {invoice.note && <div className="text-sm mt-3 text-center" style={{ color: BRAND.inkSoft }}>{invoice.note}</div>}
        <div className="mt-4 flex justify-center">
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: invoice.status === "paid" ? BRAND.mint : BRAND.peach, color: invoice.status === "paid" ? BRAND.green : BRAND.red }}>
            {invoice.status === "paid" ? "PAID" : "OUTSTANDING"}
          </span>
        </div>
        {invoice.status === "due" && (
          <button onClick={onMarkAsPaid} className="w-full mt-4 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold" style={{ border: `1px solid ${BRAND.green}`, color: BRAND.green }}>
            <CheckCircle2 size={15} /> Mark as paid
          </button>
        )}
      </div>

      <div className="flex gap-3 mb-3">
        <button onClick={shareAsImage} disabled={imageBusy} className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 font-semibold text-sm" style={{ background: BRAND.ink, color: BRAND.bg, opacity: imageBusy ? 0.6 : 1 }}>
          <Share2 size={16} /> {imageBusy ? "Preparing image…" : "Share as image"}
        </button>
        <button onClick={shareAsImage} className="flex items-center justify-center gap-2 rounded-full py-3 px-4 font-semibold text-sm" style={{ border: `1px solid ${BRAND.line}` }} aria-label="Download image"><Download size={16} /></button>
      </div>

      <div className="flex gap-3 mb-5">
        <button onClick={shareLink} disabled={linkLoading} className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 font-semibold text-sm" style={{ border: `1px solid ${BRAND.line}` }}>
          <LinkIcon size={16} /> {linkLoading ? "Creating link…" : "Share link on WhatsApp"}
        </button>
        <button onClick={copyLink} className="flex items-center justify-center gap-2 rounded-full py-3 px-4 font-semibold text-sm" style={{ border: `1px solid ${BRAND.line}` }} aria-label="Copy link">
          {linkCopied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>

      {invoice.status === "due" && invoice.customerPhone && (
        <button onClick={() => openWhatsApp(reminderText(invoice), invoice.customerPhone)} className="w-full flex items-center justify-center gap-2 rounded-full py-3 mb-5 text-sm font-semibold" style={{ background: BRAND.peach, color: BRAND.red }}>
          <Bell size={15} /> Send payment reminder
        </button>
      )}

      <button onClick={onDone} className="w-full rounded-full py-3.5 font-semibold text-sm" style={{ background: "#ffffff", color: BRAND.ink, border: "1px solid rgba(34, 29, 23, 0.12)" }}>
        Done - back to overview
      </button>
    </div>
  );
}