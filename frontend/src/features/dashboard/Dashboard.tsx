import { useState } from "react";
import { BRAND, FONT_IMPORT_BLOCK } from "../../lib/theme";
import type { Invoice } from "../../lib/invoiceTypes";
import type { Expense } from "../../lib/expenseTypes";
// import { shareCaption, openWhatsApp, docLabel } from "../../lib/invoiceHelpers";
// import { renderInvoiceImage } from "../../lib/invoiceImage";
// import { uploadInvoiceAndGetLink } from "../../lib/invoiceClientApi";
import { useAuth } from "../auth/AuthContext";
import { Sidebar } from "./Sidebar";
import { OverviewCards } from "./OverviewCards";
import { OverviewFilters } from "./OverviewFilters";
import { OverviewFeedList } from "./OverviewFeedList";
import { Pagination } from "./Pagination";
import { AddMenu } from "./AddMenu";
import { DashboardInvoiceForm } from "./DashboardInvoiceForm";
import { DashboardInvoiceReceipt } from "./DashboardInvoiceReceipt";
import { RecordExpenseForm } from "./RecordExpenseForm";
import { ExpenseConfirmation } from "./ExpenseConfirmation";
import { useDashboardInvoices } from "./useDashboardInvoices";
import { useOverview } from "./useOverview";
import { createExpense } from "./expensesApi";

// async function shareInvoiceAsImage(invoice: Invoice) {
//   const blob = await renderInvoiceImage(invoice);
//   const file = new File([blob], `${docLabel(invoice.status).toLowerCase()}.png`, { type: "image/png" });
//   const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
//   if (nav.canShare && nav.canShare({ files: [file] })) {
//     await navigator.share({ files: [file], text: shareCaption(invoice) });
//   } else {
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${docLabel(invoice.status).toLowerCase()}-${invoice.customerName}-${invoice.invoiceNumber}.png`;
//     a.click();
//     URL.revokeObjectURL(url);
//   }
// }

type View = "overview" | "create-sale" | "sale-receipt" | "create-expense" | "expense-confirmation";

export function Dashboard() {
  const { accessToken } = useAuth();
  const { createInvoice } = useDashboardInvoices();
  const overview = useOverview();

  const [view, setView] = useState<View>("overview");
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [activeExpense, setActiveExpense] = useState<Expense | null>(null);

  // const shareInvoiceLink = async (invoice: Invoice) => {
  //   const link = await uploadInvoiceAndGetLink(invoice, accessToken);
  //   openWhatsApp(shareCaption(invoice, link), invoice.customerPhone);
  // };

  if (view === "create-sale") {
    return (
      <div className="min-h-screen flex flex-col md:flex-row" style={{ background: BRAND.bg, fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
        <style>{FONT_IMPORT_BLOCK}</style>
        <Sidebar />
        <main className="flex-1 min-w-0">
          <DashboardInvoiceForm
            onCancel={() => setView("overview")}
            onGenerate={async (payload) => {
              const created = await createInvoice(payload);
              setActiveInvoice(created);
              setView("sale-receipt");
            }}
          />
        </main>
      </div>
    );
  }

  if (view === "sale-receipt" && activeInvoice) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row" style={{ background: BRAND.bg, fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
        <style>{FONT_IMPORT_BLOCK}</style>
        <Sidebar />
        <main className="flex-1 min-w-0">
          <DashboardInvoiceReceipt
            invoice={activeInvoice}
            onPaymentRecorded={(updated) => setActiveInvoice(updated)}
            onDone={() => { setView("overview"); overview.refresh(); }}
          />
        </main>
      </div>
    );
  }

  if (view === "create-expense") {
    return (
      <div className="min-h-screen flex flex-col md:flex-row" style={{ background: BRAND.bg, fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
        <style>{FONT_IMPORT_BLOCK}</style>
        <Sidebar />
        <main className="flex-1 min-w-0">
          <RecordExpenseForm
            onCancel={() => setView("overview")}
            onRecord={async (payload) => {
              if (!accessToken) return;
              const created = await createExpense(accessToken, payload);
              setActiveExpense(created);
              setView("expense-confirmation");
            }}
          />
        </main>
      </div>
    );
  }

  if (view === "expense-confirmation" && activeExpense) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row" style={{ background: BRAND.bg, fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
        <style>{FONT_IMPORT_BLOCK}</style>
        <Sidebar />
        <main className="flex-1 min-w-0">
          <ExpenseConfirmation expense={activeExpense} onDone={() => { setView("overview"); overview.refresh(); }} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: BRAND.bg, fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      <style>{FONT_IMPORT_BLOCK}</style>
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 md:px-8 py-6 md:py-8 mb-20">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl">Overview</h1>
            <p className="text-sm" style={{ color: BRAND.inkSoft }}>Your sales and expenses, all in one place.</p>
          </div>
          <AddMenu onRecordSale={() => setView("create-sale")} onRecordExpense={() => setView("create-expense")} />
        </div>

        <div className="mt-6">
          <OverviewCards summary={overview.summary} />

          <OverviewFilters
            type={overview.type} onTypeChange={overview.setType}
            range={overview.range} onRangeChange={overview.setRange}
            dateFrom={overview.dateFrom} dateTo={overview.dateTo}
            onDateFromChange={overview.setDateFrom} onDateToChange={overview.setDateTo}
            sort={overview.sort} onSortChange={overview.setSort}
            search={overview.search} onSearchChange={overview.setSearch}
          />

          {overview.error && (
            <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: BRAND.peach, color: BRAND.red }}>{overview.error}</div>
          )}

          {overview.isLoading ? (
            <div className="rounded-2xl p-10 text-center text-sm" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>Loading…</div>
          ) : (
            <>
              <OverviewFeedList items={overview.items} />
              <Pagination page={overview.page} totalPages={overview.totalPages} onPageChange={overview.goToPage} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}