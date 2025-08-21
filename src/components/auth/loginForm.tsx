'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthModal } from '@/context/auth-modal';

export default function LoginForm() {
  const { switchMode, close } = useAuthModal();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      // TODO: await authApi.login({ login, password });
      console.log('login', { login, password });
      close();
    } finally {
      setPending(false);
    }
  };

  const disabled = pending || !login || !password;

  return (
    <form onSubmit={onSubmit} className="authForm" noValidate>
      <h2>Войти</h2>

      <label htmlFor="login">Логин</label>
      <input
        id="login"
        name="login"
        ref={inputRef}
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        autoComplete="username"
        required
        disabled={pending}
      />

      <label htmlFor="password">Пароль</label>
      <input
        id="password"
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
        disabled={pending}
      />

      <button type="submit" disabled={disabled}>
        {pending ? 'Входим…' : 'Войти'}
      </button>

      <button type="button" onClick={() => switchMode('register')} disabled={pending}>
        Зарегистрироваться
      </button>
    </form>
  );
}
