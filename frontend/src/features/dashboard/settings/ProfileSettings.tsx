import { useState } from "react";
import { BRAND } from "../../../lib/theme";
import { normalizeNGPhone } from "../../../lib/phone";
import { useAuth } from "../../auth/AuthContext";

const inputStyle = (invalid: boolean) => ({ border: `1px solid ${invalid ? BRAND.red : BRAND.line}` });

export function ProfileSettings() {
  const { user, updateProfile } = useAuth();
  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const phoneCheck = normalizeNGPhone(phone);
  const canSubmit = businessName.trim().length > 0 && phoneCheck.valid;

  const handleSubmit = async () => {
    setTouched(true);
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile({ businessName: businessName.trim(), firstName: firstName.trim(), lastName: lastName.trim(), phone: phoneCheck.local || phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.message || "Couldn't update your profile. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl p-7" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
      {error && <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: BRAND.peach, color: BRAND.red }}>{error}</div>}
      {saved && <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: BRAND.mint, color: BRAND.green }}>Profile updated.</div>}

      <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Business name</label>
      <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full rounded-xl px-4 py-3 mb-5 text-base md:text-sm outline-none" style={inputStyle(touched && !businessName.trim())} />

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>First name</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-xl px-4 py-3 text-base md:text-sm outline-none" style={inputStyle(false)} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Last name</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-xl px-4 py-3 text-base md:text-sm outline-none" style={inputStyle(false)} />
        </div>
      </div>

      <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Phone number</label>
      <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))} inputMode="numeric" maxLength={11} className="w-full rounded-xl px-4 py-3 mb-2 text-base md:text-sm outline-none" style={inputStyle(touched && !phoneCheck.valid)} />
      <div className="mb-5 min-h-[16px] text-xs" style={{ color: BRAND.red }}>{touched && !phoneCheck.valid ? "Enter a valid Nigerian number, e.g. 08031234567." : ""}</div>

      <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Email</label>
      <input value={user?.email || ""} disabled className="w-full rounded-xl px-4 py-3 mb-1 text-base md:text-sm outline-none cursor-not-allowed opacity-60" style={inputStyle(false)} />
      <div className="mb-7 text-xs" style={{ color: BRAND.inkSoft }}>Email can't be changed yet — contact support if you need this updated.</div>

      <button onClick={handleSubmit} disabled={busy || (touched && !canSubmit)} className="rounded-full px-6 py-3 font-semibold text-sm transition-opacity" style={{ background: BRAND.ink, color: BRAND.bg, opacity: busy || (touched && !canSubmit) ? 0.5 : 1 }}>
        {busy ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}