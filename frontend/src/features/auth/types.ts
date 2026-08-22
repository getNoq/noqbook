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
}

export interface AuthTokens {
  access: string;
  refresh?: string;
}