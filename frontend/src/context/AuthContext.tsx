import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi } from "../api/auth.api";
import { onUnauthorized, tokenStorage } from "../api/client";
import type { AuthUser, Credentials, Permission } from "../types";

export interface AuthContextValue {
  user: AuthUser | null;
  // True while the stored token is being validated on first load.
  loading: boolean;
  login: (credentials: Credentials) => Promise<void>;
  register: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(() => tokenStorage.get() !== null);

  const logout = useCallback((): void => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  // Any 401 from the API (expired or invalid token) ends the session.
  useEffect(() => {
    onUnauthorized(logout);
    return () => onUnauthorized(null);
  }, [logout]);

  // Restore the session from a stored token.
  useEffect(() => {
    if (!tokenStorage.get()) return;

    let cancelled = false;
    authApi
      .me()
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser);
      })
      .catch(() => {
        if (!cancelled) logout();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [logout]);

  const login = useCallback(async (credentials: Credentials): Promise<void> => {
    const { token, user: loggedUser } = await authApi.login(credentials);
    tokenStorage.set(token);
    setUser(loggedUser);
  }, []);

  const register = useCallback(
    async (credentials: Credentials): Promise<void> => {
      await authApi.register(credentials);
      await login(credentials);
    },
    [login],
  );

  const hasPermission = useCallback(
    (permission: Permission): boolean => user?.permissions.includes(permission) ?? false,
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout, hasPermission }),
    [user, loading, login, register, logout, hasPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
