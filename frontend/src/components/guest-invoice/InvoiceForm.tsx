import { Plus, Trash2, Lock } from "lucide-react";
import { BRAND } from "../../lib/theme";
import type { InvoiceItem, InvoiceStatus, PhoneCheck } from "./types";
import { NOTE_DEFAULTS } from "./constants";
import { formatNaira, docLabel } from "./invoiceHelpers";

const inputStyle = (invalid: boolean) => ({ border: `1px solid ${invalid ? BRAND.red : BRAND.line}` });

interface InvoiceFormProps {
  businessName: string;
  onBusinessNameChange: (value: string) => void;
  customerName: string;
  onCustomerNameChange: (value: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (value: string) => void;
  phoneCheck: PhoneCheck;
  items: InvoiceItem[];
  onUpdateItem: (id: string, field: keyof InvoiceItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  status: InvoiceStatus;
  onStatusChange: (status: InvoiceStatus) => void;
  total: number;
  canGenerate: boolean;
  onGenerate: () => void;
  hasSavedInvoices: boolean;
}

export function InvoiceForm({
  businessName,
  onBusinessNameChange,
  customerName,
  onCustomerNameChange,
  customerPhone,
  onCustomerPhoneChange,
  phoneCheck,
  items,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  status,
  onStatusChange,
  total,
  canGenerate,
  onGenerate,
  hasSavedInvoices,
}: InvoiceFormProps) {
  return (
    <div className="rounded-3xl p-7" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
      <h1 className="font-heading text-[28px] md:text-[40px]">
        Create {hasSavedInvoices ? "another" : "your first"} invoice
      </h1>
      <p className="text-sm mb-7" style={{ color: BRAND.inkSoft }}>
        Fill this out like paper. Nothing is saved until you say so.
      </p>

      <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>
        Your business name
      </label>
      <input
        value={businessName}
        onChange={(e) => onBusinessNameChange(e.target.value)}
        placeholder="e.g. Adunni Fashion House"
        className="w-full rounded-xl px-4 py-3 mb-5 text-[16px] md:text-sm outline-none"
        style={inputStyle(false)}
      />

      <div className="grid grid-cols-2 gap-4 mb-1">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>
            Customer name
          </label>
          <input
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            placeholder="e.g. Chidinma"
            className="w-full rounded-xl px-4 py-3 text-[16px] md:text-sm outline-none"
            style={inputStyle(false)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>
            Phone (optional)
          </label>
          <input
            value={customerPhone}
            onChange={(e) => onCustomerPhoneChange(e.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="0803 123 4567"
            inputMode="numeric"
            maxLength={11}
            className="w-full rounded-xl px-4 py-3 text-[16px] md:text-sm outline-none"
            style={inputStyle(!phoneCheck.empty && !phoneCheck.valid)}
          />
        </div>
      </div>
      <div className="mb-2 min-h-[18px]">
        {!phoneCheck.empty && !phoneCheck.valid && (
          <div className="text-xs mt-1.5" style={{ color: BRAND.red }}>
            Enter a valid Nigerian number, e.g. 0803 123 4567.
          </div>
        )}
      </div>

      <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>
        Items
      </label>
      <div className="flex flex-col gap-3 mb-3">
        {items.map((it) => (
          <div key={it.id} className="flex flex-wrap md:flex-nowrap gap-2 items-center w-full">
            <input
              value={it.description}
              onChange={(e) => onUpdateItem(it.id, "description", e.target.value)}
              placeholder="Item or service"
              className="w-full md:flex-1 rounded-xl px-3 py-2.5 text-[16px] md:text-sm outline-none"
              style={inputStyle(false)}
            />
            <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
              <input
                type="number"
                min={1}
                value={it.qty || ""}
                placeholder="Qty"
                onChange={(e) => onUpdateItem(it.id, "qty", e.target.value === "" ? "" : Number(e.target.value))}
                className="w-16 rounded-xl px-2 py-2.5 text-[16px] md:text-sm outline-none text-center"
                style={inputStyle(false)}
                required
              />

              <input
                type="number"
                min={0}
                value={it.unitPrice || ""}
                placeholder="Price"
                onChange={(e) => onUpdateItem(it.id, "unitPrice", e.target.value === "" ? "" : Number(e.target.value))}
                className="flex-1 w-full md:w-28 rounded-xl px-3 py-2.5 text-[16px] md:text-sm outline-none"
                style={inputStyle(false)}
                required
              />
              <button
                onClick={() => onRemoveItem(it.id)}
                className="p-2 rounded-lg shrink-0"
                style={{ color: BRAND.red }}
                aria-label="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onAddItem} className="flex items-center gap-1.5 text-sm font-semibold mb-6" style={{ color: BRAND.lavStrong }}>
        <Plus size={15} /> Add another item
      </button>

      <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>
        Payment status
      </label>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => onStatusChange("paid")}
          className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
          style={{
            background: status === "paid" ? BRAND.mint : BRAND.card,
            border: `1px solid ${status === "paid" ? BRAND.green : BRAND.line}`,
            color: status === "paid" ? BRAND.green : BRAND.inkSoft,
          }}
        >
          Paid
        </button>
        <button
          onClick={() => onStatusChange("due")}
          className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
          style={{
            background: status === "due" ? BRAND.peach : BRAND.card,
            border: `1px solid ${status === "due" ? BRAND.red : BRAND.line}`,
            color: status === "due" ? BRAND.red : BRAND.inkSoft,
          }}
        >
          Outstanding
        </button>
      </div>

      {/* Notes — account-gated. Guests see a preview of the default text
          (matched to the current status) but can't type, edit, or remove
          it. This is intentionally a locked preview, not a disabled
          form field, so it reads as "here's what you'd get" rather than
          a broken input. */}
      <div className="rounded-xl px-4 py-3.5 mb-6 flex items-start gap-3" style={{ border: `1px dashed ${BRAND.line}` }}>
        <Lock size={15} style={{ color: BRAND.inkSoft, marginTop: 2, flexShrink: 0 }} />
        <div>
          <div className="text-[18px] font-heading uppercase tracking-wide mb-1.5" style={{ color: BRAND.inkSoft }}>
            Notes (optional)
          </div>
          <div className="text-sm mb-1.5" style={{ color: BRAND.inkSoft }}>
            "{NOTE_DEFAULTS[status]}"
          </div>
          <div className="text-xs" style={{ color: BRAND.inkSoft }}>
            Add custom notes with a free account.
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-semibold" style={{ color: BRAND.inkSoft }}>
          Total
        </span>
        <span className="font-heading text-[32px]">{formatNaira(total)}</span>
      </div>

      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        className="w-full rounded-full py-3.5 font-semibold text-sm transition-opacity"
        style={{ background: BRAND.ink, color: BRAND.bg, opacity: canGenerate ? 1 : 0.4, cursor: canGenerate ? "pointer" : "not-allowed" }}
      >
        Generate {docLabel(status).toLowerCase()}
      </button>
    </div>
  );
}