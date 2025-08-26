'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './header.module.css';
import { useAuthModal } from '@/context/auth-modal';
import { useAuth } from '@/context/auth';
import { useEffect, useMemo, useState } from 'react';

export default function Header() {
  const { open } = useAuthModal();
  const { isAuthed, email, logout } = useAuth();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const loginName = useMemo(() => (email ? email.split('@')[0] : ''), [email]);

  return (
    <header className={`container-1440 ${styles.header}`}>
      <div className={styles.header__logoBlock}>
        <Link href="/" className={styles.header__logo}>
          <Image src="/logo.svg" alt="SkyFitnessPro" width={220} height={35} priority />
        </Link>
        <p className={styles.header__subtitle}>Онлайн-тренировки для занятий дома</p>
      </div>

      {!mounted || !isAuthed ? (
        <button className={`${styles.header__btn} btn`} onClick={() => open('login')}>
          Войти
        </button>
      ) : (
        <div className={styles.header__authControls}>
          <button
            type="button"
            className={styles.header__profileBtn}
            aria-haspopup="menu"
            aria-expanded={false}
          >
            <Image
              src="/Profile.svg"
              alt=""
              width={50}
              height={50}
              className={styles.header__profileIcon}
            />
            <span className={styles.header__name}>{loginName}</span>
            <span className={styles.header__caret} aria-hidden="true" />
          </button>

          <button type="button" onClick={logout} className={`btn ${styles.header__logout}`}>
            Выйти
          </button>
        </div>
      )}
    </header>
  );
}
