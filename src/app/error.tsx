"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="max-w-feed mx-auto text-center py-20">
      <span className="text-5xl block mb-4">⚠️</span>
      <h1 className="font-serif text-2xl font-semibold text-primary-900 dark:text-dark-100 mb-2">
        Something went wrong
      </h1>
      <p className="text-primary-500 dark:text-dark-400 text-sm mb-6 max-w-md mx-auto">
        An unexpected error occurred. Please try again.
      </p>
      <button onClick={reset} className="btn-primary">
        Try Again
      </button>
    </div>
  );
}
