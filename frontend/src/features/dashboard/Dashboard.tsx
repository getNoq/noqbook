import { useState } from "react";
import { Plus } from "lucide-react";
import { BRAND, FONT_IMPORT_BLOCK } from "../../lib/theme";
import type { Invoice } from "../../lib/invoiceTypes";
import { reminderText, shareCaption, openWhatsApp, docLabel } from "../../lib/invoiceHelpers";
import { renderInvoiceImage } from "../../lib/invoiceImage";
import { uploadInvoiceAndGetLink } from "../../lib/invoiceClientApi";
import { useAuth } from "../auth/AuthContext";
import { Sidebar } from "./Sidebar";
import { OverviewCards } from "./OverviewCards";
import { InvoicesTable } from "./InvoicesTable";
import { Pagination } from "./Pagination";
import { CreateInvoiceModal } from "./CreateInvoiceModal";
import { useDashboardInvoices } from "./useDashboardInvoices";

async function shareInvoiceAsImage(invoice: Invoice) {
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
}

export function Dashboard() {
  const { accessToken } = useAuth();
  const { invoices, summary, isLoading, error, markAsPaid, createInvoice, page, totalPages, goToPage } = useDashboardInvoices();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const shareInvoiceLink = async (invoice: Invoice) => {
    const link = await uploadInvoiceAndGetLink(invoice, accessToken);
    openWhatsApp(shareCaption(invoice, link), invoice.customerPhone);
  };

  return (
    <div className="min-h-screen flex" style={{ background: BRAND.bg, fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      <style>{FONT_IMPORT_BLOCK}</style>
      <Sidebar />

      <main className="flex-1 min-w-0 px-4 md:px-8 py-6 md:py-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl">Overview</h1>
            <p className="text-sm" style={{ color: BRAND.inkSoft }}>Your invoices and receipts, all in one place.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold shrink-0"
            style={{ background: BRAND.ink, color: BRAND.bg }}
          >
            <Plus size={16} /> <span className="hidden sm:inline">New invoice</span>
          </button>
        </div>

        <div className="mt-6">
          {error && (
            <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: BRAND.peach, color: BRAND.red }}>
              {error}
            </div>
          )}

          <OverviewCards summary={summary} />

          {isLoading ? (
            <div className="rounded-2xl p-10 text-center text-sm" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>
              Loading your invoices…
            </div>
          ) : (
            <>
              <InvoicesTable
                invoices={invoices}
                onMarkAsPaid={(inv) => markAsPaid(inv.id)}
                onSendReminder={(inv) => openWhatsApp(reminderText(inv), inv.customerPhone)}
                onShareAsImage={shareInvoiceAsImage}
                onShareLink={shareInvoiceLink}
              />
              <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
            </>
          )}
        </div>
      </main>

      {showCreateModal && <CreateInvoiceModal onClose={() => setShowCreateModal(false)} onCreate={createInvoice} />}
    </div>
  );
}