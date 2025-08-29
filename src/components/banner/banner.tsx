'use client';
import Image from 'next/image';
import styles from './banner.module.css';
import { useAuth } from '@/context/auth';
import { useAuthModal } from '@/context/auth-modal';

type Props = {
  onAdd?: () => void | Promise<void>;
  disabled?: boolean;
};

export default function Banner({ onAdd, disabled }: Props) {
  const { isAuthed } = useAuth();
  const { open } = useAuthModal();

  const label = isAuthed ? 'Добавить курс' : 'Войдите, чтобы добавить курс';

  const handleClick = () => {
    if (!isAuthed) {
      open('login');
      return;
    }
    onAdd?.();
  };

  return (
    <section className={styles.wrap}>
      <div className={styles.banner}>
        <div className={styles.colLeft}>
          <h3 className={styles.title}>Начните путь к новому телу</h3>
          <ul className={styles.list}>
            <li>проработка всех групп мышц</li>
            <li>тренировка суставов</li>
            <li>улучшение циркуляции крови</li>
            <li>упражнения заряжают бодростью</li>
            <li>помогают противостоять стрессам</li>
          </ul>
          <button className={`btn ${styles.cta}`} onClick={handleClick} disabled={disabled}>
            {label}
          </button>
        </div>

        <div className={styles.media}>
          <div className={styles.loopWrap}>
            <img src="/banner/loop.svg" alt="" aria-hidden="true" className={styles.loop} />
          </div>
          <div className={styles.arcWrap}>
            <img src="/banner/arc.svg" alt="" aria-hidden="true" className={styles.arc} />
          </div>
        </div>
      </div>
      <div className={styles.athleteWrap}>
        <Image
          src="/banner/athlete.png"
          alt=""
          className={styles.athlete}
          width={604}
          height={604}
          priority
        />
      </div>
    </section>
  );
}
