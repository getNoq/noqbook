import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { BRAND, FONT_IMPORT_BLOCK } from "../../../lib/theme";
import { useAuth } from "../../auth/AuthContext";
import { verifyPayment } from "../billingApi";

export function BillingCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { accessToken, refreshUser } = useAuth();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const gateway = searchParams.get("gateway") || "paystack";
    const reference =
      gateway === "flutterwave"
        ? searchParams.get("tx_ref") || ""
        : searchParams.get("reference") || searchParams.get("trxref") || "";

    if (!accessToken || !reference) {
      setStatus("error");
      setMessage("Missing payment reference.");
      return;
    }
    verifyPayment(accessToken, gateway, reference)
      .then(async () => {
        setStatus("success");
        await refreshUser();
      })
      .catch((err: any) => {
        setStatus("error");
        setMessage(err.message);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ background: BRAND.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      <style>{FONT_IMPORT_BLOCK}</style>
      <div className="max-w-md mx-auto px-6 py-14 text-center">
        <div className="rounded-3xl p-8" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
          {status === "verifying" && <p className="text-sm" style={{ color: BRAND.inkSoft }}>Confirming your payment…</p>}
          {status === "success" && (
            <>
              <CheckCircle2 size={40} style={{ color: BRAND.green }} className="mx-auto mb-4" />
              <h1 className="font-heading text-2xl mb-2">You're on Business Plan</h1>
              <button onClick={() => navigate("/dashboard/settings/plan")} className="rounded-full px-6 py-3 font-semibold text-sm mt-4" style={{ background: BRAND.ink, color: BRAND.bg }}>Back to Settings</button>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle size={40} style={{ color: BRAND.red }} className="mx-auto mb-4" />
              <h1 className="font-heading text-2xl mb-2">Payment not confirmed</h1>
              <p className="text-sm mb-4" style={{ color: BRAND.inkSoft }}>{message}</p>
              <button onClick={() => navigate("/dashboard/settings/plan")} className="rounded-full px-6 py-3 font-semibold text-sm" style={{ border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>Back to Settings</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}