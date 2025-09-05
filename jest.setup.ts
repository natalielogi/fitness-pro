import '@testing-library/jest-dom';
import * as React from 'react';

type FCWithDisplayName<P = unknown> = React.FC<P> & { displayName?: string };

jest.mock('next/image', () => {
  const Img: FCWithDisplayName<React.ImgHTMLAttributes<HTMLImageElement>> = (props) =>
    React.createElement('img', props);
  Img.displayName = 'NextImageMock';
  return { __esModule: true, default: Img };
});

jest.mock('@/components/auth/loginForm', () => {
  const LoginFormMock: FCWithDisplayName = () => React.createElement('div', null, 'LOGIN_FORM');
  LoginFormMock.displayName = 'LoginFormMock';
  return { __esModule: true, default: LoginFormMock };
});

jest.mock('@/components/auth/registerForm', () => {
  const RegisterFormMock: FCWithDisplayName = () =>
    React.createElement('div', null, 'REGISTER_FORM');
  RegisterFormMock.displayName = 'RegisterFormMock';
  return { __esModule: true, default: RegisterFormMock };
});
