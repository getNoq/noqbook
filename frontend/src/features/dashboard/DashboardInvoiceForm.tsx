import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { BRAND, PRESET_COLORS } from "../../lib/theme";
import { normalizeNGPhone } from "../../lib/phone";
import type { InvoiceStatus } from "../../lib/invoiceTypes";
import type { CreateInvoicePayload } from "./invoicesApi";

interface DraftItem {
  id: string;
  description: string;
  qty: number | "";
  unitPrice: number | "";
}

const emptyDraftItem = (): DraftItem => ({ id: crypto.randomUUID(), description: "", qty: 1, unitPrice: 0 });
const inputStyle = (invalid: boolean) => ({ border: `1px solid ${invalid ? BRAND.red : BRAND.line}` });

interface DashboardInvoiceFormProps {
  onCancel: () => void;
  onGenerate: (payload: CreateInvoicePayload) => Promise<void>;
}

export function DashboardInvoiceForm({ onCancel, onGenerate }: DashboardInvoiceFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState<DraftItem[]>([emptyDraftItem()]);
  const [status, setStatus] = useState<InvoiceStatus>("due");
  const [note, setNote] = useState("");
  const [brandColor, setBrandColor] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneCheck = normalizeNGPhone(customerPhone);
  const updateItem = (id: string, field: keyof DraftItem, value: string | number) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  const addItem = () => setItems((prev) => [...prev, emptyDraftItem()]);
  const removeItem = (id: string) => setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));

  const filledItems = items.filter((it) => it.description.trim().length > 0);
  const total = filledItems.reduce((sum, it) => sum + Number(it.qty || 0) * Number(it.unitPrice || 0), 0);
  const canSubmit =
    customerName.trim().length > 0 &&
    filledItems.length > 0 &&
    filledItems.every((it) => Number(it.qty) > 0 && Number(it.unitPrice) > 0) &&
    phoneCheck.valid;

  const handleSubmit = async () => {
    setTouched(true);
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await onGenerate({
        customerName: customerName.trim(),
        customerPhone: phoneCheck.local || undefined,
        items: filledItems.map((it) => ({ description: it.description.trim(), qty: Number(it.qty), unitPrice: Number(it.unitPrice) })),
        status,
        note: note.trim(),
        brandColor,
      });
    } catch (err: any) {
      setError(err?.message || "Couldn't create the invoice. Try again.");
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 md:px-0 py-6">
      <div className="rounded-3xl p-7" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
        <h1 className="font-heading text-[28px] md:text-[36px] mb-1">New invoice</h1>
        <p className="text-sm mb-7" style={{ color: BRAND.inkSoft }}>This one saves straight to your account.</p>

        {error && <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: BRAND.peach, color: BRAND.red }}>{error}</div>}

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Customer name</label>
        <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Chidinma" className="w-full rounded-xl px-4 py-3 mb-5 text-base md:text-sm outline-none" style={inputStyle(touched && !customerName.trim())} />

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Phone (optional)</label>
        <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 11))} placeholder="08031234567" inputMode="numeric" maxLength={11} className="w-full rounded-xl px-4 py-3 mb-2 text-base md:text-sm outline-none" style={inputStyle(!phoneCheck.empty && !phoneCheck.valid)} />
        <div className="mb-4 min-h-[16px]">
          {!phoneCheck.empty && !phoneCheck.valid && <div className="text-xs" style={{ color: BRAND.red }}>Enter a valid Nigerian number, e.g. 08031234567.</div>}
        </div>

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Items</label>
        <div className="flex flex-col gap-3 mb-3">
          {items.map((it) => (
            <div key={it.id} className="flex flex-wrap gap-2 items-center w-full">
              <input value={it.description} onChange={(e) => updateItem(it.id, "description", e.target.value)} placeholder="Item or service" className="w-full sm:flex-1 rounded-xl px-3 py-2.5 text-base md:text-sm outline-none" style={inputStyle(false)} />
              <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
                <input type="number" min={1} value={it.qty || ""} placeholder="Qty" onChange={(e) => updateItem(it.id, "qty", e.target.value === "" ? "" : Number(e.target.value))} className="w-16 rounded-xl px-2 py-2.5 text-base md:text-sm outline-none text-center" style={inputStyle(false)} />
                <input type="number" min={0} value={it.unitPrice || ""} placeholder="Price" onChange={(e) => updateItem(it.id, "unitPrice", e.target.value === "" ? "" : Number(e.target.value))} className="flex-1 rounded-xl px-3 py-2.5 text-base md:text-sm outline-none" style={inputStyle(false)} />
                <button onClick={() => removeItem(it.id)} className="p-2 rounded-lg shrink-0" style={{ color: BRAND.red }} aria-label="Remove item"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addItem} className="flex items-center gap-1.5 text-sm font-semibold mb-6" style={{ color: BRAND.lavStrong }}><Plus size={15} /> Add another item</button>

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Payment status</label>
        <div className="flex gap-2 mb-6">
          <button onClick={() => setStatus("paid")} className="flex-1 rounded-xl py-2.5 text-sm font-semibold" style={{ background: status === "paid" ? BRAND.mint : BRAND.card, border: `1px solid ${status === "paid" ? BRAND.green : BRAND.line}`, color: status === "paid" ? BRAND.green : BRAND.inkSoft }}>Paid</button>
          <button onClick={() => setStatus("due")} className="flex-1 rounded-xl py-2.5 text-sm font-semibold" style={{ background: status === "due" ? BRAND.peach : BRAND.card, border: `1px solid ${status === "due" ? BRAND.red : BRAND.line}`, color: status === "due" ? BRAND.red : BRAND.inkSoft }}>Outstanding</button>
        </div>

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Notes (optional)</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 280))} placeholder="e.g. Payment due within 7 days." rows={2} className="w-full rounded-xl px-4 py-3 mb-6 text-base md:text-sm outline-none resize-none" style={inputStyle(false)} />

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Brand color (optional)</label>
        <div className="flex gap-3 mb-7">
          {PRESET_COLORS.map((c) => (
            <button key={c.value} onClick={() => setBrandColor((prev) => (prev === c.value ? "" : c.value))} title={c.name} className="w-9 h-9 rounded-full" style={{ background: c.value, boxShadow: brandColor === c.value ? `0 0 0 2px ${BRAND.bg}, 0 0 0 4px ${c.value}` : "none" }} aria-label={c.name} aria-pressed={brandColor === c.value} />
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-semibold" style={{ color: BRAND.inkSoft }}>Total</span>
          <span className="font-heading text-[32px]">₦{total.toLocaleString("en-NG")}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={onCancel} className="flex-1 order-2 sm:order-1 rounded-full py-3.5 font-semibold text-sm" style={{ border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>Cancel</button>
          <button onClick={handleSubmit} disabled={busy || (touched && !canSubmit)} className="flex-1 order-1 sm:order-2 rounded-full py-3.5 font-semibold text-sm transition-opacity" style={{ background: BRAND.ink, color: BRAND.bg, opacity: busy || (touched && !canSubmit) ? 0.5 : 1 }}>
            {busy ? "Creating…" : `Generate ${status === "paid" ? "receipt" : "invoice"}`}
          </button>
        </div>
      </div>
    </div>
  );
}