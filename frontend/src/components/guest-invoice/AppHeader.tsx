import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BRAND } from "../../lib/theme";
import { MARKETING_SITE_URL } from "./constants";

/**
 * Minimal, app-style header: logo (left, links out) and exit / account
 * actions (right), always on one line. Kept deliberately quiet -- its
 * job is orientation ("where am I, how do I leave"), not selling.
 */
export function AppHeader({ onCreateAccount }: { onCreateAccount: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
        <a href={MARKETING_SITE_URL} className="shrink-0" aria-label="Yousual">
          <img src="/images/yousual-logomark.svg" alt="NOQ logomark" height={56} width={160} />
        </a>

        <div className="flex items-center gap-4">
          
          <a href={MARKETING_SITE_URL}
            className="text-sm font-medium whitespace-nowrap"
            style={{ color: BRAND.inkSoft }}
          >
            <span className="hidden sm:inline">Exit guest mode</span>
            <span className="sm:hidden">Exit</span>
          </a>

          {/* Desktop: full button, hidden below sm */}
          <button
            onClick={onCreateAccount}
            className="hidden sm:inline-flex font-heading rounded-full bg-ink px-6 py-3 text-[14px] tracking-[10%] text-white transition-colors hover:bg-neutral-800"
          >
            Create free account
          </button>

          {/* Mobile: hamburger toggle, hidden at sm and up */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="sm:hidden p-2 -mr-2 rounded-lg"
            style={{ color: BRAND.ink }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel — only the account CTA lives here */}
      {menuOpen && (
        <div className="sm:hidden border-t px-6 py-4 border-black/5 bg-white">
          <button
            onClick={() => {
              setMenuOpen(false);
              onCreateAccount();
            }}
            className="w-full font-heading rounded-full bg-ink px-6 py-3 text-[14px] tracking-[10%] text-white transition-colors hover:bg-neutral-800"
          >
            Create free account
          </button>
        </div>
      )}
    </header>
  );
}