import { useEffect, useState } from "react";
import { BRAND, FONT_IMPORT_BLOCK } from "../../lib/theme";
import {
  reminderText,
  shareCaption,
  openWhatsApp,
  docLabel,
} from "../../lib/invoiceHelpers";
import { renderInvoiceImage } from "../../lib/invoiceImage";
import { uploadInvoiceAndGetLink } from "../../lib/invoiceClientApi";
import type { Invoice } from "../../lib/invoiceTypes";
import { useAuth } from "../auth/AuthContext";
import { Sidebar } from "./Sidebar";
import { InvoicesTable } from "./InvoicesTable";
import { Pagination } from "./Pagination";
import { useOwedInvoices } from "./useOwedInvoices";
import { fetchInvoiceSummary, type InvoiceSummary } from "./invoicesApi";

async function shareInvoiceAsImage(invoice: Invoice) {
  const blob = await renderInvoiceImage(invoice);
  const file = new File(
    [blob],
    `${docLabel(invoice.status).toLowerCase()}.png`,
    { type: "image/png" },
  );
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
  };
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
}

export function WhoOwesMe() {
  const { accessToken } = useAuth();
  const {
    invoices,
    isLoading,
    error,
    page,
    totalPages,
    sort,
    goToPage,
    changeSort,
  } = useOwedInvoices();
  const [totalOwed, setTotalOwed] = useState<number | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    fetchInvoiceSummary(accessToken)
      .then((s: InvoiceSummary) => setTotalOwed(s.totalOutstanding))
      .catch(() => {});
  }, [accessToken, invoices]);

  const shareInvoiceLink = async (invoice: Invoice) => {
    const link = await uploadInvoiceAndGetLink(invoice, accessToken);
    openWhatsApp(shareCaption(invoice, link), invoice.customerPhone);
  };

  return (
    <div
      className="min-h-dvh flex flex-col md:flex-row"
      style={{
        background: BRAND.bg,
        fontFamily: "Inter, sans-serif",
        color: BRAND.ink,
      }}
    >
      <style>{FONT_IMPORT_BLOCK}</style>
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 md:px-8 py-6 md:py-8 mb-20">
        <div className="flex flex-col  min-[369px]:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl">Who owes me</h1>
            <p className="text-sm" style={{ color: BRAND.inkSoft }}>
              Every sale that isn't fully paid yet, in one place.
            </p>
          </div>
          {totalOwed !== null && totalOwed > 0 && (
            <div
              className="rounded-2xl px-5 py-3 text-left min-[369px]:text-right shrink-0"
              style={{ background: BRAND.peach }}
            >
              <div
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: BRAND.red }}
              >
                Total owed
              </div>
              <div
                className="font-heading text-2xl"
                style={{ color: BRAND.red }}
              >
                ₦{totalOwed.toLocaleString("en-NG")}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-6 mt-5">
          <button
            onClick={() => changeSort("oldest")}
            className="rounded-full px-4 py-1.5 text-xs font-semibold"
            style={{
              background: sort === "oldest" ? BRAND.ink : BRAND.card,
              color: sort === "oldest" ? BRAND.bg : BRAND.inkSoft,
              border: `1px solid ${BRAND.line}`,
            }}
          >
            Oldest first
          </button>
          <button
            onClick={() => changeSort("largest")}
            className="rounded-full px-4 py-1.5 text-xs font-semibold"
            style={{
              background: sort === "largest" ? BRAND.ink : BRAND.card,
              color: sort === "largest" ? BRAND.bg : BRAND.inkSoft,
              border: `1px solid ${BRAND.line}`,
            }}
          >
            Largest balance
          </button>
        </div>

        {error && (
          <div
            className="rounded-xl px-4 py-3 mb-5 text-sm"
            style={{ background: BRAND.peach, color: BRAND.red }}
          >
            {error}
          </div>
        )}

        {isLoading ? (
          <div
            className="rounded-2xl p-10 text-center text-sm"
            style={{
              background: BRAND.card,
              border: `1px solid ${BRAND.line}`,
              color: BRAND.inkSoft,
            }}
          >
            Loading…
          </div>
        ) : invoices.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center text-sm"
            style={{
              background: BRAND.card,
              border: `1px solid ${BRAND.line}`,
              color: BRAND.inkSoft,
            }}
          >
            Nobody owes you right now — every sale is fully paid.
          </div>
        ) : (
          <>
            <InvoicesTable
              invoices={invoices}
              onSendReminder={(inv) =>
                openWhatsApp(reminderText(inv), inv.customerPhone)
              }
              onShareAsImage={shareInvoiceAsImage}
              onShareLink={shareInvoiceLink}
            />
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </>
        )}
      </main>
    </div>
  );
}
