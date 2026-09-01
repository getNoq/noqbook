export interface AuthUser {
  id: string;
  email: string;
  phone: string;
  businessName: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  role: "owner" | "admin" | "staff" | null;
  teamName: string | null;
  teamPlan: "free" | "business";
}

export interface AuthTokens {
  access: string;
  refresh?: string;
}