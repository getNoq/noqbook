import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { BRAND } from "../../../lib/theme";
import { useAuth } from "../../auth/AuthContext";
import { changePassword } from "../../auth/authApi";

const inputStyle = (invalid: boolean) => ({ border: `1px solid ${invalid ? BRAND.red : BRAND.line}` });

function PasswordField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl pl-4 pr-11 py-3 text-base md:text-sm outline-none"
        style={inputStyle(false)}
      />
      <button type="button" onClick={() => setVisible((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: BRAND.inkSoft }} aria-label={visible ? "Hide password" : "Show password"}>
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export function PasswordSettings() {
  const { accessToken } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const canSubmit = currentPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword;

  const handleSubmit = async () => {
    if (!accessToken || !canSubmit) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await changePassword(accessToken, { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.message || "Couldn't update your password. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl p-7" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
      {error && <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: BRAND.peach, color: BRAND.red }}>{error}</div>}
      {saved && <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: BRAND.mint, color: BRAND.green }}>Password updated.</div>}

      <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Current password</label>
      <div className="mb-5"><PasswordField value={currentPassword} onChange={setCurrentPassword} placeholder="••••••••" /></div>

      <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>New password</label>
      <div className="mb-5"><PasswordField value={newPassword} onChange={setNewPassword} placeholder="At least 8 characters" /></div>

      <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Confirm new password</label>
      <div className="mb-2"><PasswordField value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" /></div>
      <div className="mb-7 min-h-[16px] text-xs" style={{ color: BRAND.red }}>{confirmPassword && newPassword !== confirmPassword ? "Passwords don't match." : ""}</div>

      <button onClick={handleSubmit} disabled={busy || !canSubmit} className="rounded-full px-6 py-3 font-semibold text-sm transition-opacity" style={{ background: BRAND.ink, color: BRAND.bg, opacity: busy || !canSubmit ? 0.5 : 1 }}>
        {busy ? "Updating…" : "Update password"}
      </button>
    </div>
  );
}