import { createContext, useContext, useEffect, useMemo, useState, useRef, ReactNode } from "react";
import { AuthTokens, AuthUser } from "./types";
import * as api from "./authApi";
import { migrateGuestInvoicesToAccount } from "../../lib/guestMigration";

const TOKENS_STORAGE_KEY = "yousual_auth_tokens";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signUp: (payload: { email: string; password: string; phone: string; businessName: string }) => Promise<void>;
  logIn: (payload: { email: string; password: string }) => Promise<void>;
  logOut: () => void;
  clearError: () => void;
  accessToken: string | null;
  updateProfile: (payload: { businessName: string; firstName: string; lastName: string; phone: string }) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadTokens(): AuthTokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthTokens) : null;
  } catch {
    return null;
  }
}

function saveTokens(tokens: AuthTokens | null) {
  try {
    if (tokens) localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
    else localStorage.removeItem(TOKENS_STORAGE_KEY);
  } catch {
    // storage unavailable — session just won't persist across reloads
  }
}

function decodeJwtExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

const PENDING_INVITE_KEY = "yousual_pending_invite_token";

function consumePendingInviteToken(): string | undefined {
  try {
    const token = sessionStorage.getItem(PENDING_INVITE_KEY);
    if (token) sessionStorage.removeItem(PENDING_INVITE_KEY);
    return token || undefined;
  } catch {
    return undefined;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(() => loadTokens());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const logOut = () => {
    setUser(null);
    setTokens(null);
    saveTokens(null);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
  };

  const scheduleRefresh = (currentTokens: AuthTokens) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    const expiresAt = decodeJwtExpiry(currentTokens.access);
    if (!expiresAt || !currentTokens.refresh) return;

    const msUntilRefresh = expiresAt - Date.now() - 60_000; // refresh 1 min early
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const { access } = await api.refreshAccessToken(currentTokens.refresh!);
        const nextTokens = { ...currentTokens, access };
        setTokens(nextTokens);
        saveTokens(nextTokens);
        scheduleRefresh(nextTokens);
      } catch {
        logOut(); // refresh token itself expired/invalid — real logout
      }
    }, Math.max(msUntilRefresh, 0));
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!tokens?.access) {
        setIsLoading(false);
        return;
      }
      try {
        const restoredUser = await api.fetchCurrentUser(tokens.access);
        if (!cancelled) {
          setUser(restoredUser);
          scheduleRefresh(tokens);
        }
      } catch {
        if (!cancelled) {
          setTokens(null);
          saveTokens(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp: AuthContextValue["signUp"] = async (payload) => {
    setError(null);
    try {
      const { user: newUser, tokens: newTokens } = await api.signup({ ...payload, inviteToken: consumePendingInviteToken() });
      setUser(newUser);
      setTokens(newTokens);
      saveTokens(newTokens);
      scheduleRefresh(newTokens);
      void migrateGuestInvoicesToAccount(newTokens.access);
    } catch (err) {
      setError(err instanceof api.ApiError ? err.message : "Couldn't create your account. Try again.");
      throw err;
    }
  };

  const logIn: AuthContextValue["logIn"] = async (payload) => {
    setError(null);
    try {
      const { user: loggedInUser, tokens: newTokens } = await api.login({ ...payload, inviteToken: consumePendingInviteToken() });
      setUser(loggedInUser);
      setTokens(newTokens);
      saveTokens(newTokens);
      scheduleRefresh(newTokens);
      void migrateGuestInvoicesToAccount(newTokens.access);
    } catch (err) {
      setError(
        err instanceof api.ApiError ? err.message : "Couldn't log you in. Check your details and try again."
      );
      throw err;
    }
  };

  const updateProfile: AuthContextValue["updateProfile"] = async (payload) => {
    if (!tokens?.access) throw new Error("Not signed in.");
    const updatedUser = await api.updateProfile(tokens.access, payload);
    setUser(updatedUser);
  };

  const resendVerificationEmail = async () => {
    if (!tokens?.access) throw new Error("Not signed in.");
    await api.resendVerificationEmail(tokens.access);
  };

  const refreshUser = async () => {
    if (!tokens?.access) return;
    const refreshed = await api.fetchCurrentUser(tokens.access);
    setUser(refreshed);
  };

  const clearError = () => setError(null);

  const value = useMemo(
    () => ({
      user, isAuthenticated: !!user, isLoading, error, signUp, logIn, logOut, clearError, resendVerificationEmail, refreshUser,
      accessToken: tokens?.access ?? null, updateProfile,
    }),
    [user, isLoading, error, tokens]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}