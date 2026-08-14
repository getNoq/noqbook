import { LogOut, Mail, Phone } from "lucide-react";
import { BRAND, FONT_IMPORT_BLOCK } from "../../lib/theme";
import { useAuth } from "./AuthContext";
import { useEffect } from "react";

export function Dashboard() {
  const { user, logOut } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: BRAND.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", color: BRAND.ink }}>
      <style>{FONT_IMPORT_BLOCK}</style>
      <header
        className="sticky top-0 z-10"
        style={{ background: "rgba(251,248,242,0.92)", backdropFilter: "blur(6px)", borderBottom: `1px solid ${BRAND.line}` }}
      >
        <div className="max-w-xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <span className="ob-serif text-lg tracking-tight">Yousual</span>
          <button onClick={logOut} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: BRAND.inkSoft }}>
            <LogOut size={15} /> Log out
          </button>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="ob-serif text-3xl mb-1">
          Welcome back{user?.businessName ? `, ${user.businessName.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm mb-8" style={{ color: BRAND.inkSoft }}>
          This is your account home. Replace this with your real dashboard.
        </p>

        <div className="rounded-3xl p-6" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
          <div className="flex items-center gap-3 mb-4">
            <Mail size={16} style={{ color: BRAND.inkSoft }} />
            <span className="text-sm">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={16} style={{ color: BRAND.inkSoft }} />
            <span className="text-sm">{user?.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
