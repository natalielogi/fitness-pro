/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './header.module.css';
import { useAuthModal } from '@/context/auth-modal';
import { useAuth } from '@/context/auth';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { open } = useAuthModal();
  const { isAuthed, email, isReady, logout } = useAuth();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const loginName = useMemo(() => (email ? email.split('@')[0] : ''), [email]);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const goProfile = () => {
    setMenuOpen(false);
    router.push('/profile');
  };

  const doLogout = () => {
    setMenuOpen(false);
    logout();
    router.push('/');
  };

  const hideSubtitle = pathname === '/profile' || pathname.startsWith('/workouts');

  const showLogin = !mounted || !isReady || !isAuthed;

  return (
    <header
      className={`container-1440 ${styles.header} ${
        showLogin ? styles.header_guest : styles.header_authed
      }`}
    >
      <div className={styles.header__logoBlock}>
        <Link href="/" className={styles.header__logo}>
          <img src="/logo.svg" alt="SkyFitnessPro" width={220} height={35} />
        </Link>
        {!hideSubtitle && (
          <p className={styles.header__subtitle}>Онлайн-тренировки для занятий дома</p>
        )}
      </div>

      {showLogin ? (
        <button className={`${styles.header__btn} btn`} onClick={() => open('login')}>
          Войти
        </button>
      ) : (
        <div ref={menuRef} className={styles.header__authControls}>
          <button
            id="profile-trigger"
            type="button"
            className={styles.header__profileBtn}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Image
              src="/Profile.svg"
              alt=""
              width={50}
              height={50}
              className={styles.header__profileIcon}
            />
            <span className={styles.header__name}>{loginName}</span>
            <svg
              className={styles.header__caretIcon}
              viewBox="0 0 12.7695 12.7695"
              aria-hidden="true"
            >
              <path
                d="M9.02936 0L9.02936 9.02936L0 9.02936L0 7.02936L8.02936 7.02936L8.02936 8.02936L7.02936 8.02936L7.02936 0L9.02936 0Z"
                fill="currentColor"
                fillRule="nonzero"
                transform="matrix(0.707107,0.707107,-0.707107,0.707107,6.38477,0)"
              />
            </svg>
          </button>

          {menuOpen && (
            <div role="menu" aria-labelledby="profile-trigger" className={styles.profileMenu}>
              <div className={styles.profileMenu__top}>
                <div className={styles.profileMenu__title}>{loginName}</div>
                <div className={styles.profileMenu__email}>{email}</div>
              </div>
              <div className={styles.profileMenu__bottom}>
                <button
                  role="menuitem"
                  type="button"
                  onClick={goProfile}
                  className={`btn ${styles.menuBtn} ${styles.menuBtnPrimary}`}
                >
                  Мой профиль
                </button>
                <button
                  role="menuitem"
                  type="button"
                  onClick={doLogout}
                  className={`btn ${styles.menuBtn} ${styles.menuBtnSecondary}`}
                >
                  Выйти
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
