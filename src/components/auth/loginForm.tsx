'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthModal } from '@/context/auth-modal';
import Image from 'next/image';
import styles from './authModal.module.css';
import { getApiErrorMessage, loginUser } from '@/app/services/auth/authApi';
import { useAuth } from '@/context/auth';

type LoginFieldErrors = { email?: string; password?: string; form?: string };

function mapLoginError(msg: string): LoginFieldErrors {
  if (msg.includes('Пользователь с таким email не найден')) return { email: msg };
  if (msg.includes('Неверный пароль')) return { password: msg };
  return { form: msg };
}

export default function LoginForm() {
  const { switchMode, close } = useAuthModal();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<LoginFieldErrors>({});

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { login } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});
    setIsSubmitting(true);
    try {
      const { token } = await loginUser({ email, password });
      login(token, email);
      close?.();
    } catch (e) {
      const msg = getApiErrorMessage(e);
      setError(mapLoginError(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className={styles.authForm} noValidate>
      <Image
        src="/logo.svg"
        alt="App logo"
        width={220}
        height={35}
        className={styles.authForm__logo}
        priority
      />

      <input
        id="email"
        name="email"
        type="email"
        ref={inputRef}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="username"
        placeholder="Логин"
        className={`${styles.authForm__input} ${error.email ? styles.inputError : ''}`}
        required
        disabled={isSubmitting}
        aria-invalid={!!error.email}
      />

      <input
        id="password"
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
        disabled={isSubmitting}
        className={`${styles.authForm__input} ${error.password ? styles.inputError : ''}`}
        placeholder="Пароль"
        aria-invalid={!!error.password}
      />

      {(error.email || error.password || error.form) && (
        <p className={styles.errorText} role="alert" aria-live="polite">
          {error.email || error.password || error.form}
        </p>
      )}

      <button type="submit" className={`btn ${styles.button} ${styles.buttonPrimary}`}>
        Войти
      </button>

      <button
        type="button"
        onClick={() => switchMode('register')}
        className={`btn ${styles.button} ${styles.buttonSecondary}`}
        disabled={isSubmitting}
      >
        Зарегистрироваться
      </button>
    </form>
  );
}
