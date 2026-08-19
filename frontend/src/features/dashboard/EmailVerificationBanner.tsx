import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { BRAND } from "../../lib/theme";
import { useAuth } from "../auth/AuthContext";

const RESEND_COOLDOWN_SECONDS = 30;

export function EmailVerificationBanner() {
  const { user, resendVerificationEmail } = useAuth();
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (!user || user.isEmailVerified) return null;

  const handleResend = async () => {
    setSending(true);
    setError(null);
    try {
      await resendVerificationEmail();
      setCooldown(RESEND_COOLDOWN_SECONDS);
      const interval = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(interval);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Couldn't resend the email. Try again shortly.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl px-4 py-3 mb-6 flex items-center justify-between gap-3 flex-wrap" style={{ background: BRAND.peach }}>
      <div className="flex items-center gap-2 text-sm" style={{ color: BRAND.red }}>
        <AlertTriangle size={16} className="shrink-0" />
        <span>
          Verify <strong>{user.email}</strong> to record new sales and expenses.
          {error && <span className="block text-xs mt-0.5">{error}</span>}
        </span>
      </div>
      <button onClick={handleResend} disabled={sending || cooldown > 0} className="text-xs font-semibold underline underline-offset-2 disabled:opacity-50 shrink-0" style={{ color: BRAND.red }}>
        {cooldown > 0 ? `Resent — retry in ${cooldown}s` : sending ? "Sending…" : "Resend email"}
      </button>
    </div>
  );
}