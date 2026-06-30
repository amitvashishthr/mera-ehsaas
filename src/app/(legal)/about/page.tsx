"use client";

export default function AboutPage() {
  return (
    <div className="max-w-[480px] mx-auto px-4 sm:px-6 py-8 text-center">
      <div className="mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-300 dark:from-brand-900 dark:to-brand-700 flex items-center justify-center mx-auto mb-4">
          <span className="font-display text-3xl font-bold text-brand-800 dark:text-brand-100">M</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">MeraEhsaas</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Poetry & Emotions</p>
      </div>

      <div className="card text-left space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
        <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
          <span>Version</span>
          <span className="font-medium text-neutral-900 dark:text-white">1.0.0</span>
        </div>
        <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
          <span>Build</span>
          <span className="font-medium text-neutral-900 dark:text-white">2026.07.01</span>
        </div>
        <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
          <span>Platform</span>
          <span className="font-medium text-neutral-900 dark:text-white">Next.js + Capacitor</span>
        </div>
        <div className="flex justify-between py-2">
          <span>Developer</span>
          <span className="font-medium text-neutral-900 dark:text-white">MeraEhsaas Team</span>
        </div>
      </div>

      <div className="mt-8 space-y-2">
        <a href="/privacy" className="block text-sm text-brand-600 dark:text-brand-400 hover:underline">Privacy Policy</a>
        <a href="/terms" className="block text-sm text-brand-600 dark:text-brand-400 hover:underline">Terms of Service</a>
        <a href="/delete-account" className="block text-sm text-red-500 hover:underline">Delete Account</a>
      </div>

      <p className="mt-8 text-xs text-neutral-400 dark:text-neutral-500">
        © 2026 MeraEhsaas. All rights reserved.
      </p>
    </div>
  );
}
