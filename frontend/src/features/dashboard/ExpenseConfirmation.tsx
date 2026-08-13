import { CheckCircle2, Download } from "lucide-react";
import { BRAND } from "../../lib/theme";
import type { Expense } from "../../lib/expenseTypes";
import { formatExpenseDateDisplay } from "../../lib/expenseTypes";
import { renderExpenseVoucherImage } from "../../lib/expenseVoucherImage";
import { useAuth } from "../auth/AuthContext";

interface ExpenseConfirmationProps {
  expense: Expense;
  onDone: () => void;
}

export function ExpenseConfirmation({ expense, onDone }: ExpenseConfirmationProps) {
  const { user } = useAuth();

  const downloadVoucher = async () => {
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
    <div className="max-w-xl mx-auto px-4 md:px-0 py-6">
      <div className="rounded-3xl p-7 text-center" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
        <CheckCircle2 size={32} style={{ color: BRAND.green }} className="mx-auto mb-4" />
        <h1 className="font-heading text-[32px] leading-[32px] mb-1">Expense recorded</h1>
        <p className="text-sm font-semibold mb-1">{expense.title}</p>
        <p className="text-sm mb-6" style={{ color: BRAND.inkSoft }}>
          {expense.expenseNumber} · ₦{Number(expense.amount).toLocaleString("en-NG")} · {expense.categoryDisplay} · {formatExpenseDateDisplay(expense.expenseDate)}
        </p>

        {!expense.receiptUrl && (
        //   <button onClick={downloadVoucher} className="w-full rounded-full py-3.5 font-semibold text-sm" style={{ background: BRAND.ink, color: BRAND.bg }}>
        //     <Download size={16} /> Download expense voucher
        //   </button>
            <button onClick={downloadVoucher} className="w-full mb-5 flex items-center justify-center gap-2 rounded-full py-3 font-semibold text-sm" style={{ background: BRAND.ink, color: BRAND.bg }}>
                <Download size={16} /> Download expense voucher
            </button>
        )}

        <button onClick={onDone} className="w-full flex items-center justify-center gap-2 rounded-full py-3 mb-3 font-semibold text-sm" style={{ border: `1px solid ${BRAND.line}` }}>
          Done - back to overview
        </button>
      </div>
    </div>
  );
}