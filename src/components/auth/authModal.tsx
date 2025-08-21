'use client';

import { useAuthModal } from '@/context/auth-modal';
import styles from './authModal.module.css';
import LoginForm from './loginForm';
import RegisterForm from './registerForm';

export default function AuthModal() {
  const { isOpen, mode, close } = useAuthModal();

  if (!isOpen) return null;

  return (
    <div
      className={styles.authBackdrop}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className={styles.authCard} onClick={(e) => e.stopPropagation()}>
        {mode === 'login' ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}
