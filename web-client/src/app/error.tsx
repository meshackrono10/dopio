"use client";

'use client';

import React, { useEffect } from 'react';
import ButtonPrimary from '@/shared/ButtonPrimary';
import ButtonSecondary from '@/shared/ButtonSecondary';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
            <h2 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Something went wrong!
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md">
                We apologize for the inconvenience. An unexpected error has occurred.
                Our team has been notified.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <ButtonPrimary onClick={() => reset()}>
                    Try again
                </ButtonPrimary>
                <ButtonSecondary href="/">
                    Go back home
                </ButtonSecondary>
            </div>
        </div>
    );
}
