"use client";

import { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

/**
 * NativeShell handles all Capacitor-specific native behaviors.
 * Only active when running inside a native app (checks for Capacitor).
 * Does nothing in web browsers.
 */
export function NativeShell() {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  const isNative = typeof window !== "undefined" && !!(window as any).Capacitor;

  // Status bar + safe areas
  useEffect(() => {
    if (!isNative) return;

    async function setupNative() {
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        const { Keyboard } = await import("@capacitor/keyboard");
        const { App } = await import("@capacitor/app");

        // Status bar — transparent overlay
        await StatusBar.setOverlaysWebView({ overlay: true });
        const isDark = document.documentElement.classList.contains("dark");
        await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });

        // Keyboard — adjust viewport, don't scroll
        Keyboard.addListener("keyboardWillShow", () => {
          document.body.classList.add("keyboard-open");
        });
        Keyboard.addListener("keyboardWillHide", () => {
          document.body.classList.remove("keyboard-open");
        });

        // Android back button
        App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack) {
            router.back();
          } else {
            App.exitApp();
          }
        });

        // App state — handle resume
        App.addListener("appStateChange", ({ isActive }) => {
          if (isActive) {
            router.refresh();
          }
        });

        // Deep links
        App.addListener("appUrlOpen", ({ url }) => {
          const path = new URL(url).pathname;
          if (path) router.push(path);
        });
      } catch (e) {
        // Plugins not available — running in web
      }
    }

    setupNative();
  }, [isNative, router]);

  // Theme changes → update status bar
  useEffect(() => {
    if (!isNative) return;

    const observer = new MutationObserver(async () => {
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        const isDark = document.documentElement.classList.contains("dark");
        await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
      } catch {}
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [isNative]);

  // Network reconnect
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      showToast("Back online", "success");
      router.refresh();
    };
    const handleOffline = () => {
      showToast("You're offline", "info");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [showToast, router]);

  // Remember last page
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname && pathname !== "/login" && pathname !== "/signup") {
      sessionStorage.setItem("meraehsaas-last-page", pathname);
    }
  }, [pathname]);

  return null;
}
