export type TeamRole = "owner" | "admin" | "staff";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  joinedAt: string;
  isYou: boolean;
}

export interface PendingInvite {
  id: string;
  email: string;
  role: TeamRole;
  createdAt: string;
}

export interface TeamMembersResponse {
  team: { id: string; name: string; plan: "free" | "business" };
  myRole: TeamRole;
  members: TeamMember[];
  pendingInvites: PendingInvite[];
}