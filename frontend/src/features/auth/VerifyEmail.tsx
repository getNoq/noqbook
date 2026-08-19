import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { BRAND, FONT_IMPORT_BLOCK } from "../../lib/theme";
import { useAuth } from "./AuthContext";
import { verifyEmail } from "./authApi";

type Status = "verifying" | "success" | "error";

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const { isAuthenticated, refreshUser } = useAuth();
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing or invalid.");
      return;
    }
    verifyEmail({ token })
      .then(async () => {
        setStatus("success");
        if (isAuthenticated) await refreshUser();
      })
      .catch((err: any) => {
        setStatus("error");
        setMessage(err?.message || "That verification link is invalid or has expired.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div style={{ background: BRAND.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      <style>{FONT_IMPORT_BLOCK}</style>
      <div className="max-w-md mx-auto px-6 py-14 text-center">
        <div className="rounded-3xl p-8" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
          {status === "verifying" && <p className="text-sm" style={{ color: BRAND.inkSoft }}>Verifying your email…</p>}
          {status === "success" && (
            <>
              <CheckCircle2 size={40} style={{ color: BRAND.green }} className="mx-auto mb-4" />
              <h1 className="font-heading text-2xl mb-2">Email verified</h1>
              <p className="text-sm mb-6" style={{ color: BRAND.inkSoft }}>
                {isAuthenticated ? "You're all set — head back to your dashboard." : "You can now log in to your account."}
              </p>
              <Link to={isAuthenticated ? "/dashboard" : "/login"} className="inline-block rounded-full px-6 py-3 font-semibold text-sm" style={{ background: BRAND.ink, color: BRAND.bg }}>
                {isAuthenticated ? "Go to dashboard" : "Log in"}
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle size={40} style={{ color: BRAND.red }} className="mx-auto mb-4" />
              <h1 className="font-heading text-2xl mb-2">Verification failed</h1>
              <p className="text-sm mb-6" style={{ color: BRAND.inkSoft }}>{message}</p>
              <Link to={isAuthenticated ? "/dashboard" : "/login"} className="inline-block rounded-full px-6 py-3 font-semibold text-sm" style={{ background: BRAND.ink, color: BRAND.bg }}>
                {isAuthenticated ? "Back to dashboard" : "Log in"}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}