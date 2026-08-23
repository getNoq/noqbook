import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Pencil, Trash2, History } from "lucide-react";
import { BRAND, FONT_IMPORT_BLOCK } from "../../lib/theme";
// import type { Invoice } from "../../lib/invoiceTypes";
import { useAuth } from "../auth/AuthContext";
import { Sidebar } from "./Sidebar";
import { DashboardInvoiceReceipt } from "./DashboardInvoiceReceipt";
import { EditInvoiceForm } from "./EditInvoiceForm";
import { fetchInvoiceDetail, updateInvoice, deleteInvoice, type InvoiceDetail as InvoiceDetailData, type UpdateInvoicePayload } from "./invoicesApi";

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessToken, user } = useAuth();
  const [invoice, setInvoice] = useState<InvoiceDetailData | null>(null);
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
    fetchInvoiceDetail(accessToken, id)
      .then((data) => setInvoice(data as InvoiceDetailData))
      .catch((err) => setError(err?.message || "Couldn't load this invoice."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [accessToken, id]);

  const goBack = () => {
    if (location.key !== "default") navigate(-1);
    else navigate("/dashboard");
  };

  const handleSaveEdit = async (payload: UpdateInvoicePayload) => {
    if (!accessToken || !id) return;
    const updated = await updateInvoice(accessToken, id, payload);
    setInvoice(updated);
    setEditing(false);
    setJustEdited(true);
    setTimeout(() => setJustEdited(false), 6000);
  };

  const handleDelete = async () => {
    if (!accessToken || !id) return;
    setDeleting(true);
    try {
      await deleteInvoice(accessToken, id);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Couldn't delete this sale.");
      setDeleting(false);
    }
  };

  const canManage = user?.role === "owner" || user?.role === "admin" || user?.role === "staff"; // edit: everyone
  const canDelete = user?.role === "owner"; // delete: owner only
  const canSeeHistory = user?.role === "owner" || user?.role === "admin";

  return (
    <div className="min-h-dvh flex flex-col md:flex-row gap-4" style={{ background: BRAND.bg, fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      <style>{FONT_IMPORT_BLOCK}</style>
      <Sidebar />
      <main className="flex-1 min-w-0">
        {isLoading && <div className="max-w-xl mx-auto px-4 md:px-0 py-10 text-center text-sm" style={{ color: BRAND.inkSoft }}>Loading invoice…</div>}
        {!isLoading && error && <div className="max-w-xl mx-auto px-4 md:px-0 py-10 text-center text-sm" style={{ color: BRAND.red }}>{error}</div>}

        {!isLoading && !error && invoice && (
          <div className="max-w-xl mx-auto px-4 md:px-0 pt-6 pb-0">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex gap-2">
                {canManage && (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold" style={{ border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>
                    <Pencil size={13} /> Edit
                  </button>
                )}
                {canSeeHistory && invoice.editHistory.length > 0 && (
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
                Sale updated. If you already shared this with your customer, use "Share as image" or "Share link" below to send them the updated version — the original link they have won't change on its own.
              </div>
            )}

            {showHistory && canSeeHistory && (
              <div className="rounded-2xl p-4 mb-4" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
                <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: BRAND.inkSoft }}>Edit history</div>
                <div className="flex flex-col gap-3">
                  {invoice.editHistory.map((log) => (
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
          </div>
        )}

        {!isLoading && !error && invoice && (
          <DashboardInvoiceReceipt invoice={invoice} onPaymentRecorded={setInvoice as any} onDone={goBack} />
        )}
      </main>

      {editing && invoice && (
        <EditInvoiceForm invoice={invoice} onCancel={() => setEditing(false)} onSave={handleSaveEdit} />
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-3xl p-6 text-center" style={{ background: BRAND.card }}>
            <h2 className="font-heading text-xl mb-2">Delete this sale?</h2>
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
