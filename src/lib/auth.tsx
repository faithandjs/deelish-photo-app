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
import { apiFetch, authStore } from "./api";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = "deelish_user";
const TOKEN_KEY = "deelish_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      if (raw && token) {
        authStore.setToken(token); // ← rehydrate token into memory
        return JSON.parse(raw);
      }
      return null;
    } catch {
      return null;
    }
  });

  const persist = (u: User | null, token?: string) => {
    if (u && token) {
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      localStorage.setItem(TOKEN_KEY, token);
      authStore.setToken(token);
    } else {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      authStore.setToken(null);
    }
    setUser(u);
  };
  const login = useCallback(async (username: string, password: string) => {
    const data = await apiFetch<{ accessToken: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    persist(data.user, data.accessToken); // ← pass token
  }, []);

  const register = useCallback(async (username: string, password: string, role: UserRole) => {
    const data = await apiFetch<{ accessToken: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, role }),
    });
    persist(data.user, data.accessToken); // ← pass token
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" }, authStore.getToken());
    } finally {
      persist(null); // clears both user and token
    }
  }, []);

  const hasRole = useCallback((role: UserRole) => user?.role === role, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, login, register, logout, hasRole }),
    [user, login, register, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// Route guard — unchanged pattern, just cleaner
export function RequireRole({ role, children }: { role: UserRole; children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setChecked(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!checked) return;
    if (!isAuthenticated) navigate({ to: "/login" });
    else if (user?.role !== role) navigate({ to: "/unauthorized" });
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
