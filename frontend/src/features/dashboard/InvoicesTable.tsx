import { BRAND } from "../../lib/theme";
import type { Invoice } from "../../lib/invoiceTypes";
import { formatNaira, docLabel } from "../../lib/invoiceHelpers";
import { RowActionsMenu } from "./RowActionsMenu";
import { InvoiceCard } from "./InvoiceCard";
import { Link } from "react-router-dom";

interface InvoicesTableProps {
  invoices: Invoice[];
  onMarkAsPaid: (invoice: Invoice) => void;
  onSendReminder: (invoice: Invoice) => void;
  onShareAsImage: (invoice: Invoice) => void;
  onShareLink: (invoice: Invoice) => void;
}

export function InvoicesTable({ invoices, onMarkAsPaid, onSendReminder, onShareAsImage, onShareLink }: InvoicesTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-2xl p-10 text-center text-sm" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>
        No invoices yet. Ones you create will show up here.
      </div>
    );
  }

  return (
    <>
    <div className="flex flex-col gap-3 md:hidden">
      {invoices.map((inv) => (
        <InvoiceCard
          key={inv.id}
          invoice={inv}
          onMarkAsPaid={() => onMarkAsPaid(inv)}
          onSendReminder={() => onSendReminder(inv)}
          onShareAsImage={() => onShareAsImage(inv)}
          onShareLink={() => onShareLink(inv)}
        />
      ))}
    </div>
    <div className="hidden md:block rounded-2xl overflow-hidden" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
      {/* Horizontal scroll on narrow screens rather than a card relayout
          — keeps every column visible without a second layout to maintain. */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left" style={{ borderBottom: `1px solid ${BRAND.line}` }}>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ color: BRAND.inkSoft }}>Customer</th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ color: BRAND.inkSoft }}>Invoice #</th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ color: BRAND.inkSoft }}>Date</th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ color: BRAND.inkSoft }}>Status</th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wide text-right" style={{ color: BRAND.inkSoft }}>Amount</th>
              <th className="px-5 py-3.5 w-12" />
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} style={{ borderBottom: `1px solid ${BRAND.line}` }}>
                <td className="px-5 py-4">
                    <Link to={`/dashboard/invoices/${inv.id}`} className="font-semibold hover:underline" style={{ color: "#4f3bb4" }}>
                        {inv.customerName}
                    </Link>
                  <div className="text-xs" style={{ color: BRAND.inkSoft }}>{docLabel(inv.status)}</div>
                </td>
                <td className="px-5 py-4" style={{ color: BRAND.inkSoft }}>{inv.invoiceNumber}</td>
                <td className="px-5 py-4" style={{ color: BRAND.inkSoft }}>{inv.createdAt}</td>
                <td className="px-5 py-4">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: inv.status === "paid" ? BRAND.mint : BRAND.peach, color: inv.status === "paid" ? BRAND.green : BRAND.red }}>
                    {inv.status === "paid" ? "Paid" : "Due"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-semibold">{formatNaira(inv.total)}</td>
                <td className="px-5 py-4">
                  <RowActionsMenu
                    invoice={inv}
                    onMarkAsPaid={() => onMarkAsPaid(inv)}
                    onSendReminder={() => onSendReminder(inv)}
                    onShareAsImage={() => onShareAsImage(inv)}
                    onShareLink={() => onShareLink(inv)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}