import {
  Share2, Copy, RefreshCw, Check, Download, Link as LinkIcon,
  Bell, CheckCircle2, Clock, Palette, Lock,
} from "lucide-react";
import { BRAND } from "../../lib/theme";
import type { Invoice } from "./types";
import { PRESET_COLORS } from "./constants";
import { formatNaira, docLabel } from "./invoiceHelpers";

interface InvoiceReceiptProps {
  invoice: Invoice;
  imageBusy: boolean;
  onShareAsImage: () => void;
  onDownloadImage: () => void;
  linkLoading: boolean;
  onShareViaLink: () => void;
  hostedLink: string | null;
  onCopyLink: () => void;
  linkCopied: boolean;
  onCopyText: () => void;
  copied: boolean;
  onSendReminder: () => void;
  onMarkAsPaid: () => void;
  showColorTeaser: boolean;
  onToggleColorTeaser: () => void;
  onCreateAccount: () => void;
  onStartNewInvoice: () => void;
  onViewHistory: () => void;
  hasMultipleSavedInvoices: boolean;
}

export function InvoiceReceipt({
  invoice,
  imageBusy,
  onShareAsImage,
  onDownloadImage,
  linkLoading,
  onShareViaLink,
  hostedLink,
  onCopyLink,
  linkCopied,
  onCopyText,
  copied,
  onSendReminder,
  onMarkAsPaid,
  showColorTeaser,
  onToggleColorTeaser,
  onCreateAccount,
  onStartNewInvoice,
  onViewHistory,
  hasMultipleSavedInvoices,
}: InvoiceReceiptProps) {
  return (
    <div>
      <div className="rounded-3xl p-7 mb-5" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
        <div className="text-center border-b pb-4 mb-4" style={{ borderColor: BRAND.line }}>
          <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: BRAND.inkSoft }}>
            {docLabel(invoice.status)} · {invoice.invoiceNumber}
          </div>
          <div className="font-heading text-[32px]">{invoice.businessName}</div>
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
          <span className="font-semibold">Total</span>
          <span className="font-heading text-[32px]">{formatNaira(invoice.total, "code")}</span>
        </div>
        <div className="mt-4 flex justify-center">
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{
              background: invoice.status === "paid" ? BRAND.mint : BRAND.peach,
              color: invoice.status === "paid" ? BRAND.green : BRAND.red,
            }}
          >
            {invoice.status === "paid" ? "PAID" : "OUTSTANDING"}
          </span>
        </div>
        {invoice.status === "due" && (
          <button
            onClick={onMarkAsPaid}
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold"
            style={{ border: `1px solid ${BRAND.green}`, color: BRAND.green }}
          >
            <CheckCircle2 size={15} /> Mark as paid
          </button>
        )}
      </div>

      {/* Brand color — account-gated. Swatches are shown but locked, so
          the feature is visible and desirable rather than hidden, per
          "gentle, value-based prompt rather than a hard block". */}
      <div className="rounded-2xl p-5 mb-5" style={{ border: `1px solid ${BRAND.line}` }}>
        <button onClick={onToggleColorTeaser} className="w-full flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Palette size={16} /> Brand your invoices
          </span>
          <span className="text-xs font-semibold" style={{ color: BRAND.inkSoft }}>
            {showColorTeaser ? "Hide" : "Show"}
          </span>
        </button>
        {showColorTeaser && (
          <div className="mt-4">
            <div className="flex gap-3 mb-4">
              {PRESET_COLORS.map((c) => (
                <div
                  key={c.name}
                  title={c.name}
                  className="relative w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: c.value, opacity: 0.45 }}
                >
                  <Lock size={13} color="#FFFFFF" />
                </div>
              ))}
            </div>
            <div className="text-sm mb-3" style={{ color: BRAND.inkSoft }}>
              Personalize your records with brand colors when you sign up for free.
            </div>
            <button onClick={onCreateAccount} className="rounded-full px-5 py-2 font-semibold text-sm" style={{ background: BRAND.ink, color: BRAND.bg }}>
              Create a free account
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3 mb-3">
        <button
          onClick={onShareAsImage}
          disabled={imageBusy}
          className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 font-semibold text-sm"
          style={{ background: BRAND.ink, color: BRAND.bg, opacity: imageBusy ? 0.6 : 1 }}
        >
          <Share2 size={16} /> {imageBusy ? "Preparing image…" : "Share as image"}
        </button>
        <button
          onClick={onDownloadImage}
          className="flex items-center justify-center gap-2 rounded-full py-3 px-4 font-semibold text-sm"
          style={{ border: `1px solid ${BRAND.line}` }}
          aria-label="Download image"
        >
          <Download size={16} />
        </button>
      </div>

      <div className="flex gap-3 mb-5">
        <button
          onClick={onShareViaLink}
          disabled={linkLoading}
          className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 font-semibold text-sm"
          style={{ border: `1px solid ${BRAND.line}` }}
        >
          <LinkIcon size={16} /> {linkLoading ? "Creating link…" : "Share link on WhatsApp"}
        </button>
        <button
          onClick={onCopyLink}
          className="flex items-center justify-center gap-2 rounded-full py-3 px-4 font-semibold text-sm"
          style={{ border: `1px solid ${BRAND.line}` }}
          aria-label="Copy link"
        >
          {linkCopied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>

      {hostedLink && (
        <div className="text-xs mb-5 px-1" style={{ color: BRAND.inkSoft }}>
          Link (opens in browser, savable): <span className="underline">{hostedLink}</span>
        </div>
      )}

      <button onClick={onCopyText} className="w-full flex items-center justify-center gap-2 rounded-full py-2.5 mb-5 text-sm font-semibold" style={{ color: BRAND.inkSoft }}>
        {copied ? <Check size={14} /> : <Copy size={14} />} Copy as plain text
      </button>

      {invoice.status === "due" && invoice.customerPhone && (
        <button onClick={onSendReminder} className="w-full flex items-center justify-center gap-2 rounded-full py-3 mb-5 text-sm font-semibold" style={{ background: BRAND.peach, color: BRAND.red }}>
          <Bell size={15} /> Send payment reminder
        </button>
      )}

      <div className="rounded-2xl p-5 mb-5 text-sm" style={{ background: BRAND.lav }}>
        <div className="font-semibold mb-1">Want to track whether this gets paid?</div>
        <div style={{ color: BRAND.inkSoft }} className="mb-3">
          Save this {docLabel(invoice.status).toLowerCase()}, see customer history, and get basic branding — for free.
        </div>
        <button onClick={onCreateAccount} className="rounded-full px-5 py-2.5 font-semibold text-sm" style={{ background: BRAND.ink, color: BRAND.bg }}>
          Create free account
        </button>
      </div>

      <div className="flex items-center justify-center gap-5">
        <button onClick={onStartNewInvoice} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: BRAND.inkSoft }}>
          <RefreshCw size={14} /> New invoice
        </button>
        {hasMultipleSavedInvoices && (
          <button onClick={onViewHistory} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: BRAND.inkSoft }}>
            <Clock size={14} /> View all saved
          </button>
        )}
      </div>
    </div>
  );
}