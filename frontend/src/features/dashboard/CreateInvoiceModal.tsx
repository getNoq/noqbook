import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { BRAND } from "../../lib/theme";
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

interface CreateInvoiceModalProps {
  onClose: () => void;
  onCreate: (payload: CreateInvoicePayload) => Promise<void>;
}

// Note: no business name field here — unlike guest mode, a signed-in
// user's business name comes from their account, not the form.
export function CreateInvoiceModal({ onClose, onCreate }: CreateInvoiceModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState<DraftItem[]>([emptyDraftItem()]);
  const [status, setStatus] = useState<InvoiceStatus>("due");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneCheck = normalizeNGPhone(customerPhone);

  const updateItem = (id: string, field: keyof DraftItem, value: string | number) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  const addItem = () => setItems((prev) => [...prev, emptyDraftItem()]);
  const removeItem = (id: string) => setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));

  const filledItems = items.filter((it) => it.description.trim().length > 0);
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
      await onCreate({
        customerName: customerName.trim(),
        customerPhone: phoneCheck.local || undefined,
        items: filledItems.map((it) => ({
          description: it.description.trim(),
          qty: Number(it.qty),
          unitPrice: Number(it.unitPrice),
        })),
        amountPaidNow: status === "paid" ? filledItems.reduce((sum, it) => sum + Number(it.qty) * Number(it.unitPrice), 0) : 0,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Couldn't create the invoice. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 px-0 sm:px-4">
      <div className="w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto p-6" style={{ background: BRAND.card }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-2xl">New invoice</h2>
          <button onClick={onClose} aria-label="Close" style={{ color: BRAND.inkSoft }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: BRAND.peach, color: BRAND.red }}>
            {error}
          </div>
        )}

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Customer name</label>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="e.g. Chidinma"
          className="w-full rounded-xl px-4 py-3 mb-5 text-base md:text-sm outline-none"
          style={inputStyle(touched && !customerName.trim())}
        />

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Phone (optional)</label>
        <input
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
          placeholder="08031234567"
          inputMode="numeric"
          maxLength={11}
          className="w-full rounded-xl px-4 py-3 mb-2 text-base md:text-sm outline-none"
          style={inputStyle(!phoneCheck.empty && !phoneCheck.valid)}
        />
        <div className="mb-4 min-h-[16px]">
          {!phoneCheck.empty && !phoneCheck.valid && (
            <div className="text-xs" style={{ color: BRAND.red }}>Enter a valid Nigerian number, e.g. 08031234567.</div>
          )}
        </div>

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Items</label>
        <div className="flex flex-col gap-3 mb-3">
          {items.map((it) => (
            <div key={it.id} className="flex flex-wrap gap-2 items-center w-full">
              <input
                value={it.description}
                onChange={(e) => updateItem(it.id, "description", e.target.value)}
                placeholder="Item or service"
                className="w-full sm:flex-1 rounded-xl px-3 py-2.5 text-base md:text-sm outline-none"
                style={inputStyle(false)}
              />
              <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
                <input
                  type="number"
                  min={1}
                  value={it.qty || ""}
                  placeholder="Qty"
                  onChange={(e) => updateItem(it.id, "qty", e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-16 rounded-xl px-2 py-2.5 text-base md:text-sm outline-none text-center"
                  style={inputStyle(false)}
                />
                <input
                  type="number"
                  min={0}
                  value={it.unitPrice || ""}
                  placeholder="Price"
                  onChange={(e) => updateItem(it.id, "unitPrice", e.target.value === "" ? "" : Number(e.target.value))}
                  className="flex-1 rounded-xl px-3 py-2.5 text-base md:text-sm outline-none"
                  style={inputStyle(false)}
                />
                <button onClick={() => removeItem(it.id)} className="p-2 rounded-lg shrink-0" style={{ color: BRAND.red }} aria-label="Remove item">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addItem} className="flex items-center gap-1.5 text-sm font-semibold mb-6" style={{ color: BRAND.lavStrong }}>
          <Plus size={15} /> Add another item
        </button>

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Payment status</label>
        <div className="flex gap-2 mb-7">
          <button
            onClick={() => setStatus("paid")}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
            style={{ background: status === "paid" ? BRAND.mint : BRAND.card, border: `1px solid ${status === "paid" ? BRAND.green : BRAND.line}`, color: status === "paid" ? BRAND.green : BRAND.inkSoft }}
          >
            Paid
          </button>
          <button
            onClick={() => setStatus("due")}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
            style={{ background: status === "due" ? BRAND.peach : BRAND.card, border: `1px solid ${status === "due" ? BRAND.red : BRAND.line}`, color: status === "due" ? BRAND.red : BRAND.inkSoft }}
          >
            Outstanding
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={busy || (touched && !canSubmit)}
          className="w-full rounded-full py-3.5 font-semibold text-sm transition-opacity"
          style={{ background: BRAND.ink, color: BRAND.bg, opacity: busy || (touched && !canSubmit) ? 0.5 : 1 }}
        >
          {busy ? "Creating…" : "Create invoice"}
        </button>
      </div>
    </div>
  );
}