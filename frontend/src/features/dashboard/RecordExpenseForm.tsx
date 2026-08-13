import { useState, type ChangeEvent } from "react";
import { Upload, ChevronDown } from "lucide-react";
import { BRAND } from "../../lib/theme";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "../../lib/expenseTypes";
import type { CreateExpensePayload } from "./expensesApi";

const inputStyle = (invalid: boolean) => ({ border: `1px solid ${invalid ? BRAND.red : BRAND.line}` });
const todayISO = () => new Date().toISOString().slice(0, 10);

interface RecordExpenseFormProps {
  onCancel: () => void;
  onRecord: (payload: CreateExpensePayload) => Promise<void>;
}

export function RecordExpenseForm({ onCancel, onRecord }: RecordExpenseFormProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [category, setCategory] = useState<ExpenseCategory>(EXPENSE_CATEGORIES[0].value);
  const [note, setNote] = useState("");
  const [expenseDate, setExpenseDate] = useState(todayISO());
  const [receipt, setReceipt] = useState<File | null>(null);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await onRecord({ title: title.trim(), amount: Number(amount), category, note: note.trim(), expenseDate, receipt });
    } catch (err: any) {
      setError(err?.message || "Couldn't record the expense. Try again.");
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 md:px-0 py-6">
      <div className="rounded-3xl p-7" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
        <h1 className="font-heading text-[28px] md:text-[36px] mb-1">Record an expense</h1>
        <p className="text-sm mb-7" style={{ color: BRAND.inkSoft }}>Attach a receipt if you have one — helps at tax time.</p>

        {error && <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: BRAND.peach, color: BRAND.red }}>{error}</div>}

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fabric restock" className="w-full rounded-xl px-4 py-3 mb-5 text-base md:text-sm outline-none" style={inputStyle(touched && !title.trim())} />

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Amount</label>
        <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))} placeholder="0" className="w-full rounded-xl px-4 py-3 mb-5 text-sm outline-none" style={inputStyle(touched && !(amount !== "" && Number(amount) > 0))} />

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>
        Category
        </label>
        <div className="relative mb-5">
        <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="w-full rounded-xl pl-4 pr-10 py-3 text-base md:text-sm outline-none"
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
        <input
        type="date"
        lang="en-GB"
        value={expenseDate}
        onChange={(e) => setExpenseDate(e.target.value)}
        max={todayISO()}
        className="w-full rounded-xl px-4 py-3 mb-5 text-base md:text-sm outline-none"
        style={inputStyle(false)}
        />

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Notes (optional)</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 280))} placeholder="Any extra detail" rows={3} className="w-full rounded-xl px-4 py-3 mb-5 text-base md:text-sm outline-none resize-none" style={inputStyle(false)} />

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Receipt (optional)</label>
        <label className="flex items-center gap-2 rounded-xl px-4 py-3 mb-7 text-sm cursor-pointer" style={{ border: `1px dashed ${BRAND.line}`, color: BRAND.inkSoft }}>
          <Upload size={16} />
          {receipt ? receipt.name : "Attach a photo or PDF (max 5MB)"}
          <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleFileChange} className="hidden" />
        </label>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-full py-3.5 font-semibold text-sm" style={{ border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>Cancel</button>
          <button onClick={handleSubmit} disabled={busy || (touched && !canSubmit)} className="flex-1 rounded-full py-3.5 font-semibold text-sm transition-opacity" style={{ background: BRAND.ink, color: BRAND.bg, opacity: busy || (touched && !canSubmit) ? 0.5 : 1 }}>
            {busy ? "Recording…" : "Record expense"}
          </button>
        </div>
      </div>
    </div>
  );
}