"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-muted dark:bg-surface-dark">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-semibold text-neutral-900 dark:text-white mb-2">
          You&apos;re offline
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6 leading-relaxed">
          It looks like you&apos;ve lost your internet connection.
          Your saved content will be available when you reconnect.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
