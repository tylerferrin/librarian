import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getToken, setToken, clearToken, apiRequest } from '../lib/api/client';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  /** True while redirecting to WorkOS */
  isLoading: boolean;
  /** True on first load while we verify a stored token with the server */
  isVerifying: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
  handleCallback: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(() => !!getToken());
  const [error, setError] = useState<string | null>(null);

  const fetchMe = useCallback(async () => {
    try {
      const me = await apiRequest<AuthUser>('/auth/me');
      setUser(me);
      setIsAuthenticated(true);
    } catch {
      clearToken();
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (getToken()) {
      fetchMe().finally(() => setIsVerifying(false));
    }
  }, [fetchMe]);

  const login = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { url } = await apiRequest<{ url: string }>('/auth/url');
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
    }
  }, []);

  const handleCallback = useCallback(
    async (token: string) => {
      setToken(token);
      await fetchMe();
    },
    [fetchMe],
  );

  const logout = useCallback(() => {
    clearToken();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const value: AuthState = {
    isAuthenticated,
    user,
    isLoading,
    isVerifying,
    error,
    login,
    logout,
    handleCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
