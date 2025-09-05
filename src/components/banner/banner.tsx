/* eslint-disable @next/next/no-img-element */

'use client';

import Image from 'next/image';
import styles from './banner.module.css';
import { useAuth } from '@/context/auth';
import { useAuthModal } from '@/context/auth-modal';
import { useEffect, useState } from 'react';
import Toast from '@/components/ui/toast/toast';
import { useCourseSelection } from '@/app/hooks/useCourseSelection';

export default function Banner({ courseId }: { courseId: string }) {
  const { isAuthed, token, isReady } = useAuth();
  const { open } = useAuthModal();

  const { added, pending, add, remove } = useCourseSelection({
    courseId,
    token,
    isReady,
    isAuthed,
    openAuthModal: open,
  });

  const [toastOpen, setToastOpen] = useState(false);
  const [toastText, setToastText] = useState('');

  const disabled = pending || !isReady;
  const btnText = !isAuthed
    ? 'Войдите, чтобы продолжить'
    : pending
      ? 'Подождите…'
      : added
        ? 'Удалить курс'
        : 'Добавить курс';

  const onClick = async () => {
    if (!isReady) return;

    if (!isAuthed || !token) {
      open('login');
      return;
    }

    try {
      if (added) {
        await remove();
        setToastText('Курс успешно удалён!');
      } else {
        await add();
        setToastText('Курс успешно добавлен!');
      }
      setToastOpen(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось выполнить действие');
    }
  };

  useEffect(() => {
    if (!toastOpen) return;
    const t = setTimeout(() => setToastOpen(false), 1800);
    return () => clearTimeout(t);
  }, [toastOpen]);

  return (
    <section className={styles.wrap}>
      <div className={styles.loopGlobal} aria-hidden="true">
        <img src="/banner/loop.svg" alt="" className={styles.loop} />
      </div>

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
          <button
            className={`btn ${styles.cta}`}
            onClick={onClick}
            disabled={disabled}
            aria-busy={pending}
          >
            {btnText}
          </button>
        </div>
      </div>

      <div className={styles.arcGlobal} aria-hidden="true">
        <img src="/banner/arc.svg" alt="" className={styles.arcImg} />
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

      <Toast open={toastOpen} onClose={() => setToastOpen(false)} text={toastText} />
    </section>
  );
}
