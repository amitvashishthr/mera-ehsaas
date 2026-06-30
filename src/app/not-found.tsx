import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-[480px] mx-auto text-center py-20 px-6">
      <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-5">
        <svg className="w-7 h-7 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </div>
      <h1 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
        Page not found
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="btn-primary">
        Go home
      </Link>
    </div>
  );
}
