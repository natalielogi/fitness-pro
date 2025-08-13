import styles from './hero.module.css';

export default function Hero() {
  return (
    <section className={`container-1440 ${styles.title}`}>
      <div className={styles.title__block}>
        <h1 className={styles.title__text}>Начните заниматься спортом и улучшите качество жизни</h1>
        <div className={styles.title__bubble}>
          <p className={styles.title__bubble_text}>Измени своё тело за полгода!</p>
        </div>
      </div>
    </section>
  );
}
