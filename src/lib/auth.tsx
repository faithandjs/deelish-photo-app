/**
 * Auth context — mock implementation simulating Azure AD B2C.
 *
 * Production swap-out:
 *   - Replace login() with MSAL `loginRedirect` / `acquireTokenSilent`.
 *   - User profile + role come from B2C ID token claims
 *     (`extension_role` custom claim recommended).
 *   - Persist tokens via msal-browser cache, not localStorage.
 *
 * RBAC is enforced at THREE layers:
 *   1. Route guards (this file's <RequireRole>)
 *   2. UI conditionals (hiding actions)
 *   3. API handlers (server-side ownership + role checks)
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import { DEMO_USERS, store } from "./mock-data";
import type { User, UserRole } from "./types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loginAs: (role: UserRole) => void;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Hydrate from storage on mount (mirrors MSAL silent token flow).
  useEffect(() => {
    setUser(store.getUser());
  }, []);

  const loginAs = useCallback((role: UserRole) => {
    const u = DEMO_USERS[role];
    store.setUser(u);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    store.setUser(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (role: UserRole) => user?.role === role,
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      loginAs,
      logout,
      hasRole,
    }),
    [user, loginAs, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/**
 * Route guard — redirects unauthenticated users to /login and
 * users with the wrong role to /unauthorized.
 *
 * Note: TanStack Router's `beforeLoad` is the SSR-safe way to gate
 * routes. We use a client-side guard here because auth state lives in
 * localStorage in this demo. With Azure B2C you'd move the check to
 * `beforeLoad` reading from router context.
 */
export function RequireRole({
  role,
  children,
}: {
  role: UserRole;
  children: ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Wait one tick for hydration.
    const t = setTimeout(() => setChecked(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!checked) return;
    if (!isAuthenticated) {
      navigate({ to: "/login" });
    } else if (user && user.role !== role) {
      navigate({ to: "/unauthorized" });
    }
  }, [checked, isAuthenticated, user, role, navigate]);

  if (!checked || !isAuthenticated || user?.role !== role) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  return <>{children}</>;
}
