import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-feed mx-auto text-center py-20">
      <span className="text-6xl block mb-4">📜</span>
      <h1 className="font-serif text-3xl font-semibold text-primary-900 dark:text-dark-100 mb-3">
        Page Not Found
      </h1>
      <p className="text-primary-500 dark:text-dark-400 mb-8 max-w-md mx-auto">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
