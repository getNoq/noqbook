import { useState, FormEvent, ReactNode } from "react";
import { Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { BRAND, FONT_IMPORT_BLOCK } from "../../lib/theme";
import { useAuth } from "./AuthContext";
import { requestPasswordReset, resetPassword } from "./authApi";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validatePhone,
  validateBusinessName,
} from "./validators";
import { Link } from "react-router-dom";

// ---------- Shared bits ----------

function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div style={{ background: BRAND.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      <style>{FONT_IMPORT_BLOCK}</style>
      <div className="max-w-xl mx-auto px-6 py-14">
        <div className="ob-serif text-lg tracking-tight mb-8">
          <a href="/" className="flex items-center justify-center gap-2 tracking-tight">
            <img src="/images/yousual-logomark.svg" alt="NOQ logomark" height={56} width={160} />
          </a>
        </div>
        <div className="rounded-3xl p-7" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
          <h1 className="font-heading text-3xl mb-1">{title}</h1>
          {subtitle && (
            <p className="text-sm mb-7" style={{ color: BRAND.inkSoft }}>
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {footer && (
          <div className="text-center text-sm mt-6" style={{ color: BRAND.inkSoft }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>
      {children}
    </label>
  );
}

const inputStyle = (invalid: boolean) => ({ border: `1px solid ${invalid ? BRAND.red : BRAND.line}` });

function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="text-xs mt-1.5" style={{ color: BRAND.red }}>
      {message}
    </div>
  );
}

function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-xl px-4 py-3 mb-5 text-sm" style={{ background: BRAND.peach, color: BRAND.red }}>
      {message}
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  invalid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl pl-4 pr-11 py-3 text-base md:text-sm outline-none"
          style={inputStyle(invalid)}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: BRAND.inkSoft }}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function SubmitButton({ busy, disabled, children }: { busy: boolean; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy || disabled}
      className="w-full rounded-full py-3.5 font-semibold text-sm flex items-center justify-center gap-2 transition-opacity"
      style={{ background: BRAND.ink, color: BRAND.bg, opacity: busy || disabled ? 0.5 : 1 }}
    >
      {busy && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

function LinkButton({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-full py-3.5 font-semibold text-sm"
      style={{ background: BRAND.ink, color: BRAND.bg }}
    >
      {children}
    </button>
  );
}

// ---------- Sign up ----------

export function SignUpForm({ onSuccess, onGoToLogin }: { onSuccess?: () => void; onGoToLogin?: () => void }) {
  const { signUp, error: authError, clearError } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  const emailError = validateEmail(email);
  const phoneError = validatePhone(phone);
  const passwordError = validatePassword(password);
  const confirmError = validateConfirmPassword(password, confirmPassword);
  const businessNameError = validateBusinessName(businessName);
  const canSubmit = !emailError && !phoneError && !passwordError && !confirmError && !businessNameError;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    setBusy(true);
    clearError();
    try {
      await signUp({ email: email.trim(), password, phone: phone.trim(), businessName: businessName.trim() });
      onSuccess?.();
    } catch {
      // authError is already set by AuthContext
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Takes less than a minute — no card required."
      footer={
        <>
          Already have an account?{" "}
          <button onClick={onGoToLogin} className="font-semibold underline underline-offset-2" style={{ color: BRAND.ink }}>
            Log in
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormError message={authError} />

        <div className="mb-5">
          <FieldLabel>Business name</FieldLabel>
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Adunni Fashion House"
            className="w-full rounded-xl px-4 py-3 text-[16px] md:text-sm outline-none"
            style={inputStyle(touched && !!businessNameError)}
          />
          {touched && <FieldError message={businessNameError} />}
        </div>

        <div className="mb-5">
          <FieldLabel>Email</FieldLabel>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com"
            className="w-full rounded-xl px-4 py-3 text-[16px] md:text-sm outline-none"
            style={inputStyle(touched && !!emailError)}
          />
          {touched && <FieldError message={emailError} />}
        </div>

        <div className="mb-5">
          <FieldLabel>Phone number</FieldLabel>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="0803 123 4567"
            maxLength={11}
            className="w-full rounded-xl px-4 py-3 text-[16px] md:text-sm outline-none"
            style={inputStyle(touched && !!phoneError)}
          />
          {touched && <FieldError message={phoneError} />}
        </div>

        <div className="mb-5">
          <PasswordField id="password" label="Password" value={password} onChange={setPassword} invalid={touched && !!passwordError} />
          {touched && <FieldError message={passwordError} />}
        </div>

        <div className="mb-5">
          <PasswordField
            id="confirmPassword"
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            invalid={touched && !!confirmError}
          />
          {touched && <FieldError message={confirmError} />}
        </div>

          <div className="mb-4 text-sm" style={{ color: BRAND.inkSoft }}>
            By signing up, you agree to our{" "}
            <Link to="/privacy-policy" target="_blank" className="underline" style={{ color: BRAND.ink }}>Privacy Policy</Link>.
          </div>

        <SubmitButton busy={busy} disabled={touched && !canSubmit}>
          Create account
        </SubmitButton>
      </form>
    </AuthShell>
  );
}

// ---------- Log in ----------

export function LoginForm({
  onSuccess,
  onGoToSignUp,
  onGoToForgotPassword,
}: {
  onSuccess?: () => void;
  onGoToSignUp?: () => void;
  onGoToForgotPassword?: () => void;
}) {
  const { logIn, error: authError, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  const emailError = validateEmail(email);
  const passwordError = password ? null : "Password is required.";
  const canSubmit = !emailError && !passwordError;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    setBusy(true);
    clearError();
    try {
      await logIn({ email: email.trim(), password });
      onSuccess?.();
    } catch {
      // authError is already set by AuthContext
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Log in"
      subtitle="Welcome back."
      footer={
        <>
          Don't have an account?{" "}
          <button onClick={onGoToSignUp} className="font-semibold underline underline-offset-2" style={{ color: BRAND.ink }}>
            Sign up
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormError message={authError} />

        <div className="mb-5">
          <FieldLabel>Email</FieldLabel>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com"
            className="w-full rounded-xl px-4 py-3 text-[16px] md:text-sm outline-none"
            style={inputStyle(touched && !!emailError)}
          />
          {touched && <FieldError message={emailError} />}
        </div>

        <div className="mb-3">
          <PasswordField id="login-password" label="Password" value={password} onChange={setPassword} invalid={touched && !!passwordError} />
          {touched && <FieldError message={passwordError} />}
        </div>

        <div className="flex justify-end mb-7">
          <button
            type="button"
            onClick={onGoToForgotPassword}
            className="text-xs font-semibold underline underline-offset-2"
            style={{ color: BRAND.inkSoft }}
          >
            Forgot password?
          </button>
        </div>

        <SubmitButton busy={busy} disabled={touched && !canSubmit}>
          Log in
        </SubmitButton>
      </form>
    </AuthShell>
  );
}

// ---------- Forgot password ----------

export function ForgotPasswordForm({ onGoToLogin }: { onGoToLogin?: () => void }) {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailError = validateEmail(email);
  const canSubmit = !emailError;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await requestPasswordReset({ email: email.trim() });
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Couldn't send the reset link. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <AuthShell title="Check your email">
        <div className="flex items-start gap-3 rounded-xl px-4 py-4" style={{ background: BRAND.mint }}>
          <CheckCircle2 size={18} style={{ color: BRAND.green, flexShrink: 0, marginTop: 2 }} />
          <p className="text-sm" style={{ color: BRAND.ink }}>
            If an account exists for <strong>{email}</strong>, a reset link is on its way.
          </p>
        </div>
        <button
          onClick={onGoToLogin}
          className="w-full mt-6 flex items-center justify-center gap-2 text-sm font-semibold"
          style={{ color: BRAND.inkSoft }}
        >
          <ArrowLeft size={14} /> Back to log in
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <button onClick={onGoToLogin} className="font-semibold underline underline-offset-2" style={{ color: BRAND.ink }}>
          Back to log in
        </button>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormError message={error} />
        <div className="mb-7">
          <FieldLabel>Email</FieldLabel>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com"
            className="w-full rounded-xl px-4 py-3 text-[16px] md:text-sm outline-none"
            style={inputStyle(touched && !!emailError)}
          />
          {touched && <FieldError message={emailError} />}
        </div>
        <SubmitButton busy={busy} disabled={touched && !canSubmit}>
          Send reset link
        </SubmitButton>
      </form>
    </AuthShell>
  );
}

// ---------- Reset password ----------

export function ResetPasswordForm({ token, onSuccess }: { token: string; onSuccess?: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordError = validatePassword(password);
  const confirmError = validateConfirmPassword(password, confirmPassword);
  const canSubmit = !passwordError && !confirmError && !!token;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await resetPassword({ token, password });
      setDone(true);
    } catch (err: any) {
      setError(err?.message || "That reset link may have expired. Request a new one.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <AuthShell title="Password updated">
        <div className="flex items-start gap-3 rounded-xl px-4 py-4 mb-6" style={{ background: BRAND.mint }}>
          <CheckCircle2 size={18} style={{ color: BRAND.green, flexShrink: 0, marginTop: 2 }} />
          <p className="text-sm" style={{ color: BRAND.ink }}>Your password has been changed. You can log in now.</p>
        </div>
        <LinkButton onClick={onSuccess}>Continue to log in</LinkButton>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose something you haven't used before.">
      <form onSubmit={handleSubmit} noValidate>
        <FormError message={error} />
        <div className="mb-5">
          <PasswordField id="new-password" label="New password" value={password} onChange={setPassword} invalid={touched && !!passwordError} />
          {touched && <FieldError message={passwordError} />}
        </div>
        <div className="mb-7">
          <PasswordField
            id="confirm-new-password"
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            invalid={touched && !!confirmError}
          />
          {touched && <FieldError message={confirmError} />}
        </div>
        <SubmitButton busy={busy} disabled={touched && !canSubmit}>
          Update password
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
