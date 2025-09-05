SkyFitnessPro

Приложение с курсами домашних тренировок: каталог курсов, профиль пользователя, страница курса и тренировки, модальные окна (аутентификация, выбор тренировки, ввод прогресса), тост-уведомления. Сделан акцент на адаптив (десктоп → мобильный ≤ 375px), доступность, безопасность ввода и тесты.

Стек:
Next.js (App Router), React 18, TypeScript
CSS Modules (+ немного Tailwind как утилити в глобале)
Jest + @testing-library/react (jsdom)
ESLint (строгий TS, без any)
Next/Image, next/navigation
Локальное хранение токена (localStorage) через контекст

Установка и запуск:

# 1) зависимости

npm ci

# 2) дев-сервер

npm run dev

# 3) типы и линт

npm run typecheck
npm run lint

# 4) тесты

npm test

# покрытие (опционально)

npm test -- --coverage

# 5) прод-сборка

npm run build
npm run start

Структура(сокращенно):
src/
app/
(страницы Next.js App Router)
components/
auth/ # модалка логина/регистрации и формы
banner/ # баннеры курса/общий баннер с «атлетом»
courseCard/ # карточка курса (главная + профиль)
workouts/ # модалка выбора тренировки и ввода прогресса
ui/toast/ # тост-уведомления
context/
auth.tsx # контекст аутентификации (token/email в localStorage)
auth-modal.tsx # контекст управления модалкой входа
app/services/ # api-клиенты (courses, user)
lib/
sanitize.ts # безопасная очистка пользовательского ввода
sharedTypes/ # типы
**tests**/ # Jest + RTL тесты
jest.setup.ts # конфигурация окружения тестов
jest.config.js

Основные фичи:
Аутентификация
Контекст AuthProvider: хранит token и email (localStorage), методы login/logout.
Сессия истекла → открываем модалку входа.
Безопасность: неиспользуемые данные очищаются при logout.

Модальные окна
AuthModal, WorkoutModal, ProgressModal:
— центрирование, backdrop на весь вьюпорт (100dvw/100dvh), блокировка прокрутки body.modal-open.
— мобильные размеры: ширина 343px, отступы 24px, ограничение по высоте max-height: calc(100dvh - 32px).
— закрытие по клику в подложку и ESC (по необходимости).
Toast: центр экрана, на мобиле — ужатые размеры/шрифты.

Подсказки на иконках (+/–)
Десктоп: CSS-тултипы через ::after.
Мобилка (≤ 375px): тултипы отключены (display: none; pointer-events: none), чтобы ничего не «вылазило».

Тесты:

Конфиг: jest.config.js (на базе next/jest), testEnvironment: jsdom, setupFilesAfterEnv: jest.setup.ts.
**tests**/smoke.test.tsx — дымовой тест рендера.
**tests**/safeInput.test.tsx — проверка экранирования <script> на change/paste и на blur.
**tests**/authModal.test.tsx — клики по карточке/подложке: карточка не закрывает, подложка — закрывает.
**tests**/coursesgrid.auth.test.tsx — поведение кнопки «Добавить» для гостя/авторизованного.
**tests**/courseCard.test.tsx — рендер карточки курса (главная/профиль), обработчики, прогресс.
jest.setup.ts:
Моки next/image, window.scrollTo, контекста auth-modal (шпионы на open/close), при необходимости — роутера.

Запуск:
npm test
npm test -- --coverage
