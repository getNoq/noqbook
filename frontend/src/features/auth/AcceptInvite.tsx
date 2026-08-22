import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import { BRAND, FONT_IMPORT_BLOCK } from "../../lib/theme";
import { useAuth } from "./AuthContext";

const PENDING_INVITE_KEY = "yousual_pending_invite_token";

interface InvitePreview {
  teamName: string;
  email: string;
  role: string;
}

async function fetchInvitePreview(token: string): Promise<InvitePreview> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/teams/invites/${token}/`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "This invite is invalid or has expired.");
  }
  return res.json();
}

export function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    fetchInvitePreview(token)
      .then((data) => { setInvite(data); setStatus("ready"); })
      .catch((err) => { setMessage(err.message); setStatus("error"); });
  }, [token]);

  // Once we know the invite is real, and once auth state has settled
  // (not mid-restore): if already logged in as the right person, the
  // invite was already auto-accepted at their last login/signup — send
  // them straight to the dashboard. If logged in as the WRONG person,
  // say so plainly. If not logged in at all, stash the token and route
  // to signup/login — AuthContext picks it up automatically from there.
  useEffect(() => {
    if (status !== "ready" || !invite || authLoading || !token) return;

    if (isAuthenticated) {
      if (user?.email.toLowerCase() === invite.email.toLowerCase()) {
        navigate("/dashboard", { replace: true });
      }
      return; // wrong-account case is rendered below, not redirected
    }

    try {
      sessionStorage.setItem(PENDING_INVITE_KEY, token);
    } catch {
      // sessionStorage unavailable — worst case, they land on signup
      // without the token pre-filled and can't auto-accept; rare.
    }
    navigate(`/signup?email=${encodeURIComponent(invite.email)}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, invite, authLoading, isAuthenticated]);

  const emailMismatch = isAuthenticated && invite && user?.email.toLowerCase() !== invite.email.toLowerCase();

  return (
    <div style={{ background: BRAND.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      <style>{FONT_IMPORT_BLOCK}</style>
      <div className="max-w-md mx-auto px-6 py-14 text-center">
        <div className="rounded-3xl p-8" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
          {(status === "loading" || (status === "ready" && !emailMismatch)) && (
            <p className="text-sm" style={{ color: BRAND.inkSoft }}>Taking you to join the team…</p>
          )}

          {status === "ready" && invite && emailMismatch && (
            <>
              <XCircle size={40} style={{ color: BRAND.red }} className="mx-auto mb-4" />
              <h1 className="font-heading text-2xl mb-2">Wrong account</h1>
              <p className="text-sm mb-6" style={{ color: BRAND.inkSoft }}>
                This invite was sent to <strong>{invite.email}</strong>, but you're logged in as {user?.email}. Log out and open this link again while logged in with the invited email.
              </p>
              <Link to="/dashboard" className="inline-block rounded-full px-6 py-3 font-semibold text-sm" style={{ background: BRAND.ink, color: BRAND.bg }}>Back to dashboard</Link>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle size={40} style={{ color: BRAND.red }} className="mx-auto mb-4" />
              <h1 className="font-heading text-2xl mb-2">Invite not found</h1>
              <p className="text-sm" style={{ color: BRAND.inkSoft }}>{message}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}