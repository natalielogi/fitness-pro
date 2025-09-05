// src/__tests__/safeInput.test.tsx
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SafeInput from '@/components/inputs/safeInput';

test('после blur ввод обезвреживается (теги исчезают / экранируются)', () => {
  render(<SafeInput aria-label="inp" />);
  const input = screen.getByLabelText('inp') as HTMLInputElement;

  fireEvent.change(input, { target: { value: '<script>alert(1)</script>' } });
  expect(input.value).toBe('<script>alert(1)</script>'); // пока «сырое»

  fireEvent.blur(input);

  // универсальная проверка: угловых скобок нет
  expect(input.value).not.toMatch(/[<>]/);
  // полезный текст сохранился
  expect(input.value).toContain('alert(1)');
});
