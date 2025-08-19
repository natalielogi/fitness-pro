import Image from 'next/image';
import styles from './banner.module.css';

export default function Banner() {
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
          <button className={`btn ${styles.cta}`}>Войдите, чтобы добавить курс</button>
        </div>

        <div className={styles.media}>
          <img src="/banner/loop.svg" alt="" aria-hidden="true" className={styles.loop} />

          <Image
            src="/banner/athlete.png"
            alt=""
            className={styles.athlete}
            width={460}
            height={420}
            priority
          />

          <img src="/banner/arc.svg" alt="" aria-hidden="true" className={styles.arc} />
        </div>
      </div>
    </section>
  );
}
