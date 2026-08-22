import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { BRAND, FONT_IMPORT_BLOCK } from "../../lib/theme";
import { useAuth } from "./AuthContext";
import { fetchInvitePreview, acceptInvite, type InvitePreview } from "../dashboard/teamsApi";

export function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, accessToken } = useAuth();
  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "accepted" | "error">("loading");
  const [message, setMessage] = useState("");
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchInvitePreview(token)
      .then((data) => { setInvite(data); setStatus("ready"); })
      .catch((err) => { setMessage(err.message); setStatus("error"); });
  }, [token]);

  const handleAccept = async () => {
    if (!token || !accessToken) return;
    setAccepting(true);
    try {
      await acceptInvite(accessToken, token);
      setStatus("accepted");
    } catch (err: any) {
      setMessage(err?.message || "Couldn't accept this invite.");
      setStatus("error");
    } finally {
      setAccepting(false);
    }
  };

  const emailMismatch = isAuthenticated && invite && user?.email.toLowerCase() !== invite.email.toLowerCase();

  return (
    <div style={{ background: BRAND.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      <style>{FONT_IMPORT_BLOCK}</style>
      <div className="max-w-md mx-auto px-6 py-14 text-center">
        <div className="rounded-3xl p-8" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
          {status === "loading" && <p className="text-sm" style={{ color: BRAND.inkSoft }}>Loading invite…</p>}

          {status === "ready" && invite && !emailMismatch && (
            <>
              <h1 className="font-heading text-2xl mb-2">Join {invite.teamName}</h1>
              <p className="text-sm mb-6" style={{ color: BRAND.inkSoft }}>
                You've been invited as <strong>{invite.role}</strong>.
              </p>
              {!isAuthenticated ? (
                <>
                  <p className="text-sm mb-4" style={{ color: BRAND.inkSoft }}>Log in or sign up with <strong>{invite.email}</strong> first, then come back to this link.</p>
                  <div className="flex gap-3">
                    <Link to={`/login?email=${encodeURIComponent(invite.email)}`} className="flex-1 rounded-full py-3 font-semibold text-sm" style={{ border: `1px solid ${BRAND.line}` }}>Log in</Link>
                    <Link to={`/signup?email=${encodeURIComponent(invite.email)}`} className="flex-1 rounded-full py-3 font-semibold text-sm" style={{ background: BRAND.ink, color: BRAND.bg }}>Sign up</Link>
                  </div>
                </>
              ) : (
                <button onClick={handleAccept} disabled={accepting} className="w-full rounded-full py-3 font-semibold text-sm transition-opacity" style={{ background: BRAND.ink, color: BRAND.bg, opacity: accepting ? 0.6 : 1 }}>
                  {accepting ? "Joining…" : "Accept invite"}
                </button>
              )}
            </>
          )}

          {status === "ready" && invite && emailMismatch && (
            <>
              <XCircle size={40} style={{ color: BRAND.red }} className="mx-auto mb-4" />
              <h1 className="font-heading text-2xl mb-2">Wrong account</h1>
              <p className="text-sm" style={{ color: BRAND.inkSoft }}>
                This invite was sent to <strong>{invite.email}</strong>, but you're logged in as {user?.email}. Log out and log back in with the invited email to accept.
              </p>
            </>
          )}

          {status === "accepted" && invite && (
            <>
              <CheckCircle2 size={40} style={{ color: BRAND.green }} className="mx-auto mb-4" />
              <h1 className="font-heading text-2xl mb-2">You're in</h1>
              <p className="text-sm mb-6" style={{ color: BRAND.inkSoft }}>You've joined {invite.teamName}.</p>
              <button onClick={() => navigate("/dashboard")} className="w-full rounded-full py-3 font-semibold text-sm" style={{ background: BRAND.ink, color: BRAND.bg }}>Go to dashboard</button>
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