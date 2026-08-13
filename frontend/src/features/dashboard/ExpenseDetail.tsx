import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, ExternalLink } from "lucide-react";
import { BRAND, FONT_IMPORT_BLOCK } from "../../lib/theme";
import type { Expense } from "../../lib/expenseTypes";
import { formatExpenseDateDisplay } from "../../lib/expenseTypes";
import { renderExpenseVoucherImage } from "../../lib/expenseVoucherImage";
import { useAuth } from "../auth/AuthContext";
import { Sidebar } from "./Sidebar";
import { fetchExpenseDetail } from "./expensesApi";

export function ExpenseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessToken, user } = useAuth();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !id) return;
    setIsLoading(true);
    setError(null);
    fetchExpenseDetail(accessToken, id)
      .then(setExpense)
      .catch((err) => setError(err?.message || "Couldn't load this expense."))
      .finally(() => setIsLoading(false));
  }, [accessToken, id]);

  const downloadVoucher = async () => {
    if (!expense) return;
    const blob = await renderExpenseVoucherImage(
      { amount: expense.amount, categoryDisplay: expense.categoryDisplay, expenseDateDisplay: formatExpenseDateDisplay(expense.expenseDate), title: expense.title, note: expense.note },
      user?.businessName || ""
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expense-voucher-${expense.expenseNumber}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: BRAND.bg, fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      <style>{FONT_IMPORT_BLOCK}</style>
      <Sidebar />
      <main className="flex-1 min-w-0">
        {isLoading && <div className="max-w-xl mx-auto px-4 md:px-0 py-10 text-center text-sm" style={{ color: BRAND.inkSoft }}>Loading expense…</div>}
        {!isLoading && error && <div className="max-w-xl mx-auto px-4 md:px-0 py-10 text-center text-sm" style={{ color: BRAND.red }}>{error}</div>}
        {!isLoading && !error && expense && (
          <div className="max-w-xl mx-auto px-4 md:px-0 py-6">
            <div className="rounded-3xl p-7 mb-5" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
              <div className="text-center mb-4" style={{ borderColor: BRAND.line }}>
                <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: BRAND.inkSoft }}>
                  {expense.categoryDisplay} · {expense.expenseNumber}
                </div>
                <div className="font-heading text-[32px]">{expense.title}</div>
                <div className="text-xs mt-1" style={{ color: BRAND.inkSoft }}>{formatExpenseDateDisplay(expense.expenseDate)}</div>
              </div>

              <div className="flex justify-between items-center border-t pt-4" style={{ borderColor: BRAND.line }}>
                <span className="font-heading text-[20px]">Amount</span>
                <span className="font-heading text-[32px]" style={{ color: BRAND.red }}>NGN {Number(expense.amount).toLocaleString("en-NG")}</span>
              </div>

              {expense.note && (
                <>
                    <div className="text-lg mt-4 pt-4 text-left font-heading border-t" style={{ color: BRAND.ink }}>Note:</div>
                    <div className="text-sm mt-0 text-left whitespace-pre-wrap" style={{ color: BRAND.inkSoft }}>{expense.note}</div>
                </>
              )}

              <div className="mt-4 flex justify-center">
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: BRAND.lav, color: BRAND.lavStrong }}>RECORDED</span>
              </div>
            </div>

            {expense.receiptUrl ? (
              <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" className="w-full mb-5 flex items-center justify-center gap-2 rounded-full py-3 font-semibold text-sm" style={{ background: BRAND.ink, color: BRAND.bg }}>
                <ExternalLink size={16} /> View attached receipt
              </a>
            ) : (
              <button onClick={downloadVoucher} className="w-full mb-5 flex items-center justify-center gap-2 rounded-full py-3 font-semibold text-sm" style={{ background: BRAND.ink, color: BRAND.bg }}>
                <Download size={16} /> Download expense voucher
              </button>
            )}

            <button onClick={() => navigate("/dashboard")} className="w-full rounded-full py-3.5 font-semibold bg-white text-sm" style={{ border: `1px solid ${BRAND.line}`, color: "#000000" }}>
              Done - back to overview
            </button>
          </div>
        )}
      </main>
    </div>
  );
}