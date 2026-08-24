import type { TeamMembersResponse, TeamRole } from "../../lib/teamTypes";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/teams`;

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
}

export async function fetchTeamMembers(accessToken: string): Promise<TeamMembersResponse> {
  const res = await fetch(`${API_BASE}/members/`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error("Couldn't load your team.");
  return res.json();
}

export async function inviteMember(accessToken: string, email: string, role: TeamRole): Promise<void> {
  const res = await fetch(`${API_BASE}/invites/`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ email, role }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Couldn't send the invite.");
  }
}

export async function removeMember(accessToken: string, membershipId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/members/${membershipId}/`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Couldn't remove this member.");
  }
}

export interface InvitePreview {
  teamName: string;
  email: string;
  role: TeamRole;
}

export async function fetchInvitePreview(token: string): Promise<InvitePreview> {
  const res = await fetch(`${API_BASE}/invites/${token}/`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "This invite is invalid or has expired.");
  }
  return res.json();
}

export async function acceptInvite(accessToken: string, token: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/invites/${token}/accept/`, {
    method: "POST",
    headers: authHeaders(accessToken),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Couldn't accept this invite.");
  }
  return res.json();
}

export interface MyTeamEntry {
  teamId: string;
  teamName: string;
  role: "owner" | "admin" | "staff";
  isActive: boolean;
}

export async function fetchMyTeams(accessToken: string): Promise<MyTeamEntry[]> {
  const res = await fetch(`${API_BASE}/my-teams/`, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new Error("Couldn't load your teams.");
  return res.json();
}

export async function switchTeam(accessToken: string, teamId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/switch/`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ teamId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Couldn't switch teams.");
  }
}