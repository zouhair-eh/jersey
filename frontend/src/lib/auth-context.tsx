/**
 * @file auth-context.tsx
 * @description React Context for authentication state management.
 *              Provides login/register/logout + auto-hydration from localStorage.
 */

'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  apiLogin,
  apiRegister,
  apiLogout,
  clearToken,
  type AuthResponse,
} from './api';

// ── Types ────────────────────────────────────────────────────────────────────

interface User {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, roles?: string[]) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jm_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Invalid data, ignore
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res: AuthResponse = await apiLogin(email, password);
    setUser(res.data as User);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, roles?: string[]) => {
      const res: AuthResponse = await apiRegister(name, email, password, roles);
      setUser(res.data as User);
    },
    []
  );

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    clearToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
