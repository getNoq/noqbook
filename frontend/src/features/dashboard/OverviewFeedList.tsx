import { Link } from "react-router-dom";
// import { ShoppingBag, Receipt as ReceiptIcon } from "lucide-react";
import { BRAND } from "../../lib/theme";
import { statusBadge } from "../../lib/invoiceHelpers";
import { OverviewRowMenu } from "./OverviewRowMenu";
import type { FeedItem } from "./overviewApi";

const formatNaira = (n: number) => `₦${Number(n || 0).toLocaleString("en-NG")}`;
const EXPENSE_BADGE = { label: "Recorded", bg: BRAND.lav, color: BRAND.lavStrong };

function badgeFor(item: FeedItem) {
  if (item.type === "sale" && item.status) return statusBadge(item.status as any);
  return EXPENSE_BADGE;
}

function detailPath(item: FeedItem) {
  return item.type === "sale" ? `/dashboard/invoices/${item.invoiceId}` : `/dashboard/expenses/${item.expenseId}`;
}

function FeedRowTitle({ item }: { item: FeedItem }) {
//   const Icon = item.type === "sale" ? ShoppingBag : ReceiptIcon;
  return (
    <div className="flex items-center gap-2">
      {/* <Icon size={14} style={{ color: BRAND.inkSoft }} className="shrink-0" /> */}
      <Link to={detailPath(item)} className="font-semibold hover:underline" style={{ color: "#4f3bb4" }}>
        {item.title}
      </Link>
    </div>
  );
}

export function OverviewFeedList({ items }: { items: FeedItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl p-10 text-center text-sm" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>
        Nothing here yet — sales and expenses you record will show up here.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {items.map((item) => {
          const badge = badgeFor(item);
          return (
            <div key={`${item.type}-${item.id}`} className="rounded-2xl p-4" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <FeedRowTitle item={item} />
                  <div className="text-xs mt-0.5" style={{ color: BRAND.inkSoft }}>{item.number} · {item.dateDisplay} · {item.metaLabel}</div>
                </div>
                <OverviewRowMenu item={item} />
              </div>
              <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${BRAND.line}` }}>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.inkSoft }}>Status</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.inkSoft }}>Amount</span>
                  <span className="font-heading text-[28px]" style={{ color: item.type === "expense" ? BRAND.red : BRAND.ink }}>
                    {/* {item.type === "expense" ? "-" : "+"}{formatNaira(item.amount)} */}
                    {formatNaira(item.amount)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block rounded-2xl overflow-hidden" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left" style={{ borderBottom: `1px solid ${BRAND.line}` }}>
                <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ color: BRAND.inkSoft }}>Title</th>
                <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ color: BRAND.inkSoft }}>Number</th>
                <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ color: BRAND.inkSoft }}>Date</th>
                <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wide" style={{ color: BRAND.inkSoft }}>Status</th>
                <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wide text-right" style={{ color: BRAND.inkSoft }}>Amount</th>
                <th className="px-5 py-3.5 w-12" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const badge = badgeFor(item);
                return (
                  <tr key={`${item.type}-${item.id}`} style={{ borderBottom: `1px solid ${BRAND.line}` }}>
                    <td className="px-5 py-4">
                      <FeedRowTitle item={item} />
                      <div className="text-xs mt-0.5" style={{ color: BRAND.inkSoft }}>{item.metaLabel}</div>
                    </td>
                    <td className="px-5 py-4" style={{ color: BRAND.inkSoft }}>{item.number}</td>
                    <td className="px-5 py-4" style={{ color: BRAND.inkSoft }}>{item.dateDisplay}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold" style={{ color: item.type === "expense" ? BRAND.red : BRAND.ink }}>
                      {/* {item.type === "expense" ? "-" : "+"}{formatNaira(item.amount)} */}
                      {formatNaira(item.amount)}
                    </td>
                    <td className="px-5 py-4"><OverviewRowMenu item={item} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}