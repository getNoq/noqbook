import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Check, X } from "lucide-react";
import { BRAND, FONT_IMPORT_BLOCK } from "../../lib/theme";
import { useAuth } from "../auth/AuthContext";
import { normalizeNGPhone } from "../../lib/phone";
import { Sidebar } from "./Sidebar";
import { InvoicesTable } from "./InvoicesTable";
import { reminderText, shareCaption, openWhatsApp, docLabel } from "../../lib/invoiceHelpers";
import { renderInvoiceImage } from "../../lib/invoiceImage";
import { uploadInvoiceAndGetLink } from "../../lib/invoiceClientApi";
import type { Invoice } from "../../lib/invoiceTypes";
import { fetchCustomerDetail, updateCustomer, type CustomerDetail as CustomerDetailData } from "./customersApi";
import { BusinessPlanGate } from "./BusinessPlanGate";

const formatNaira = (n: number) => `₦${Number(n || 0).toLocaleString("en-NG")}`;

async function shareInvoiceAsImage(invoice: Invoice) {
  const blob = await renderInvoiceImage(invoice);
  const file = new File([blob], `${docLabel(invoice.status).toLowerCase()}.png`, { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d?: ShareData) => boolean };
  if (nav.canShare && nav.canShare({ files: [file] })) {
    await navigator.share({ files: [file], text: shareCaption(invoice) });
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docLabel(invoice.status).toLowerCase()}-${invoice.customerName}-${invoice.invoiceNumber}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [data, setData] = useState<CustomerDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!accessToken || !id) return;
    setIsLoading(true);
    setError(null);
    fetchCustomerDetail(accessToken, id)
      .then((d) => {
        setData(d);
        setEditName(d.customer.name);
        setEditPhone(d.customer.phone);
      })
      .catch((err) => setError(err?.message || "Couldn't load this customer."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [accessToken, id]);

  const phoneCheck = normalizeNGPhone(editPhone);

  const saveEdit = async () => {
    if (!accessToken || !id || !editName.trim() || !phoneCheck.valid) return;
    setSaving(true);
    try {
      await updateCustomer(accessToken, id, { name: editName.trim(), phone: phoneCheck.local || "" });
      setEditing(false);
      load();
    } catch (err: any) {
      setError(err?.message || "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col md:flex-row" style={{ background: BRAND.bg, fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      <style>{FONT_IMPORT_BLOCK}</style>
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 md:px-8 py-6 md:py-8 mb-20">
        <BusinessPlanGate feature="Customer history">
        {isLoading && <p className="text-sm" style={{ color: BRAND.inkSoft }}>Loading…</p>}
        {!isLoading && error && <p className="text-sm" style={{ color: BRAND.red }}>{error}</p>}
        {!isLoading && data && (
          <>
            <div className="rounded-2xl p-6 mb-6" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
              {!editing ? (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="font-heading text-2xl mb-1">{data.customer.name}</h1>
                    <p className="text-sm" style={{ color: BRAND.inkSoft }}>{data.customer.phone || "No phone on file"}</p>
                  </div>
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs font-semibold shrink-0" style={{ color: BRAND.inkSoft }}>
                    <Pencil size={13} /> Edit
                  </button>
                </div>
              ) : (
                <div>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-xl px-3 py-2 mb-2 text-base md:text-sm outline-none" style={{ border: `1px solid ${BRAND.line}` }} placeholder="Name" />
                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    className="w-full rounded-xl px-3 py-2 mb-3 text-base md:text-sm outline-none"
                    style={{ border: `1px solid ${!phoneCheck.empty && !phoneCheck.valid ? BRAND.red : BRAND.line}` }}
                    placeholder="Phone (optional)"
                    inputMode="numeric"
                    maxLength={11}
                  />
                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={saving || !editName.trim() || !phoneCheck.valid} className="flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold" style={{ background: BRAND.ink, color: BRAND.bg, opacity: saving ? 0.6 : 1 }}>
                      <Check size={13} /> Save
                    </button>
                    <button onClick={() => setEditing(false)} className="flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold" style={{ border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>
                      <X size={13} /> Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 mt-5 pt-5" style={{ borderTop: `1px solid ${BRAND.line}` }}>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.inkSoft }}>Sales</div>
                  <div className="font-heading text-xl">{data.totalSalesCount}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.inkSoft }}>Total value</div>
                  <div className="font-heading text-xl">{formatNaira(data.totalSpent)}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.inkSoft }}>Received</div>
                  <div className="font-heading text-xl" style={{ color: BRAND.green }}>{formatNaira(data.totalPaid)}</div>
                </div>
              </div>
            </div>

            <h2 className="font-heading text-lg mb-3">Sales history</h2>
            <InvoicesTable
              invoices={data.invoices}
              onSendReminder={(inv) => openWhatsApp(reminderText(inv), inv.customerPhone)}
              onShareAsImage={shareInvoiceAsImage}
              onShareLink={async (inv) => {
                const link = await uploadInvoiceAndGetLink(inv, accessToken);
                openWhatsApp(shareCaption(inv, link), inv.customerPhone);
              }}
            />

            <button onClick={() => navigate(-1)} className="mt-6 rounded-full px-5 py-2.5 text-sm font-semibold" style={{ border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>
              Back
            </button>
          </>
        )}
        </BusinessPlanGate>
      </main>
    </div>
  );
}