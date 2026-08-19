import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { BRAND, PRESET_COLORS } from "../../lib/theme";
import { normalizeNGPhone } from "../../lib/phone";
import type { CreateInvoicePayload } from "./invoicesApi";
import { CustomerAutocomplete } from "./CustomerAutocomplete";

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
  const [note, setNote] = useState("");
  const [brandColor, setBrandColor] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [amountPaidNow, setAmountPaidNow] = useState<number | "">(0);
  const [amountManuallyEdited, setAmountManuallyEdited] = useState(false);

  const phoneCheck = normalizeNGPhone(customerPhone);
  const updateItem = (id: string, field: keyof DraftItem, value: string | number) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  const addItem = () => setItems((prev) => [...prev, emptyDraftItem()]);
  const removeItem = (id: string) => setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));

  const filledItems = items.filter((it) => it.description.trim().length > 0);
  const total = filledItems.reduce((sum, it) => sum + Number(it.qty || 0) * Number(it.unitPrice || 0), 0);

  // Defaults "amount received" to the full total (paid-in-full is the
  // common case) but stops auto-syncing the moment the owner types
  // their own number, so a deliberate partial amount never gets
  // silently overwritten by a later edit to the items.
  useEffect(() => {
    if (!amountManuallyEdited) setAmountPaidNow(total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const balance = total - Number(amountPaidNow || 0);
  const amountValid = amountPaidNow !== "" && Number(amountPaidNow) >= 0 && Number(amountPaidNow) <= total;

  const canSubmit =
    customerName.trim().length > 0 &&
    filledItems.length > 0 &&
    filledItems.every((it) => Number(it.qty) > 0 && Number(it.unitPrice) > 0) &&
    phoneCheck.valid &&
    amountValid;

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
        amountPaidNow: Number(amountPaidNow || 0),
        note: note.trim(),
        brandColor,
      });
    } catch (err: any) {
      setError(err?.message || "Couldn't record the sale. Try again.");
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 md:px-0 py-6">
      <div className="rounded-3xl p-7" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
        <h1 className="font-heading text-[28px] md:text-[36px] mb-1">Record a sale</h1>
        <p className="text-sm mb-7" style={{ color: BRAND.inkSoft }}>
          We'll generate a receipt if it's paid in full, or an invoice if there's a balance left.
        </p>

        {error && <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: BRAND.peach, color: BRAND.red }}>{error}</div>}

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Customer name</label>
        {/* <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Chidinma" className="w-full rounded-xl px-4 py-3 mb-5 text-base md:text-sm outline-none" style={inputStyle(touched && !customerName.trim())} /> */}
        <div className="mb-5">
          <CustomerAutocomplete
            value={customerName}
            onChange={setCustomerName}
            onSelectCustomer={(c) => { setCustomerName(c.name); if (c.phone) setCustomerPhone(c.phone); }}
            invalid={touched && !customerName.trim()}
          />
        </div>

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Phone (optional)</label>
        <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 11))} placeholder="08031234567" inputMode="numeric" maxLength={11} className="w-full rounded-xl px-4 py-3 mb-2 text-base md:text-sm outline-none" style={inputStyle(!phoneCheck.empty && !phoneCheck.valid)} />
        <div className="mb-4 min-h-[16px]">
          {!phoneCheck.empty && !phoneCheck.valid && <div className="text-xs" style={{ color: BRAND.red }}>Enter a valid Nigerian number, e.g. 08031234567.</div>}
        </div>

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Items sold</label>
        <div className="flex flex-col gap-3 mb-3">
          {items.map((it) => (
            <div key={it.id} className="flex flex-wrap gap-2 items-center w-full">
              <input value={it.description} onChange={(e) => updateItem(it.id, "description", e.target.value)} placeholder="Item or service" className="w-full sm:flex-1 rounded-xl px-3 py-2.5 text-base md:text-sm outline-none" style={inputStyle(false)} />
              <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
                <input type="number" min={1} value={it.qty || ""} placeholder="Qty" onChange={(e) => updateItem(it.id, "qty", e.target.value === "" ? "" : Number(e.target.value))} className="w-16 rounded-xl px-2 py-2.5 text-base md:text-sm outline-none text-center" style={inputStyle(false)} />
                <input type="number" min={0} value={it.unitPrice || ""} placeholder="Price" onChange={(e) => updateItem(it.id, "unitPrice", e.target.value === "" ? "" : Number(e.target.value))} className="w-full flex-1 rounded-xl px-3 py-2.5 text-base md:text-sm outline-none" style={inputStyle(false)} />
                <button onClick={() => removeItem(it.id)} className="p-2 rounded-lg shrink-0" style={{ color: BRAND.red }} aria-label="Remove item"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addItem} className="flex items-center gap-1.5 text-sm font-semibold mb-6" style={{ color: BRAND.lavStrong }}><Plus size={15} /> Add another item</button>

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2 mt-5" style={{ color: BRAND.inkSoft }}>Amount received now</label>
        <input
          type="number"
          min={0}
          max={total}
          value={amountPaidNow}
          onChange={(e) => {
            setAmountManuallyEdited(true);
            setAmountPaidNow(e.target.value === "" ? "" : Number(e.target.value));
          }}
          placeholder="0"
          className="w-full rounded-xl px-4 py-3 mb-2 text-base md:text-sm outline-none"
          style={inputStyle(touched && !amountValid)}
        />
        <div className="mb-6 min-h-[18px] text-xs" style={{ color: balance > 0 ? BRAND.red : BRAND.green }}>
          {touched && !amountValid
            ? "Amount received can't be more than the sale total."
            : balance > 0
              ? `₦${balance.toLocaleString("en-NG")} balance remaining`
              : total > 0
                ? "Paid in full"
                : ""}
        </div>

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Notes (optional)</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 280))} placeholder={"e.g. Payment due within 7 days.\nThank you for your business!"} rows={4} className="w-full rounded-xl px-4 py-3 mb-6 text-base md:text-sm outline-none resize-none" style={inputStyle(false)} />

        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Brand color (optional)</label>
        <div className="flex gap-3 mb-7">
          {PRESET_COLORS.map((c) => (
            <button key={c.value} onClick={() => setBrandColor((prev) => (prev === c.value ? "" : c.value))} title={c.name} className="w-9 h-9 rounded-full" style={{ background: c.value, boxShadow: brandColor === c.value ? `0 0 0 2px ${BRAND.bg}, 0 0 0 4px ${c.value}` : "none" }} aria-label={c.name} aria-pressed={brandColor === c.value} />
          ))}
        </div>

        <div className="flex items-center justify-between mb-1">
          <span className="text-[14px]" style={{ color: BRAND.inkSoft }}>Outstanding</span>
          <span className="font-heading text-[24px]" style={{ color: BRAND.red }}>₦{balance.toLocaleString("en-NG")}</span>
        </div>

        <div className="flex items-center justify-between mb-1">
          <span className="text-[14px]" style={{ color: BRAND.inkSoft }}>Paid</span>
          <span className="font-heading text-[24px]" style={{ color: BRAND.green }}>₦{amountPaidNow.toLocaleString("en-NG")}</span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: BRAND.inkSoft }}>Sale total</span>
          <span className="font-heading text-[32px]">NGN {total.toLocaleString("en-NG")}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={onCancel} className="flex-1 order-2 sm:order-1 rounded-full py-3.5 font-semibold text-sm" style={{ border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>Cancel</button>
          <button onClick={handleSubmit} disabled={busy || (touched && !canSubmit)} className="flex-1 order-1 sm:order-2 rounded-full py-3.5 font-semibold text-sm transition-opacity" style={{ background: BRAND.ink, color: BRAND.bg, opacity: busy || (touched && !canSubmit) ? 0.5 : 1 }}>
            {busy ? "Recording…" : "Record sale"}
          </button>
        </div>
      </div>
    </div>
  );
}