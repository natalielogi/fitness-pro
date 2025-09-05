// src/__tests__/authModal.test.tsx
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthModal from '@/components/auth/authModal';

jest.mock('@/context/auth-modal', () => {
  const close = jest.fn();
  return {
    useAuthModal: () => ({ isOpen: true, mode: 'login', close, open: jest.fn() }),
    __close: close,
  };
});

jest.mock('@/components/auth/loginForm', () => ({
  __esModule: true,
  default: () => <div data-testid="login-form">LOGIN_FORM</div>,
}));
jest.mock('@/components/auth/registerForm', () => ({
  __esModule: true,
  default: () => <div>REGISTER_FORM</div>,
}));

test('клик по подложке закрывает модалку, клик по карточке — нет', () => {
  const { __close } = jest.requireMock('@/context/auth-modal') as { __close: jest.Mock };

  render(<AuthModal />);

  // клик по карточке — НЕ закрывает
  fireEvent.click(screen.getByTestId('login-form'));
  expect(__close).not.toHaveBeenCalled();

  // клик по подложке — закрывает
  const backdrop = screen.getByTestId('auth-backdrop');
  fireEvent.mouseDown(backdrop);
  expect(__close).toHaveBeenCalled();
});
