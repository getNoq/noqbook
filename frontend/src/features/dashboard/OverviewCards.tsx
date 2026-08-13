import { Wallet, TrendingDown, TrendingUp } from "lucide-react";
import { BRAND } from "../../lib/theme";
import type { OverviewSummary } from "./overviewApi";

const formatNaira = (n: number): string => `₦${Number(n || 0).toLocaleString("en-NG")}`;

export function OverviewCards({ summary }: { summary: OverviewSummary }) {
  const profitPositive = summary.profit >= 0;

  const cards = [
    { label: "Sales", value: formatNaira(summary.totalSales), icon: Wallet, tint: BRAND.lav },
    { label: "Expenses", value: formatNaira(summary.totalExpenses), icon: TrendingDown, tint: BRAND.peach },
    { label: "Profit", value: formatNaira(summary.profit), icon: TrendingUp, tint: profitPositive ? BRAND.mint : BRAND.peach },
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