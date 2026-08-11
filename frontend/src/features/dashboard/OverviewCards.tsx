import { FileText, CheckCircle2, Clock } from "lucide-react";
import { BRAND } from "../../lib/theme";
import type { InvoiceSummary } from "./invoicesApi";

const formatNaira = (n: number): string => `₦${Number(n || 0).toLocaleString("en-NG")}`;

export function OverviewCards({ summary }: { summary: InvoiceSummary }) {
  const cards = [
    { label: "Total invoices", value: String(summary.totalCount), icon: FileText, tint: BRAND.lav },
    { label: "Received", value: formatNaira(summary.totalReceived), icon: CheckCircle2, tint: BRAND.mint },
    { label: "Outstanding", value: formatNaira(summary.totalOutstanding), icon: Clock, tint: BRAND.peach },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory mx-1 px-4 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-3 lg:overflow-visible mb-6">
        {cards.map((card) => (
            <div
            key={card.label}
            className="rounded-2xl p-5 flex items-center gap-4 shrink-0 w-[68%] sm:w-auto snap-start"
            style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}
            >
          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: card.tint }}>
            <card.icon size={20} style={{ color: BRAND.ink }} />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.inkSoft }}>{card.label}</div>
            <div className="font-heading text-2xl">{card.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}