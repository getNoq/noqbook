import { useEffect, useState } from "react";
import { UserPlus, X, ChevronDown } from "lucide-react";
import { BRAND } from "../../../lib/theme";
import { useAuth } from "../../auth/AuthContext";
import { fetchTeamMembers, inviteMember, removeMember } from "../teamsApi";
import type { TeamMembersResponse, TeamRole } from "../../../lib/teamTypes";

const ROLE_LABEL: Record<TeamRole, string> = { owner: "Owner", admin: "Admin", staff: "Staff" };

export function TeamSettings() {
  const { accessToken } = useAuth();
  const [data, setData] = useState<TeamMembersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("staff");
  const [inviting, setInviting] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  const load = () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    fetchTeamMembers(accessToken)
      .then(setData)
      .catch((err) => setError(err?.message || "Couldn't load your team."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [accessToken]);

  const canManage = data?.myRole === "owner" || data?.myRole === "admin";

  const handleInvite = async () => {
    if (!accessToken || !inviteEmail.trim()) return;
    setInviting(true);
    setError(null);
    setInviteSent(false);
    try {
      await inviteMember(accessToken, inviteEmail.trim(), inviteRole);
      setInviteEmail("");
      setInviteSent(true);
      load();
    } catch (err: any) {
      setError(err?.message || "Couldn't send the invite.");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (membershipId: string) => {
    if (!accessToken) return;
    setError(null);
    try {
      await removeMember(accessToken, membershipId);
      load();
    } catch (err: any) {
      setError(err?.message || "Couldn't remove this member.");
    }
  };

  if (isLoading) return <p className="text-sm" style={{ color: BRAND.inkSoft }}>Loading…</p>;
  if (!data) return <p className="text-sm" style={{ color: BRAND.red }}>{error || "Couldn't load your team."}</p>;

  return (
    <div className="flex flex-col gap-5">
      {error && <div className="rounded-xl px-4 py-3 text-sm" style={{ background: BRAND.peach, color: BRAND.red }}>{error}</div>}

      <div className="rounded-3xl p-7" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
        <h2 className="font-heading text-xl mb-4">Members</h2>
        <div className="flex flex-col gap-3">
          {data.members.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 py-2" style={{ borderBottom: `1px solid ${BRAND.line}` }}>
              <div>
                <div className="text-sm font-semibold">{m.name} {m.isYou && <span style={{ color: BRAND.inkSoft }}>(you)</span>}</div>
                <div className="text-xs" style={{ color: BRAND.inkSoft }}>{m.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: BRAND.lav, color: BRAND.lavStrong }}>
                  {ROLE_LABEL[m.role]}
                </span>
                {canManage && m.role !== "owner" && !m.isYou && (
                  <button onClick={() => handleRemove(m.id)} aria-label="Remove member" style={{ color: BRAND.inkSoft }}>
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {data.pendingInvites.length > 0 && (
          <div className="mt-5 pt-5" style={{ borderTop: `1px solid ${BRAND.line}` }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: BRAND.inkSoft }}>Pending invites</div>
            {data.pendingInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between py-1.5 text-sm">
                <span>{invite.email}</span>
                <span className="text-xs" style={{ color: BRAND.inkSoft }}>{ROLE_LABEL[invite.role]} · awaiting response</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {canManage && (
        <div className="rounded-3xl p-7" style={{ background: BRAND.card, border: `1px solid ${BRAND.line}` }}>
          <h2 className="font-heading text-xl mb-4">Invite someone</h2>
          {inviteSent && <div className="rounded-xl px-4 py-3 mb-4 text-sm" style={{ background: BRAND.mint, color: BRAND.green }}>Invite sent.</div>}
          <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Email</label>
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="teammate@example.com"
            className="w-full rounded-xl px-4 py-3 mb-4 text-base md:text-sm outline-none"
            style={{ border: `1px solid ${BRAND.line}` }}
          />
          <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: BRAND.inkSoft }}>Role</label>

            <div className="relative mb-5">
            <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                className="appearance-none w-full rounded-xl bg-[#fff] px-4 py-3 pr-10 text-base md:text-sm outline-none cursor-pointer"
                style={{ border: `1px solid ${BRAND.line}` }}
            >
                <option value="staff">Staff — records sales and expenses</option>
                <option value="admin">Admin — can also invite and remove staff</option>
            </select>

            <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                style={{ color: BRAND.inkSoft }}
            />
            </div>
          <button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()} className="flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-sm transition-opacity" style={{ background: BRAND.ink, color: BRAND.bg, opacity: inviting || !inviteEmail.trim() ? 0.5 : 1 }}>
            <UserPlus size={16} /> {inviting ? "Sending…" : "Send invite"}
          </button>
        </div>
      )}
    </div>
  );
}