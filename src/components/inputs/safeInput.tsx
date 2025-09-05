'use client';

import { forwardRef, InputHTMLAttributes, FocusEventHandler, ClipboardEventHandler } from 'react';
import { stripTagsPreserveText } from '@/lib/sanitize';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  sanitizeOnBlur?: boolean;
};

const SafeInput = forwardRef<HTMLInputElement, Props>(
  ({ sanitizeOnBlur = true, onChange, onPaste, onBlur, ...rest }, ref) => {
    const clean = (el: HTMLInputElement) => {
      const cleaned = stripTagsPreserveText(el.value);
      if (cleaned !== el.value) {
        const start = el.selectionStart ?? cleaned.length;
        el.value = cleaned;
        try {
          el.setSelectionRange(start, start);
        } catch {}
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };

    const handlePaste: ClipboardEventHandler<HTMLInputElement> = (e) => {
      onPaste?.(e);
      if (e.defaultPrevented) return;

      e.preventDefault();
      const pasted = e.clipboardData.getData('text');
      const text = stripTagsPreserveText(pasted);

      const el = e.currentTarget;
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      el.value = el.value.slice(0, start) + text + el.value.slice(end);
      const pos = start + text.length;
      try {
        el.setSelectionRange(pos, pos);
      } catch {}
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };

    const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
      if (sanitizeOnBlur) clean(e.currentTarget);
      onBlur?.(e);
    };

    return (
      <input
        ref={ref}
        {...rest}
        onPaste={handlePaste}
        onBlur={handleBlur}
        onChange={(e) => onChange?.(e)}
      />
    );
  },
);

SafeInput.displayName = 'SafeInput';
export default SafeInput;
