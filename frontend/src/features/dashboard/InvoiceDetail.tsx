import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BRAND, FONT_IMPORT_BLOCK } from "../../lib/theme";
import type { Invoice } from "../../lib/invoiceTypes";
import { useAuth } from "../auth/AuthContext";
import { Sidebar } from "./Sidebar";
import { DashboardInvoiceReceipt } from "./DashboardInvoiceReceipt";
import { fetchInvoiceDetail } from "./invoicesApi";

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !id) return;
    setIsLoading(true);
    setError(null);
    fetchInvoiceDetail(accessToken, id)
      .then(setInvoice)
      .catch((err) => setError(err?.message || "Couldn't load this invoice."))
      .finally(() => setIsLoading(false));
  }, [accessToken, id]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row gap-4" style={{ background: BRAND.bg, fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      <style>{FONT_IMPORT_BLOCK}</style>
      <Sidebar />
      <main className="flex-1 min-w-0">
        {isLoading && 
          <div className="max-w-xl mx-auto px-4 md:px-0 py-10 text-center text-sm" style={{ color: BRAND.inkSoft }}>
            Loading invoice…
            </div>
        }
        {!isLoading && error && 
          <div className="max-w-xl mx-auto px-4 md:px-0 py-10 text-center text-sm" style={{ color: BRAND.red }}>
            {error}
          </div>
        }
        {!isLoading && !error && invoice && (
          <DashboardInvoiceReceipt
            invoice={invoice}
            onPaymentRecorded={setInvoice}
            onDone={() => navigate("/dashboard")}
          />
        )}
      </main>
    </div>
  );
}