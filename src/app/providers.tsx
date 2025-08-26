'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/auth';
import { AuthModalProvider } from '@/context/auth-modal';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthModalProvider>{children}</AuthModalProvider>
    </AuthProvider>
  );
}
