import { render, screen, fireEvent } from '@testing-library/react';
import CourseCard from '@/components/courseCard/courseCard';
import type { UiCourse } from '@/sharedTypes/types';

const baseCourse: UiCourse & { _id: string } = {
  _id: 'c1',
  slug: 'yoga',
  image: '/courses/yoga.jpg',
  title: 'Йога',
  days: 20,
  dailyMinutes: '10–30 мин/день',
  difficulty: 'Лёгкий',
};

describe('CourseCard', () => {
  test('если не авторизован — при клике по "+" зовём onRequireAuth, а onAdd не зовём', () => {
    const onAdd = jest.fn();
    const onRequireAuth = jest.fn();

    render(
      <CourseCard
        {...baseCourse}
        onAdd={onAdd}
        isSelected={false}
        isAuthed={false}
        onRequireAuth={onRequireAuth}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Добавить курс' }));
    expect(onRequireAuth).toHaveBeenCalledTimes(1);
    expect(onAdd).not.toHaveBeenCalled();
  });

  test('если авторизован — при клике по "+" зовём onAdd(id)', () => {
    const onAdd = jest.fn();

    render(
      <CourseCard
        {...baseCourse}
        onAdd={onAdd}
        isSelected={false}
        isAuthed={true}
        onRequireAuth={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Добавить курс' }));
    expect(onAdd).toHaveBeenCalledWith('c1');
  });

  test('в профиле показывается кнопка удаления, а "+" нет', () => {
    const onRemove = jest.fn();

    render(
      <CourseCard
        {...baseCourse}
        variant="profile"
        onRemove={onRemove}
        progressPercent={0}
        isAuthed={true}
        isSelected={true}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Добавить курс' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Удалить курс' })).toBeInTheDocument();
  });

  test('текст CTA корректен по прогрессу', () => {
    const { rerender } = render(
      <CourseCard
        {...baseCourse}
        variant="profile"
        progressPercent={0}
        isAuthed={true}
        isSelected
      />,
    );
    expect(screen.getByRole('button', { name: 'Начать тренировки' })).toBeInTheDocument();

    rerender(
      <CourseCard {...baseCourse} variant="profile" progressPercent={30} isAuthed isSelected />,
    );
    expect(screen.getByRole('button', { name: 'Продолжить' })).toBeInTheDocument();

    rerender(
      <CourseCard {...baseCourse} variant="profile" progressPercent={100} isAuthed isSelected />,
    );
    expect(screen.getByRole('button', { name: 'Начать заново' })).toBeInTheDocument();
  });
});
