import { useState } from "react";
import { X, Mail } from "lucide-react";
import { BRAND } from "../../lib/theme";
import { useAuth } from "../auth/AuthContext";

export function VerifyEmailGateModal({ onClose }: { onClose: () => void }) {
  const { user, resendVerificationEmail } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setSending(true);
    setError(null);
    try {
      await resendVerificationEmail();
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Couldn't resend the email. Try again shortly.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: BRAND.card }}>
        <div className="flex justify-end">
          <button onClick={onClose} aria-label="Close" style={{ color: BRAND.inkSoft }}><X size={18} /></button>
        </div>
        <div className="text-center -mt-2">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: BRAND.peach }}>
            <Mail size={22} style={{ color: BRAND.red }} />
          </div>
          <h2 className="font-heading text-xl mb-2">Verify your email first</h2>
          <p className="text-sm mb-5" style={{ color: BRAND.inkSoft }}>
            We sent a link to <strong>{user?.email}</strong>. Verify it to start recording sales and expenses.
          </p>
          {error && <div className="rounded-xl px-3 py-2 mb-4 text-xs" style={{ background: BRAND.peach, color: BRAND.red }}>{error}</div>}
          {sent && <div className="rounded-xl px-3 py-2 mb-4 text-xs" style={{ background: BRAND.mint, color: BRAND.green }}>Email sent — check your inbox.</div>}
          <button onClick={handleResend} disabled={sending || sent} className="w-full rounded-full py-3 font-semibold text-sm transition-opacity" style={{ background: BRAND.ink, color: BRAND.bg, opacity: sending || sent ? 0.6 : 1 }}>
            {sending ? "Sending…" : sent ? "Sent" : "Resend verification email"}
          </button>
        </div>
      </div>
    </div>
  );
}