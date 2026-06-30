export default function Loading() {
  return (
    <div className="max-w-feed mx-auto px-4 sm:px-6 pt-6">
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-b border-surface-border dark:border-surface-dark-border pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full skeleton" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 skeleton w-28" />
                <div className="h-3 skeleton w-40" />
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="h-4 skeleton w-full" />
              <div className="h-4 skeleton w-5/6" />
              <div className="h-4 skeleton w-2/3" />
            </div>
            <div className="flex gap-3 mt-4">
              <div className="h-8 w-14 skeleton rounded-lg" />
              <div className="h-8 w-14 skeleton rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
