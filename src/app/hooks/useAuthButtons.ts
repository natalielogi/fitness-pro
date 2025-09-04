'use client';

export function useAuthButtons(isSubmitting: boolean, block: boolean) {
  const disabledPrimary = isSubmitting || block;
  const disabledSecondary = isSubmitting;
  const inactive = isSubmitting;

  return {
    disabledPrimary,
    disabledSecondary,
    inactive,
    ariaBusy: isSubmitting || undefined,
    ariaDisabledPrimary: disabledPrimary || undefined,
    ariaDisabledSecondary: disabledSecondary || undefined,
  };
}
