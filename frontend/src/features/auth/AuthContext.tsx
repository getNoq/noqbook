import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { AuthTokens, AuthUser } from "./types";
import * as api from "./authApi";
import { migrateGuestInvoicesToAccount } from "../../lib/guestMigration";

const TOKENS_STORAGE_KEY = "yousual_auth_tokens";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean; // true while restoring a saved session on mount
  error: string | null;
  signUp: (payload: { email: string; password: string; phone: string; businessName?: string }) => Promise<void>;
  logIn: (payload: { email: string; password: string }) => Promise<void>;
  logOut: () => void;
  clearError: () => void;
  accessToken: string | null;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(() => loadTokens());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On first mount, if a token was saved from a previous session, restore
  // the user from it. If that fails (expired/invalid), clear it quietly.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!tokens?.access) {
        setIsLoading(false);
        return;
      }
      try {
        const restoredUser = await api.fetchCurrentUser(tokens.access);
        if (!cancelled) setUser(restoredUser);
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
      const { user: newUser, tokens: newTokens } = await api.signup(payload);
      setUser(newUser);
      setTokens(newTokens);
      saveTokens(newTokens);
      void migrateGuestInvoicesToAccount(newTokens.access);
    } catch (err) {
      setError(err instanceof api.ApiError ? err.message : "Couldn't create your account. Try again.");
      throw err;
    }
  };

  const logIn: AuthContextValue["logIn"] = async (payload) => {
    setError(null);
    try {
      const { user: loggedInUser, tokens: newTokens } = await api.login(payload);
      setUser(loggedInUser);
      setTokens(newTokens);
      saveTokens(newTokens);
      void migrateGuestInvoicesToAccount(newTokens.access);
    } catch (err) {
      setError(
        err instanceof api.ApiError ? err.message : "Couldn't log you in. Check your details and try again."
      );
      throw err;
    }
  };

  const logOut = () => {
    setUser(null);
    setTokens(null);
    saveTokens(null);
  };

  const clearError = () => setError(null);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, isLoading, error, signUp, logIn, logOut, clearError, accessToken: tokens?.access ?? null }),
    [user, isLoading, error, tokens]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
