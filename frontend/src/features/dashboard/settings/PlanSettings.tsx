import { useEffect, useState } from "react";
import { fetchTeamMembers } from "../teamsApi";
import { Check } from "lucide-react";
import { BRAND } from "../../../lib/theme";
import { useAuth } from "../../auth/AuthContext";
import { startSubscription } from "../billingApi";

const FREE_FEATURES = [
  "Unlimited sales and expense logs",
  "Unlimited invoices and receipts",
  "Payment tracking with partial payments",
  "Expense recording with receipt uploads",
  "WhatsApp & image sharing",
  "Custom notes and brand colors",
  "\"Who owes me\" and profit overview",
];

const BUSINESS_FEATURES = [
    "Profit & cash flow dashboard",
    "Business reports - daily, weekly & monthly",
    "Automatic payment reminders",
    "Customer history - who bought what, when",
    "Expense tracking with receipt photos",
    "AI business insights",
    "Up to 3 team members",
    "Export to Excel/PDF",
    "Custom business profile & branded invoice links",
];

export function PlanSettings() {
  const { accessToken } = useAuth();
  const [teamPlan, setTeamPlan] = useState<"free" | "business" | null>(null);
  const [myRole, setMyRole] = useState<string | null>(null);
  const [hideBranding, setHideBranding] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);
  const [subscribing, setSubscribing] = useState<"paystack" | "flutterwave" | null>(null);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    fetchTeamMembers(accessToken).then((data) => {
      setTeamPlan(data.team.plan);
      setMyRole(data.myRole);
    }).catch(() => {});
  }, [accessToken]);

  const handleToggleBranding = async () => {
    if (!accessToken) return;
    setSavingBranding(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/teams/branding/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ hideBranding: !hideBranding }),
      });
      if (res.ok) setHideBranding((v) => !v);
    } finally {
      setSavingBranding(false);
    }
  };

  const handleSubscribe = async (gateway: "paystack" | "flutterwave") => {
    if (!accessToken) return;
    setSubscribing(gateway);
    setSubscribeError(null);
    try {
      const { authorizationUrl } = await startSubscription(accessToken, gateway);
      window.location.href = authorizationUrl;
    } catch (err: any) {
      setSubscribeError(err?.message || "Couldn't start checkout.");
      setSubscribing(null);
    }
  };

  // const upgradeMailto = `mailto:yousual@gmail.com?subject=${encodeURIComponent("Business Plan upgrade request")}&body=${encodeURIComponent(
  //   `Hi, I'd like to upgrade ${user?.businessName || "my account"} to the Business Plan.`
  // )}`;

  const isBusiness = teamPlan === "business";
  const isFree = teamPlan === "free";

  return (
    <div className="flex flex-col gap-4">
      {/* Free plan card — always shown, marked "Current plan" only when actually on it */}
      <div className="rounded-3xl p-7" style={{ background: BRAND.card, border: isFree ? `2px solid ${BRAND.ink}` : `1px solid ${BRAND.line}` }}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-heading text-2xl">Free</h2>
          {isFree && <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: BRAND.mint, color: BRAND.green }}>Current plan</span>}
        </div>
        <p className="text-sm mb-5" style={{ color: BRAND.inkSoft }}>Everything you need to run your business day to day.</p>
        <div className="flex flex-col gap-2">
          {FREE_FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm">
              <Check size={15} style={{ color: BRAND.green }} className="shrink-0" /> {f}
            </div>
          ))}
        </div>
      </div>

      {/* Business plan card — always shown, so free users can see it and upgrade */}
      <div className="rounded-3xl p-7" style={{ background: BRAND.card, border: isBusiness ? `2px solid ${BRAND.ink}` : `1px solid ${BRAND.line}` }}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-heading text-2xl">Business</h2>
          {isBusiness && <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: BRAND.mint, color: BRAND.green }}>Current plan</span>}
        </div>
        <p className="text-sm mb-5" style={{ color: BRAND.inkSoft }}>For teams that are ready to grow beyond solo bookkeeping.</p>
        <div className="flex flex-col gap-2 mb-6">
          {BUSINESS_FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm">
              <Check size={15} style={{ color: isBusiness ? BRAND.green : BRAND.inkSoft }} className="shrink-0" /> {f}
            </div>
          ))}
        </div>

        {isBusiness ? (
          <p className="text-sm" style={{ color: BRAND.inkSoft }}>You're all set — manage your subscription from the Billing tab.</p>
        ) : (
          <>
            {subscribeError && <div className="rounded-xl px-4 py-3 mb-3 text-sm" style={{ background: BRAND.peach, color: BRAND.red }}>{subscribeError}</div>}
            <button onClick={() => handleSubscribe("paystack")} disabled={!!subscribing} className="inline-block rounded-full px-6 py-3 font-semibold text-sm" style={{ background: BRAND.ink, color: BRAND.bg, opacity: subscribing ? 0.6 : 1 }}>
              {subscribing === "paystack" ? "Redirecting…" : "Subscribe with Paystack"}
            </button>
            <button onClick={() => handleSubscribe("flutterwave")} disabled={!!subscribing} className="block mt-2 text-xs underline" style={{ color: BRAND.inkSoft }}>
              {subscribing === "flutterwave" ? "Redirecting…" : "Or pay with Flutterwave instead"}
            </button>
            <p className="text-xs mt-3" style={{ color: BRAND.inkSoft }}>Business Plan billing isn't live yet — this sends us a note and we'll follow up directly.</p>
          </>
        )}

        {isBusiness && myRole === "owner" && (
          <div className="flex items-center justify-between mt-5 pt-5" style={{ borderTop: `1px solid ${BRAND.line}` }}>
            <div>
              <div className="text-sm font-semibold">Hide "Powered by Yousual"</div>
              <div className="text-xs" style={{ color: BRAND.inkSoft }}>Removes it from invoices, receipts, and shared links.</div>
            </div>
            <button
              onClick={handleToggleBranding}
              disabled={savingBranding}
              className="w-11 h-6 rounded-full relative shrink-0 transition-colors"
              style={{ background: hideBranding ? BRAND.green : BRAND.line }}
            >
              <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform" style={{ transform: hideBranding ? "translateX(22px)" : "translateX(2px)" }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}