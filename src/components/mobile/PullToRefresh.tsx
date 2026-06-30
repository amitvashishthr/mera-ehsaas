"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * Native-feeling pull-to-refresh for mobile.
 * Wraps children and adds pull-down gesture to trigger page refresh.
 */
export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pullDistance = useRef(0);
  const router = useRouter();

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (window.scrollY > 0 || refreshing) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0 && diff < 120) {
      pullDistance.current = diff;
      setPulling(diff > 50);
    }
  }, [refreshing]);

  const onTouchEnd = useCallback(() => {
    if (pulling && !refreshing) {
      setRefreshing(true);
      setPulling(false);
      router.refresh();
      setTimeout(() => setRefreshing(false), 1000);
    } else {
      setPulling(false);
    }
    pullDistance.current = 0;
    startY.current = 0;
  }, [pulling, refreshing, router]);

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {/* Refresh indicator */}
      {(pulling || refreshing) && (
        <div className="flex justify-center py-3">
          <svg
            className={`w-5 h-5 text-neutral-400 ${refreshing ? "animate-spin" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              fill="currentColor"
              opacity={refreshing ? 1 : 0.5}
            />
          </svg>
        </div>
      )}
      {children}
    </div>
  );
}
