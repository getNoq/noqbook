import { AuthTokens, AuthUser } from "./types";

/**
 * Point this at your Django API's URL prefix for auth endpoints.
 * Expected contract (adjust paths/payloads to match your actual DRF views):
 *
 *   POST /api/auth/signup/           { email, password, phone, businessName? } -> { user, tokens }
 *   POST /api/auth/login/            { email, password }                  -> { user, tokens }
 *   POST /api/auth/password/forgot/  { email }                            -> { message }
 *   POST /api/auth/password/reset/   { token, password }                  -> { message }
 *   GET  /api/auth/me/               (Authorization: Bearer <access>)     -> user
 *
 * Adjust the response shape below (or this file) to match whatever DRF
 * actually returns — e.g. if your serializer returns { access, refresh }
 * flat at the top level instead of nested under "tokens".
 */
const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;

export class ApiError extends Error {
  fieldErrors?: Record<string, string>;
  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    // empty body — fine for some responses
  }

  if (!res.ok) {
    throw new ApiError(
      data.detail || data.message || "Something went wrong. Please try again.",
      data.errors
    );
  }
  return data as T;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export function signup(payload: {
  email: string;
  password: string;
  phone: string;
  businessName?: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>("/signup/", { body: JSON.stringify(payload) });
}

export function login(payload: { email: string; password: string }): Promise<AuthResponse> {
  return request<AuthResponse>("/login/", { body: JSON.stringify(payload) });
}

export function requestPasswordReset(payload: { email: string }): Promise<{ message: string }> {
  return request("/password/forgot/", { body: JSON.stringify(payload) });
}

export function resetPassword(payload: { token: string; password: string }): Promise<{ message: string }> {
  return request("/password/reset/", { body: JSON.stringify(payload) });
}

export function fetchCurrentUser(accessToken: string): Promise<AuthUser> {
  return request<AuthUser>("/me/", {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
