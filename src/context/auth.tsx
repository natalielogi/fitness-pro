'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AuthContextType = {
  token: string | null;
  email: string | null;
  isAuthed: boolean;
  login: (token: string, email: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const e = localStorage.getItem('email');
    setToken(t);
    setEmail(e);

    const onStorage = (ev: StorageEvent) => {
      if (ev.key === 'token') setToken(localStorage.getItem('token'));
      if (ev.key === 'email') setEmail(localStorage.getItem('email'));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = useCallback((token: string, email: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    setToken(token);
    setEmail(email);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setToken(null);
    setEmail(null);
  }, []);

  const value = useMemo(
    () => ({ token, email, isAuthed: !!token, login, logout }),
    [token, email, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
