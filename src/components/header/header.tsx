'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './header.module.css';
import { useAuthModal } from '@/context/auth-modal';

export default function Header() {
  const { open } = useAuthModal();
  return (
    <header className={`container-1440 ${styles.header}`}>
      <div className={styles.header__logoBlock}>
        <Link href="/" className={styles.header__logo}>
          <Image src="/logo.svg" alt="SkyFitnessPro" width={220} height={35} />
        </Link>
        <p className={styles.header__subtitle}>Онлайн-тренировки для занятий дома</p>
      </div>
      <button className={`${styles.header__btn} btn`} onClick={() => open('login')}>
        Войти
      </button>
    </header>
  );
}
