'use client';
import Image from 'next/image';
import styles from './banner.module.css';
import { useAuth } from '@/context/auth';
import { useAuthModal } from '@/context/auth-modal';
import { useState } from 'react';
import { addCourseToMe } from '@/app/services/user/userApi';
import Toast from '../ui/toast';

export default function Banner({ courseId }: { courseId: string }) {
  const { isAuthed, token, isReady } = useAuth();
  const { open } = useAuthModal();

  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const onClick = async () => {
    if (!isReady) return;

    if (!isAuthed || !token) {
      open('login');
      return;
    }
    setPending(true);
    try {
      await addCourseToMe(token, courseId);
      setAdded(true);
      setToastOpen(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось добавить курс');
    } finally {
      setPending(false);
    }
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
          <button className={`btn ${styles.cta}`} onClick={onClick} disabled={pending || added}>
            {!isAuthed
              ? 'Войдите, чтобы добавить курс'
              : added
                ? 'Добавлено'
                : pending
                  ? 'Добавляем…'
                  : 'Добавить курс'}
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
      <Toast open={toastOpen} text="Курс успешно добавлен!" onClose={() => setToastOpen(false)} />
    </section>
  );
}
