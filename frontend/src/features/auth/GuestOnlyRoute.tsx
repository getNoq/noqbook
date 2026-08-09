import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

/**
 * Inverse of ProtectedRoute — for pages that only make sense while
 * logged OUT (signup, login, forgot/reset password). A signed-in user
 * who lands on one of these (old bookmark, browser back button) gets
 * sent straight to their dashboard instead of seeing the form.
 */
export default function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}