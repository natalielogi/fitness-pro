'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthModal } from '@/context/auth-modal';

export default function RegisterForm() {
  const { switchMode, close } = useAuthModal();
  const [email, setEmail] = useState('');
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !p1 || !p2) return;
    if (p1 !== p2) {
      alert('Пароли не совпадают');
      return;
    }
    setPending(true);
    try {
      // TODO: await authApi.register({ email, password: p1 });
      console.log('register', { email, password: p1 });
      close();
    } catch (err) {
      console.error(err);
      // TODO: показать ошибку тостом
    } finally {
      setPending(false);
    }
  };

  const disabled = pending || !email || !p1 || !p2;

  return (
    <form onSubmit={onSubmit} className="authForm" noValidate>
      <h2>Регистрация</h2>

      <label htmlFor="reg-email">Эл. почта</label>
      <input
        id="reg-email"
        name="email"
        ref={inputRef}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
        disabled={pending}
      />

      <label htmlFor="reg-pass">Пароль</label>
      <input
        id="reg-pass"
        name="password"
        type="password"
        value={p1}
        onChange={(e) => setP1(e.target.value)}
        autoComplete="new-password"
        required
        disabled={pending}
      />

      <label htmlFor="reg-pass2">Повторите пароль</label>
      <input
        id="reg-pass2"
        name="passwordConfirm"
        type="password"
        value={p2}
        onChange={(e) => setP2(e.target.value)}
        autoComplete="new-password"
        required
        disabled={pending}
      />

      <button type="submit" disabled={disabled}>
        {pending ? 'Регистрируем…' : 'Зарегистрироваться'}
      </button>

      <button type="button" onClick={() => switchMode('login')} disabled={pending}>
        Войти
      </button>
    </form>
  );
}
