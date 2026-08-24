import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { BRAND } from "../../lib/theme";
import { useAuth } from "../auth/AuthContext";
import { fetchMyTeams, switchTeam, type MyTeamEntry } from "./teamsApi";

export function TeamSwitcher() {
  const { accessToken, refreshUser } = useAuth();
  const [teams, setTeams] = useState<MyTeamEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accessToken) return;
    fetchMyTeams(accessToken).then(setTeams).catch(() => {});
  }, [accessToken]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (teams.length < 2) return null; // nothing to switch between

  const active = teams.find((t) => t.isActive);

  const handleSwitch = async (teamId: string) => {
    if (!accessToken) return;
    setSwitching(true);
    try {
      await switchTeam(accessToken, teamId);
      await refreshUser();
      window.location.href = "/dashboard"; // full reload — every fetched list on the page is scoped to the old team
    } catch {
      setSwitching(false);
    }
  };

  return (
    <div className="relative mb-3" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} disabled={switching} className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold" style={{ border: `1px solid ${BRAND.line}`, color: BRAND.inkSoft }}>
        <span className="truncate">{switching ? "Switching…" : active?.teamName}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-1 rounded-xl py-1.5 z-20" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}`, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
          {teams.map((t) => (
            <button key={t.teamId} onClick={() => { setOpen(false); if (!t.isActive) handleSwitch(t.teamId); }} className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-left hover:bg-black/[0.03]" style={{ color: BRAND.ink }}>
              <span className="truncate">{t.teamName}</span>
              {t.isActive && <Check size={13} style={{ color: BRAND.green }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}