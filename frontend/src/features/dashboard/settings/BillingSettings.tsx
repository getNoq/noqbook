import { useEffect, useState } from "react";
import { BRAND } from "../../../lib/theme";
import { useAuth } from "../../auth/AuthContext";
import { fetchBillingStatus, fetchBillingHistory, cancelSubscription, type BillingStatus, type BillingHistoryRow } from "../billingApi";

export function BillingSettings() {
  const { accessToken } = useAuth();
  const [statusData, setStatusData] = useState<BillingStatus | null>(null);
  const [history, setHistory] = useState<BillingHistoryRow[]>([]);
  const [canceling, setCanceling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = () => {
    if (!accessToken) return;
    fetchBillingStatus(accessToken).then(setStatusData).catch(() => {});
    fetchBillingHistory(accessToken).then(setHistory).catch(() => {});
  };

  useEffect(load, [accessToken]);

  const handleCancel = async () => {
    if (!accessToken) return;
    setCanceling(true);
    try {
      const res = await cancelSubscription(accessToken);
      setMessage(res.message);
      load();
    } catch (err: any) {
      setMessage(err?.message || "Couldn't cancel.");
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {message && <div className="rounded-xl px-4 py-3 text-sm" style={{ background: BRAND.mint, color: BRAND.green }}>{message}</div>}

      <div className="rounded-3xl p-7" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
        <h2 className="font-heading text-xl mb-4">Current subscription</h2>
        {statusData?.plan === "business" ? (
          <>
            <p className="text-sm mb-1">
              <span className="font-semibold">Business Plan</span>{" "}
              {statusData.isComped && <span style={{ color: BRAND.inkSoft }}>(complimentary)</span>}
            </p>
            {statusData.subscription && (
              <p className="text-xs mb-4" style={{ color: BRAND.inkSoft }}>
                Via {statusData.subscription.gateway} · renews {statusData.subscription.currentPeriodEnd ? new Date(statusData.subscription.currentPeriodEnd).toLocaleDateString("en-NG") : "—"}
              </p>
            )}
            {!statusData.isComped && statusData.subscription?.status === "active" && (
              <button onClick={handleCancel} disabled={canceling} className="rounded-full px-5 py-2.5 text-sm font-semibold" style={{ border: `1px solid ${BRAND.line}`, color: BRAND.red }}>
                {canceling ? "Canceling…" : "Cancel subscription"}
              </button>
            )}
          </>
        ) : (
          <p className="text-sm" style={{ color: BRAND.inkSoft }}>You're on the Free plan. Upgrade from the Plan tab.</p>
        )}
      </div>

      <div className="rounded-3xl p-7" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
        <h2 className="font-heading text-xl mb-4">Billing history</h2>
        {history.length === 0 ? (
          <p className="text-sm" style={{ color: BRAND.inkSoft }}>No transactions yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm py-1.5" style={{ borderBottom: `1px solid ${BRAND.line}` }}>
                <span>{new Date(t.createdAt).toLocaleDateString("en-NG")} · {t.gateway}</span>
                <span className="font-semibold" style={{ color: t.status === "success" ? BRAND.green : BRAND.red }}>₦{t.amount.toLocaleString("en-NG")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}