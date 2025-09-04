'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthModal } from '@/context/auth-modal';
import Image from 'next/image';
import styles from './authModal.module.css';
import { getApiErrorMessage, registerUser } from '@/app/services/auth/authApi';
import { useAuthButtons } from '@/app/hooks/useAuthButtons';

type RegisterFieldErrors = {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  form?: string;
};

function mapRegisterError(msg: string): RegisterFieldErrors {
  if (msg.includes('Введите корректный Email')) return { email: msg };
  if (msg.includes('уже существует')) return { email: msg };
  if (msg.includes('Пароль должен содержать')) return { password: msg };
  return { form: msg };
}

export default function RegisterForm() {
  const { switchMode } = useAuthModal();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<RegisterFieldErrors>({});
  const [ok, setOk] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const mismatch =
    password.length > 0 && passwordConfirm.length > 0 && password !== passwordConfirm;

  const block = email.trim() === '' || password.trim() === '' || passwordConfirm.trim() === '';

  const {
    disabledPrimary,
    disabledSecondary,
    inactive,
    ariaBusy,
    ariaDisabledPrimary,
    ariaDisabledSecondary,
  } = useAuthButtons(isSubmitting, block);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk(null);
    setError({});

    if (mismatch) {
      setError({ passwordConfirm: 'Пароли не совпадают' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { message } = await registerUser({ email, password });
      setOk(message || 'Регистрация прошла успешно!');
      switchMode('login');
    } catch (e) {
      const msg = getApiErrorMessage(e);
      setError(mapRegisterError(msg));
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
        id="reg-email"
        name="email"
        ref={inputRef}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
        disabled={isSubmitting}
        className={`${styles.authForm__input} ${error.email ? styles.inputError : ''}`}
        placeholder="Эл. почта"
        aria-invalid={!!error.email}
      />

      <input
        id="reg-pass"
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        required
        disabled={isSubmitting}
        className={`${styles.authForm__input} ${error.password ? styles.inputError : ''}`}
        placeholder="Пароль"
        aria-invalid={!!error.password}
      />

      <input
        id="reg-pass2"
        name="passwordConfirm"
        type="password"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        autoComplete="new-password"
        required
        disabled={isSubmitting}
        className={`${styles.authForm__input} ${error.passwordConfirm ? styles.inputError : ''}`}
        placeholder="Повторите пароль"
        aria-invalid={!!error.passwordConfirm}
      />
      {(error.email || error.password || error.passwordConfirm || error.form) && (
        <p className={styles.errorText} role="alert" aria-live="polite">
          {error.email || error.password || error.passwordConfirm || error.form}
        </p>
      )}
      {ok && (
        <p className="authForm__success" role="status" aria-live="polite">
          {ok}
        </p>
      )}

      <button
        type="submit"
        className={`btn ${styles.button} ${styles.buttonPrimary} ${inactive ? styles.inactive : ''}`}
        disabled={disabledPrimary}
        aria-disabled={ariaDisabledPrimary}
        aria-busy={ariaBusy}
      >
        Зарегистрироваться
      </button>

      <button
        type="button"
        onClick={() => switchMode('login')}
        className={`btn ${styles.button} ${styles.buttonSecondary} ${inactive ? styles.inactive : ''}`}
        disabled={disabledSecondary}
        aria-disabled={ariaDisabledSecondary}
        aria-busy={ariaBusy}
      >
        Войти
      </button>
    </form>
  );
}
