import { FilePlus, ChevronRight } from "lucide-react";
import { BRAND } from "../../lib/theme";
import type { Invoice } from "./types";
import { MAX_GUEST_HISTORY } from "./constants";
import { formatNaira, docLabel } from "./invoiceHelpers";

interface InvoiceHistoryProps {
  savedInvoices: Invoice[];
  onOpenInvoice: (id: string) => void;
  onStartNewInvoice: () => void;
}

export function InvoiceHistory({ savedInvoices, onOpenInvoice, onStartNewInvoice }: InvoiceHistoryProps) {
  return (
    <div className="rounded-3xl p-7" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-heading text-2xl">Saved on this device</h1>
        <button onClick={onStartNewInvoice} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: BRAND.lavStrong }}>
          <FilePlus size={15} /> New
        </button>
      </div>
      <p className="text-sm mb-6" style={{ color: BRAND.inkSoft }}>
        Guest mode keeps your last {MAX_GUEST_HISTORY} records on this device only. Create a free account for unlimited history and backup that follows you across devices.
      </p>
      <div className="flex flex-col gap-2">
        {savedInvoices.map((inv) => (
          <button
            key={inv.id}
            onClick={() => onOpenInvoice(inv.id)}
            className="flex items-center justify-between rounded-2xl px-4 py-3 text-left"
            style={{ border: `1px solid ${BRAND.line}` }}
          >
            <div>
              <div className="font-semibold text-sm">{inv.customerName}</div>
              <div className="text-xs" style={{ color: BRAND.inkSoft }}>
                {inv.invoiceNumber} · {inv.createdAt} · {docLabel(inv.status)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{formatNaira(inv.total)}</span>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: inv.status === "paid" ? BRAND.mint : BRAND.peach,
                  color: inv.status === "paid" ? BRAND.green : BRAND.red,
                }}
              >
                {inv.status === "paid" ? "Paid" : "Due"}
              </span>
              <ChevronRight size={16} style={{ color: BRAND.inkSoft }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}