"use client";

export function PostCardSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl border border-warm-200/60 dark:border-dark-700 overflow-hidden animate-pulse">
      <div className="p-8 md:p-10">
        <div className="flex items-center gap-3.5 mb-7">
          <div className="w-11 h-11 rounded-full skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-4 skeleton w-32" />
            <div className="h-3 skeleton w-48" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-5 skeleton w-full" />
          <div className="h-5 skeleton w-4/5" />
          <div className="h-5 skeleton w-3/5" />
        </div>
      </div>
      <div className="px-8 md:px-10 py-5 border-t border-warm-100 dark:border-dark-700">
        <div className="flex gap-4">
          <div className="h-8 w-16 skeleton rounded-lg" />
          <div className="h-8 w-16 skeleton rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-10">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-full skeleton" />
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="h-6 skeleton w-40 mx-auto sm:mx-0" />
          <div className="h-4 skeleton w-24 mx-auto sm:mx-0" />
          <div className="h-4 skeleton w-64 mx-auto sm:mx-0" />
          <div className="flex gap-6 justify-center sm:justify-start">
            <div className="h-4 skeleton w-20" />
            <div className="h-4 skeleton w-20" />
            <div className="h-4 skeleton w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommentSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 animate-pulse">
          <div className="w-9 h-9 rounded-full skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-3 skeleton w-32" />
            <div className="h-3 skeleton w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
          <div className="w-8 h-8 rounded-full skeleton" />
          <div className="w-10 h-10 rounded-full skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-4 skeleton w-48" />
            <div className="h-3 skeleton w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CollectionSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card !p-6 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl skeleton" />
            <div className="flex-1 space-y-2">
              <div className="h-4 skeleton w-32" />
              <div className="h-3 skeleton w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
