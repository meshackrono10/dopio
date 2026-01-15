import React from 'react';
import ButtonPrimary from '@/shared/ButtonPrimary';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h2 className="text-6xl font-bold text-primary-6000 mb-4">404</h2>
      <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
        Page Not Found
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </p>
      <ButtonPrimary href="/">
        Return Home
      </ButtonPrimary>
    </div>
  );
}
