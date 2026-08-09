import { BRAND } from "../../lib/theme";
import type { Invoice } from "../../lib/invoiceTypes";
import { formatNaira, docLabel } from "../../lib/invoiceHelpers";
import { RowActionsMenu } from "./RowActionsMenu";

interface InvoiceCardProps {
  invoice: Invoice;
  onMarkAsPaid: () => void;
  onSendReminder: () => void;
  onShareAsImage: () => void;
  onShareLink: () => void;
}

export function InvoiceCard({ invoice, onMarkAsPaid, onSendReminder, onShareAsImage, onShareLink }: InvoiceCardProps) {
  return (
    <div className="rounded-2xl p-4" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-sm">{invoice.customerName}</div>
          <div className="text-xs mt-0.5" style={{ color: BRAND.inkSoft }}>
            {invoice.invoiceNumber} · {invoice.createdAt} · {docLabel(invoice.status)}
          </div>
        </div>
        <RowActionsMenu invoice={invoice} onMarkAsPaid={onMarkAsPaid} onSendReminder={onSendReminder} onShareAsImage={onShareAsImage} onShareLink={onShareLink} />
      </div>

      <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${BRAND.line}` }}>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.inkSoft }}>Status</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: invoice.status === "paid" ? BRAND.mint : BRAND.peach, color: invoice.status === "paid" ? BRAND.green : BRAND.red }}>
            {invoice.status === "paid" ? "Paid" : "Due"}
          </span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.inkSoft }}>Amount</span>
          <span className="font-heading text-[24px] leading-[24px]">{formatNaira(invoice.total)}</span>
        </div>
      </div>
    </div>
  );
}