'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuthModal } from '@/context/auth-modal';
import styles from './authModal.module.css';
import LoginForm from './loginForm';
import RegisterForm from './registerForm';

export default function AuthModal() {
  const { isOpen, mode, close } = useAuthModal();

  useEffect(() => {
    if (isOpen) document.body.classList.add('modal-open');
    else document.body.classList.remove('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  if (!isOpen) return null;

  const modal = (
    <div
      data-testid="auth-backdrop"
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

  return createPortal(modal, document.body);
}
