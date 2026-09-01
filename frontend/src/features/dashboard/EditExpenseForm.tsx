import { useState, type ChangeEvent } from "react";
import { Upload, ChevronDown, X } from "lucide-react";
import { BRAND } from "../../lib/theme";
import { Expense, EXPENSE_CATEGORIES, type ExpenseCategory } from "../../lib/expenseTypes";
import type { UpdateExpensePayload } from "./expensesApi";
import { DatePickerField } from "../../components/ui/DatePickerField";
import { useAuth } from "../auth/AuthContext";

const inputStyle = (invalid: boolean) => ({ border: `1px solid ${invalid ? BRAND.red : BRAND.line}` });
const todayISO = () => new Date().toISOString().slice(0, 10);

interface EditExpenseFormProps {
  expense: Expense;
  onCancel: () => void;
  onSave: (payload: UpdateExpensePayload) => Promise<void>;
}

export function EditExpenseForm({ expense, onCancel, onSave }: EditExpenseFormProps) {
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState<number | "">(expense.amount);
  const [category, setCategory] = useState<ExpenseCategory>(expense.category as ExpenseCategory);
  const [note, setNote] = useState(expense.note || "");
  const [expenseDate, setExpenseDate] = useState(expense.expenseDate || todayISO());
  const [receipt, setReceipt] = useState<File | null>(null);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const canUploadReceipt = user?.teamPlan === "business";

  const canSubmit = title.trim().length > 0 && amount !== "" && Number(amount) > 0;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 5 * 1024 * 1024) {
      setError("Receipt file is too large — max 5MB.");
      return;
    }
    setError(null);
    setReceipt(file);
  };

  const handleSubmit = async () => {
    setTouched(true);
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await onSave({ title: title.trim(), amount: Number(amount), category, note: note.trim(), expenseDate, receipt });
    } catch (err: any) {
      setError(err?.message || "Couldn't save changes. Try again.");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 px-0 sm:px-4">
      <div className="w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto p-6" style={{ background: BRAND.card }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-2xl">Edit expense</h2>
          <button onClick={onCancel} aria-label="Close" style={{ color: BRAND.inkSoft }}><X size={20} /></button>
        </div>

        {error && <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: BRAND.peach, color: BRAND.red }}>{error}</div>}

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fabric restock" className="w-full rounded-xl px-4 py-3 mb-5 text-base md:text-sm outline-none" style={inputStyle(touched && !title.trim())} />

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Amount</label>
        <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))} placeholder="0" className="w-full rounded-xl px-4 py-3 mb-5 text-base md:text-sm outline-none" style={inputStyle(touched && !(amount !== "" && Number(amount) > 0))} />

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>
        Category
        </label>
        <div className="relative mb-5">
        <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="w-full rounded-xl pl-4 pr-10 py-3 text-base md:text-sm outline-none !bg-white"
            style={{
            ...inputStyle(false),
            WebkitAppearance: "none",
            MozAppearance: "none",
            appearance: "none",
            }}
        >
            {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
            ))}
        </select>
        <ChevronDown
            size={16}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
            style={{ color: BRAND.inkSoft }}
        />
        </div>

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>
        Date
        </label>
        <DatePickerField
        value={expenseDate}
        onChange={setExpenseDate}
        maxDate={todayISO()}
        className="mb-5"
        />

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Notes (optional)</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 280))} placeholder="Any extra detail" rows={3} className="w-full rounded-xl px-4 py-3 mb-5 text-base md:text-sm outline-none resize-none" style={inputStyle(false)} />

        {canUploadReceipt ? (
          <>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Receipt (optional)</label>
            <label className="flex items-center gap-2 rounded-xl px-4 py-3 mb-7 text-sm cursor-pointer" style={{ border: `1px dashed ${BRAND.line}`, color: BRAND.inkSoft }}>
              <Upload size={16} />
              {receipt ? receipt.name : expense.receiptUrl ? "Replace attached receipt" : "Attach a photo or PDF (max 5MB)"}
              <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleFileChange} className="hidden" />
            </label>
          </>
        ) : (
          <div className="rounded-xl px-4 py-3 mb-7 text-xs" style={{ border: `1px dashed ${BRAND.line}`, color: BRAND.inkSoft }}>
            Attaching receipt photos is a Business Plan feature.{" "}
            <a href="/dashboard/settings/plan" className="underline font-semibold" style={{ color: BRAND.ink }}>Upgrade</a>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-full py-3.5 font-semibold text-sm" style={{ border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>Cancel</button>
          <button onClick={handleSubmit} disabled={busy || (touched && !canSubmit)} className="flex-1 rounded-full py-3.5 font-semibold text-sm transition-opacity" style={{ background: BRAND.ink, color: BRAND.bg, opacity: busy || (touched && !canSubmit) ? 0.5 : 1 }}>
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}