'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Mode = 'login' | 'register';

type Ctx = {
  isOpen: boolean;
  mode: Mode;
  open: (m?: Mode) => void;
  close: () => void;
  switchMode: (m: Mode) => void;
};

const AuthModalCtx = createContext<Ctx | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('login');

  const open = useCallback((m: Mode = 'login') => {
    setMode(m);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const switchMode = useCallback((m: Mode) => setMode(m), []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  return (
    <AuthModalCtx.Provider value={{ isOpen, mode, open, close, switchMode }}>
      {children}
    </AuthModalCtx.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalCtx);
  if (!ctx) throw new Error('useAuthModal must be used within <AuthModalProvider>');
  return ctx;
}
