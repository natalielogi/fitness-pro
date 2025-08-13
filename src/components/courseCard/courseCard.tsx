import { Course } from '@/sharedTypes/types';
import Image from 'next/image';

export default function CourseCard({ image, title, days, dailyMinutes, difficulty }: Course) {
  return (
    <div className="card">
      <Image className="card__img" src={image} alt={title} width={360} height={325} />
      <div className="card__description">
        <h2 className="card__title">{title}</h2>
        <div className="card__timeDuration">
          <Image
            className="card__duration-img"
            src="/card/Calendar.svg"
            alt="calendar"
            width={18}
            height={18}
          />
          <p className="card__duration-p">{days} дней</p>
        </div>
        <div className="card__dailyDuration">
          <Image
            className="card__dailyDuration-img"
            src="/card/Time.svg"
            alt="time"
            width={18}
            height={18}
          />
          <p className="card__dailyDuration-p">{dailyMinutes}</p>
        </div>
        <div className="card__difficulty">
          <Image
            className="card__difficulty-img"
            src="/card/difficulty.svg"
            alt="difficulty"
            width={18}
            height={18}
          />
          <p className="card__difficulty-p">{difficulty}</p>
        </div>
      </div>
    </div>
  );
}
