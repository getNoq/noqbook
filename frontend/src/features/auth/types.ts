export interface AuthUser {
  id: string;
  email: string;
  phone: string;
  businessName: string;
  firstName: string;
  lastName: string;
}

export interface AuthTokens {
  access: string;
  refresh?: string;
}