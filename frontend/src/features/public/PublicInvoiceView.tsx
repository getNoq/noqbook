import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BRAND, FONT_IMPORT_BLOCK } from "../../lib/theme";
import { formatNaira, docLabel } from "../../lib/invoiceHelpers";

interface PublicShareData {
  businessName: string;
  customerName: string;
  invoiceNumber: string;
  items: { description: string; qty: number; unitPrice: number }[];
  total: number;
  status: "paid" | "due" | "partially_paid";
  amountPaid: number;
  amountDue: number;
  createdAt: string;
  paidDate: string | null;
  note: string;
  brandColor: string;
}

// const docLabel = (status: string) => (status === "paid" ? "Receipt" : "Invoice");

export function PublicInvoiceView() {
  const { id } = useParams<{ id: string }>();
  const [share, setShare] = useState<PublicShareData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/invoices/share/${id}/`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "This invoice link doesn't exist or has expired.");
        }
        return res.json();
      })
      .then(setShare)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  const accentColor = share?.brandColor || BRAND.ink;

  return (
    <div style={{ background: BRAND.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      <style>{FONT_IMPORT_BLOCK}</style>
      <div className="max-w-[560px] mx-auto px-6 py-12">
        {isLoading && <p className="text-center text-sm" style={{ color: BRAND.inkSoft }}>Loading…</p>}
        {!isLoading && error && <p className="text-center text-sm" style={{ color: BRAND.red }}>{error}</p>}
        {!isLoading && share && (
          <div className="rounded-3xl p-7" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
            <div className="text-center border-b pb-4 mb-4" style={{ borderColor: BRAND.line }}>
              <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: BRAND.inkSoft }}>
                {docLabel(share.status)} · {share.invoiceNumber}
              </div>
              <div className="font-heading max-[378px]:text-[28px] text-[36px] leading-[36px]" style={{ color: accentColor }}>{share.businessName}</div>
              <div className="text-xs mt-1" style={{ color: BRAND.inkSoft }}>
                {share.status === "paid" ? `Paid ${share.paidDate || share.createdAt}` : `Issued ${share.createdAt}`}
              </div>
            </div>

            <div className="flex justify-between text-sm mb-4 gap-4">
              <span style={{ color: BRAND.inkSoft }}>Customer</span>
              <span className="font-semibold text-right">{share.customerName}</span>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              {share.items.map((it, i) => (
                <div key={i} className="flex justify-between text-sm gap-4">
                  <span>{it.qty} × {it.description}</span>
                  <span>{formatNaira(it.qty * it.unitPrice)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center border-t pt-4" style={{ borderColor: BRAND.line }}>
              <span className="font-semibold">Total</span>
              <span className="font-heading text-[28px]" style={{ color: accentColor }}>{formatNaira(share.total, "code")}</span>
            </div>

            <div className="mt-4 flex flex-col items-center gap-1">
              {share.status === "paid" && (
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: BRAND.mint, color: BRAND.green }}>PAID</span>
              )}
              {share.status === "partially_paid" && (
                <>
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: BRAND.amber, color: BRAND.amberStrong }}>PARTIALLY PAID</span>
                  <span className="text-sm mt-2" style={{ color: BRAND.inkSoft }}>{formatNaira(share.amountPaid)} paid · {formatNaira(share.amountDue)} outstanding</span>
                </>
              )}
              {share.status === "due" && (
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: BRAND.peach, color: BRAND.red }}>OUTSTANDING</span>
              )}
            </div>

            {share.note && 
                <div className="border-b pb-6 mb-4" style={{ borderColor: BRAND.line }}>
                    <div className="font-heading text-lg text-[#374151] mt-3">Note:</div>
                    <div className="text-sm mt-[2px] text-left whitespace-pre-wrap" style={{ color: BRAND.inkSoft }}>{share.note}</div>
                </div>
            }

            
            <p className="text-center text-sm mt-6" style={{ color: BRAND.inkSoft }}>Powered by Yousual</p>
          </div>
        )}
      </div>
    </div>
  );
}