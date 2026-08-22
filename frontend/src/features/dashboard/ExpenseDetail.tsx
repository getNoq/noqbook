import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Download, ExternalLink, Pencil, Trash2, History } from "lucide-react";
import { BRAND, FONT_IMPORT_BLOCK } from "../../lib/theme";
import { formatExpenseDateDisplay } from "../../lib/expenseTypes";
import { renderExpenseVoucherImage } from "../../lib/expenseVoucherImage";
import { useAuth } from "../auth/AuthContext";
import { Sidebar } from "./Sidebar";
import { EditExpenseForm } from "./EditExpenseForm";
import {
  fetchExpenseDetail,
  updateExpense,
  deleteExpense,
  type ExpenseDetail as ExpenseDetailData,
  type UpdateExpensePayload,
} from "./expensesApi";

export function ExpenseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessToken, user } = useAuth();
  const [expense, setExpense] = useState<ExpenseDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [justEdited, setJustEdited] = useState(false);

  const load = () => {
    if (!accessToken || !id) return;
    setIsLoading(true);
    setError(null);
    fetchExpenseDetail(accessToken, id)
      .then((data) => setExpense(data as ExpenseDetailData))
      .catch((err) => setError(err?.message || "Couldn't load this expense."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [accessToken, id]);

  const goBack = () => {
    // location.key is "default" only if it's the very first page loaded in this tab
    if (location.key !== "default") navigate(-1);
    else navigate("/dashboard");
  };

  const handleSaveEdit = async (payload: UpdateExpensePayload) => {
    if (!accessToken || !id) return;
    const updated = await updateExpense(accessToken, id, payload);
    setExpense(updated);
    setEditing(false);
    setJustEdited(true);
    setTimeout(() => setJustEdited(false), 6000);
  };

  const handleDelete = async () => {
    if (!accessToken || !id) return;
    setDeleting(true);
    try {
      await deleteExpense(accessToken, id);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Couldn't delete this expense.");
      setDeleting(false);
    }
  };

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

  const canManage = user?.role === "owner" || user?.role === "admin" || user?.role === "staff"; // edit: everyone
  const canDelete = user?.role === "owner"; // delete: owner only
  const canSeeHistory = user?.role === "owner" || user?.role === "admin";

  return (
    <div className="min-h-dvh flex flex-col md:flex-row" style={{ background: BRAND.bg, fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      <style>{FONT_IMPORT_BLOCK}</style>
      <Sidebar />
      <main className="flex-1 min-w-0">
        {isLoading && <div className="max-w-xl mx-auto px-4 md:px-0 py-10 text-center text-sm" style={{ color: BRAND.inkSoft }}>Loading expense…</div>}
        {!isLoading && error && <div className="max-w-xl mx-auto px-4 md:px-0 py-10 text-center text-sm" style={{ color: BRAND.red }}>{error}</div>}
        {!isLoading && !error && expense && (
          <div className="max-w-xl mx-auto px-4 md:px-0 py-6">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex gap-2">
                {canManage && (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold" style={{ border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>
                    <Pencil size={13} /> Edit
                  </button>
                )}
                {canSeeHistory && expense.editHistory.length > 0 && (
                  <button onClick={() => setShowHistory((v) => !v)} className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold" style={{ border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>
                    <History size={13} /> History
                  </button>
                )}
              </div>
              {canDelete && (
                <button onClick={() => setDeleting(true)} className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold" style={{ color: BRAND.red }}>
                  <Trash2 size={13} /> Delete
                </button>
              )}
            </div>

            {justEdited && (
              <div className="rounded-xl px-4 py-3 mb-4 text-sm" style={{ background: BRAND.mint, color: BRAND.green }}>
                Expense updated.
              </div>
            )}

            {showHistory && canSeeHistory && (
              <div className="rounded-2xl p-4 mb-4" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
                <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: BRAND.inkSoft }}>Edit history</div>
                <div className="flex flex-col gap-3">
                  {expense.editHistory.map((log) => (
                    <div key={log.id} className="text-xs">
                      <div className="font-semibold" style={{ color: BRAND.ink }}>
                        {log.action === "deleted" ? "Deleted" : "Edited"} by {log.changedBy} · {new Date(log.createdAt).toLocaleString("en-NG")}
                      </div>
                      {Object.entries(log.changes).map(([field, diff]) => (
                        <div key={field} style={{ color: BRAND.inkSoft }}>
                          {field}: <span style={{ color: BRAND.red }}>{JSON.stringify(diff.old)}</span> → <span style={{ color: BRAND.green }}>{JSON.stringify(diff.new)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
            <button
                onClick={goBack}
                 className="w-full rounded-full py-3.5 font-semibold bg-white text-sm" style={{ border: `1px solid ${BRAND.line}`, color: "#000000" }}
            >
                Done - back to overview
            </button>

          </div>
        )}
      </main>

      {editing && expense && (
        <EditExpenseForm expense={expense} onCancel={() => setEditing(false)} onSave={handleSaveEdit} />
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-3xl p-6 text-center" style={{ background: BRAND.card }}>
            <h2 className="font-heading text-xl mb-2">Delete this expense?</h2>
            <p className="text-sm mb-6" style={{ color: BRAND.inkSoft }}>This can't be undone from here. The record is kept for your own audit trail, but it'll disappear from your dashboard.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleting(false)} className="flex-1 rounded-full py-3 font-semibold text-sm" style={{ border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>Cancel</button>
              <button onClick={handleDelete} className="flex-1 rounded-full py-3 font-semibold text-sm" style={{ background: BRAND.red, color: BRAND.bg }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}