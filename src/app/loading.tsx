export default function Loading() {
  return (
    <div className="max-w-feed mx-auto">
      <div className="space-y-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-dark-800 rounded-2xl border border-warm-200/60 dark:border-dark-700 overflow-hidden animate-pulse">
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-3.5 mb-7">
                <div className="w-11 h-11 rounded-full bg-warm-200 dark:bg-dark-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-warm-200 dark:bg-dark-700 rounded w-32" />
                  <div className="h-3 bg-warm-100 dark:bg-dark-600 rounded w-48" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-5 bg-warm-200 dark:bg-dark-700 rounded w-full" />
                <div className="h-5 bg-warm-200 dark:bg-dark-700 rounded w-4/5" />
                <div className="h-5 bg-warm-100 dark:bg-dark-600 rounded w-3/5" />
              </div>
            </div>
            <div className="px-8 md:px-10 py-5 border-t border-warm-100 dark:border-dark-700">
              <div className="flex gap-4">
                <div className="h-8 w-16 bg-warm-100 dark:bg-dark-600 rounded-lg" />
                <div className="h-8 w-16 bg-warm-100 dark:bg-dark-600 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
