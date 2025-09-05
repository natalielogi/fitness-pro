import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// !!! проверь путь ниже: у тебя может быть 'coursesgrid' или 'Coursesgrid'
import Coursesgrid from '@/components/courseCard/coursesGrid';
import type { UiCourse } from '@/sharedTypes/types';

// ---- Моки контекстов ----
jest.mock('@/context/auth', () => {
  const state = { isReady: true, isAuthed: true, token: 't' };
  return {
    useAuth: () => state,
    __authState: state, // чтобы менять состояние внутри теста
  };
});
jest.mock('@/context/auth-modal', () => ({
  useAuthModal: () => ({ open: jest.fn() }),
}));

// ---- Моки API ----
const courses: (UiCourse & { _id: string })[] = [
  {
    _id: 'a',
    slug: 'a',
    image: '/i.jpg',
    title: 'A',
    days: 1,
    dailyMinutes: '5 мин',
    difficulty: 'Лёгкий',
  },
  {
    _id: 'b',
    slug: 'b',
    image: '/i.jpg',
    title: 'B',
    days: 1,
    dailyMinutes: '5 мин',
    difficulty: 'Лёгкий',
  },
];

jest.mock('@/app/services/courses/coursesApi', () => ({
  listCourses: jest.fn(async () => courses),
}));

jest.mock('@/app/services/user/userApi', () => ({
  getCurrentUser: jest.fn(async () => ({ email: 'u@e.ru', selectedCourses: ['a'] })),
  addCourseToMe: jest.fn(async () => ({})),
}));

describe('Coursesgrid — плюсы и логаут', () => {
  test('после логаута плюсы возвращаются', async () => {
    const { __authState } = jest.requireMock('@/context/auth');

    const { rerender } = render(<Coursesgrid />);

    // ждём загрузки
    await screen.findByText('A');

    // изначально пользователь уже добавил курс A => плюс только у B
    expect(screen.queryAllByRole('button', { name: 'Добавить курс' })).toHaveLength(1);

    // добавляем B
    fireEvent.click(screen.getByRole('button', { name: 'Добавить курс' }));
    await waitFor(() =>
      expect(jest.requireMock('@/app/services/user/userApi').addCourseToMe).toHaveBeenCalled(),
    );

    // плюсов больше нет (оба курса уже выбраны)
    expect(screen.queryByRole('button', { name: 'Добавить курс' })).toBeNull();

    // имитируем логаут
    __authState.isAuthed = false;
    __authState.token = null;

    // перерисовываем
    rerender(<Coursesgrid />);

    await screen.findByText('A');
    // теперь плюсы снова видны у обоих
    expect(screen.getAllByRole('button', { name: 'Добавить курс' })).toHaveLength(2);
  });
});
