"use client";

import { useEffect, useState } from "react";

export function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Register service worker
    navigator.serviceWorker.register("/sw.js").then((reg) => {
      setRegistration(reg);

      // Check for updates every 60 seconds
      setInterval(() => reg.update(), 60000);

      // Listen for new service worker
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
          }
        });
      });
    }).catch((err) => {
      console.warn("SW registration failed:", err);
    });

    // Handle controller change (after skipWaiting)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage("SKIP_WAITING");
    }
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-[200] animate-slide-up">
      <div className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl shadow-modal p-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Update available</p>
          <p className="text-xs opacity-70">A new version of MeraEhsaas is ready.</p>
        </div>
        <button
          onClick={handleUpdate}
          className="shrink-0 text-xs font-semibold bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
