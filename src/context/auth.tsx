'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type AuthCtx = {
  token: string | null;
  email: string | null;
  isAuthed: boolean;
  isReady: boolean;
  login: (token: string, email?: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx>({
  token: null,
  email: null,
  isAuthed: false,
  isReady: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem('token');
      const e = localStorage.getItem('email');
      setToken(t);
      setEmail(e);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = (t: string, e?: string) => {
    setToken(t);
    if (e) setEmail(e);
    localStorage.setItem('token', t);
    if (e) localStorage.setItem('email', e);
  };

  const logout = () => {
    setToken(null);
    setEmail(null);
    localStorage.removeItem('token');
    localStorage.removeItem('email');
  };

  return (
    <AuthContext.Provider value={{ token, email, isAuthed: !!token, isReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
