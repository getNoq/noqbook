import { useState } from "react";
import { Share2, Copy, Check, Download, Link as LinkIcon, Bell, Wallet, ChevronDown, ChevronUp } from "lucide-react";
import { BRAND } from "../../lib/theme";
import type { Invoice } from "../../lib/invoiceTypes";
import { formatNaira, docLabel, statusBadge, shareCaption, reminderText, openWhatsApp } from "../../lib/invoiceHelpers";
import { renderInvoiceImage } from "../../lib/invoiceImage";
import { uploadInvoiceAndGetLink } from "../../lib/invoiceClientApi";
import { useAuth } from "../auth/AuthContext";
import { recordPayment } from "./invoicesApi";

interface DashboardInvoiceReceiptProps {
  invoice: Invoice;
  onPaymentRecorded: (updated: Invoice) => void;
  onDone: () => void;
}

export function DashboardInvoiceReceipt({ invoice, onPaymentRecorded, onDone }: DashboardInvoiceReceiptProps) {
  const { accessToken } = useAuth();
  const [linkCopied, setLinkCopied] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);

  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | "">("");
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [justRecorded, setJustRecorded] = useState(false);

  const badge = statusBadge(invoice.status);
  const amountPaid = invoice.amountPaid ?? (invoice.status === "paid" ? invoice.total : 0);
  const amountDue = invoice.amountDue ?? invoice.total - amountPaid;

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

  const submitPayment = async () => {
    if (!accessToken || paymentAmount === "" || Number(paymentAmount) <= 0) return;
    setPaymentBusy(true);
    setPaymentError(null);
    try {
      const updated = await recordPayment(accessToken, invoice.id, Number(paymentAmount));
      onPaymentRecorded(updated);
      setPaymentAmount("");
      setShowRecordPayment(false);
      setJustRecorded(true);
      setTimeout(() => setJustRecorded(false), 5000);
    } catch (err: any) {
      setPaymentError(err?.message || "Couldn't record that payment. Try again.");
    } finally {
      setPaymentBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 md:px-0 py-6">
      <div className="rounded-3xl p-7 mb-5" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
        <div className="text-center border-b pb-4 mb-4" style={{ borderColor: BRAND.line }}>
          <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>{docLabel(invoice.status)} · {invoice.invoiceNumber}</div>
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
        {invoice.note && (
            <>
                <div className="font-heading text-[18px] text-gray-700 mt-3">Note:</div>
                <div className="text-sm text-left whitespace-pre-wrap" style={{ color: BRAND.inkSoft }}>{invoice.note}
                </div>
            </>
        )}
        <div className="mt-4 flex justify-center">
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: badge.bg, color: badge.color }}>{badge.label.toUpperCase()}</span>
        </div>
      </div>

      {justRecorded && (
        <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: BRAND.mint, color: BRAND.green }}>
          Payment recorded. Remember to share the updated {docLabel(invoice.status).toLowerCase()} with your customer.
        </div>
      )}

      {/* Payment tracking — kept separate from the receipt card above,
          which stays a clean, shareable document. Everything below is
          app-only bookkeeping. */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
        <div className="flex items-center justify-between text-sm py-1.5">
          <span style={{ color: BRAND.inkSoft }}>Invoice total</span>
          <span className="font-semibold">{formatNaira(invoice.total)}</span>
        </div>
        <div className="flex items-center justify-between text-sm py-1.5">
          <span style={{ color: BRAND.inkSoft }}>Already paid</span>
          <span className="font-semibold" style={{ color: BRAND.green }}>{formatNaira(amountPaid)}</span>
        </div>
        <div className="flex items-center justify-between text-sm py-1.5 mb-2">
          <span style={{ color: BRAND.inkSoft }}>Outstanding</span>
          <span className="font-semibold" style={{ color: amountDue > 0 ? BRAND.red : BRAND.inkSoft }}>{formatNaira(amountDue)}</span>
        </div>

        {invoice.status !== "paid" && (
          <>
            <button onClick={() => setShowRecordPayment((v) => !v)} className="w-full flex items-center justify-between mt-2 pt-3" style={{ borderTop: `1px solid ${BRAND.line}` }}>
              <span className="flex items-center gap-2 text-sm font-semibold"><Wallet size={16} /> Record payment</span>
              {showRecordPayment ? <ChevronUp size={16} style={{ color: BRAND.inkSoft }} /> : <ChevronDown size={16} style={{ color: BRAND.inkSoft }} />}
            </button>

            {showRecordPayment && (
              <div className="mt-4">
                {paymentError && (
                  <div className="rounded-xl px-3 py-2 mb-3 text-xs" style={{ background: BRAND.peach, color: BRAND.red }}>{paymentError}</div>
                )}
                <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Payment amount</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    min={0}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="0"
                    className="flex-1 rounded-xl px-4 py-2.5 text-base md:text-sm outline-none"
                    style={{ border: `1px solid ${BRAND.line}` }}
                  />
                  <button onClick={() => setPaymentAmount(amountDue)} className="rounded-xl px-3 text-xs font-semibold whitespace-nowrap" style={{ border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>
                    Pay in full
                  </button>
                </div>
                <button
                  onClick={submitPayment}
                  disabled={paymentBusy || paymentAmount === "" || Number(paymentAmount) <= 0}
                  className="w-full rounded-full py-3 font-semibold text-sm transition-opacity"
                  style={{ background: BRAND.ink, color: BRAND.bg, opacity: paymentBusy || paymentAmount === "" || Number(paymentAmount) <= 0 ? 0.5 : 1 }}
                >
                  {paymentBusy ? "Recording…" : "Record payment"}
                </button>
              </div>
            )}
          </>
        )}

        {invoice.payments && invoice.payments.length > 0 && (
          <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${BRAND.line}` }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: BRAND.inkSoft }}>Payment history</div>
            <div className="flex flex-col gap-2">
              {invoice.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span style={{ color: BRAND.inkSoft }}>{p.paidDate}</span>
                  <span className="font-semibold">{formatNaira(p.amount)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm mt-3 pt-3" style={{ borderTop: `1px dashed ${BRAND.line}` }}>
              <span className="font-semibold">Total paid</span>
              <span className="font-semibold">{formatNaira(amountPaid)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 mb-3">
        <button onClick={shareAsImage} disabled={imageBusy} className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 font-semibold text-sm" style={{ background: BRAND.ink, color: BRAND.bg, opacity: imageBusy ? 0.6 : 1 }}>
          <Share2 size={16} /> {imageBusy ? "Preparing image…" : "Share as image"}
        </button>
        <button onClick={shareAsImage} className="flex items-center justify-center gap-2 rounded-full py-3 px-4 font-semibold text-sm" style={{ border: `1px solid ${BRAND.line}` }} aria-label="Download image"><Download size={16} /></button>
      </div>

      <div className="flex gap-3 mb-5">
        <button onClick={shareLink} disabled={linkLoading} className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 font-semibold text-sm text-white" style={{ backgroundColor: "#1fb958", border: "1px solid #1fb958" }}>
          <LinkIcon size={16} /> {linkLoading ? "Creating link…" : "Share link on WhatsApp"}
        </button>
        <button onClick={copyLink} className="flex items-center justify-center gap-2 rounded-full py-3 px-4 font-semibold text-sm" style={{ border: `1px solid ${BRAND.line}` }} aria-label="Copy link">
          {linkCopied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>

      {invoice.status !== "paid" && invoice.customerPhone && (
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