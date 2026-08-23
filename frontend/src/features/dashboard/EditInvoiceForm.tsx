import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { BRAND, PRESET_COLORS } from "../../lib/theme";
import { normalizeNGPhone } from "../../lib/phone";
import type { Invoice } from "../../lib/invoiceTypes";
import type { UpdateInvoicePayload } from "./invoicesApi";

interface DraftItem { id: string; description: string; qty: number | ""; unitPrice: number | ""; }
const inputStyle = (invalid: boolean) => ({ border: `1px solid ${invalid ? BRAND.red : BRAND.line}` });

interface EditInvoiceFormProps {
  invoice: Invoice;
  onCancel: () => void;
  onSave: (payload: UpdateInvoicePayload) => Promise<void>;
}

export function EditInvoiceForm({ invoice, onCancel, onSave }: EditInvoiceFormProps) {
  const [customerName, setCustomerName] = useState(invoice.customerName);
  const [customerPhone, setCustomerPhone] = useState(invoice.customerPhone);
  const [items, setItems] = useState<DraftItem[]>(
    invoice.items.map((it) => ({ id: crypto.randomUUID(), description: it.description, qty: it.qty, unitPrice: it.unitPrice }))
  );
  const [note, setNote] = useState(invoice.note || "");
  const [brandColor, setBrandColor] = useState(invoice.brandColor || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneCheck = normalizeNGPhone(customerPhone);
  const updateItem = (id: string, field: keyof DraftItem, value: string | number) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  const addItem = () => setItems((prev) => [...prev, { id: crypto.randomUUID(), description: "", qty: 1, unitPrice: 0 }]);
  const removeItem = (id: string) => setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));

  const filledItems = items.filter((it) => it.description.trim().length > 0);
  const canSave =
    filledItems.length > 0 &&
    filledItems.every((it) => Number(it.qty) > 0 && Number(it.unitPrice) > 0) &&
    phoneCheck.valid &&
    (invoice.status === "due" || invoice.status === "partially_paid" ? customerName.trim().length > 0 : true);

  const handleSave = async () => {
    if (!canSave) return;
    setBusy(true);
    setError(null);
    try {
      await onSave({
        customerName: customerName.trim(),
        customerPhone: phoneCheck.local || "",
        items: filledItems.map((it) => ({ description: it.description.trim(), qty: Number(it.qty), unitPrice: Number(it.unitPrice) })),
        note: note.trim(),
        brandColor,
      });
    } catch (err: any) {
      setError(err?.message || "Couldn't save changes.");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 px-0 sm:px-4">
      <div className="w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto p-6" style={{ background: BRAND.card }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-2xl">Edit sale</h2>
          <button onClick={onCancel} aria-label="Close" style={{ color: BRAND.inkSoft }}><X size={20} /></button>
        </div>

        {error && <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: BRAND.peach, color: BRAND.red }}>{error}</div>}

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Customer name</label>
        <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full rounded-xl px-4 py-3 mb-5 text-base md:text-sm outline-none" style={inputStyle(false)} />

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Phone</label>
        <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 11))} inputMode="numeric" maxLength={11} className="w-full rounded-xl px-4 py-3 mb-5 text-base md:text-sm outline-none" style={inputStyle(!phoneCheck.empty && !phoneCheck.valid)} />

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Items</label>
        <div className="flex flex-col gap-3 mb-3">
          {items.map((it) => (
            <div key={it.id} className="flex flex-wrap gap-2 items-center w-full">
              <input value={it.description} onChange={(e) => updateItem(it.id, "description", e.target.value)} placeholder="Item or service" className="w-full sm:flex-1 rounded-xl px-3 py-2.5 text-base md:text-sm outline-none" style={inputStyle(false)} />
              <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
                <input type="number" min={1} value={it.qty || ""} onChange={(e) => updateItem(it.id, "qty", e.target.value === "" ? "" : Number(e.target.value))} className="w-16 rounded-xl px-2 py-2.5 text-base md:text-sm outline-none text-center" style={inputStyle(false)} />
                <input type="number" min={0} value={it.unitPrice || ""} onChange={(e) => updateItem(it.id, "unitPrice", e.target.value === "" ? "" : Number(e.target.value))} className="flex-1 rounded-xl px-3 py-2.5 text-base md:text-sm outline-none" style={inputStyle(false)} />
                <button onClick={() => removeItem(it.id)} className="p-2 rounded-lg shrink-0" style={{ color: BRAND.red }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addItem} className="flex items-center gap-1.5 text-sm font-semibold mb-6" style={{ color: BRAND.lavStrong }}><Plus size={15} /> Add another item</button>

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Notes</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 280))} rows={3} className="w-full rounded-xl px-4 py-3 mb-6 text-base md:text-sm outline-none resize-none" style={inputStyle(false)} />

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Brand color</label>
        <div className="flex gap-3 mb-7">
          {PRESET_COLORS.map((c) => (
            <button key={c.value} onClick={() => setBrandColor((prev) => (prev === c.value ? "" : c.value))} className="w-9 h-9 rounded-full" style={{ background: c.value, boxShadow: brandColor === c.value ? `0 0 0 2px ${BRAND.bg}, 0 0 0 4px ${c.value}` : "none" }} />
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-full py-3.5 font-semibold text-sm" style={{ border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>Cancel</button>
          <button onClick={handleSave} disabled={busy || !canSave} className="flex-1 rounded-full py-3.5 font-semibold text-sm transition-opacity" style={{ background: BRAND.ink, color: BRAND.bg, opacity: busy || !canSave ? 0.5 : 1 }}>
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}