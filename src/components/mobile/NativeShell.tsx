"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

/**
 * NativeShell handles all Capacitor-specific native behaviors.
 * Only runs inside a native Capacitor app — does nothing in web browsers.
 */
export function NativeShell() {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  const isNative = typeof window !== "undefined" && !!(window as any).Capacitor;

  // Initialize native plugins
  useEffect(() => {
    if (!isNative) return;

    async function init() {
      try {
        const { StatusBar } = await import("@capacitor/status-bar");
        const { Keyboard } = await import("@capacitor/keyboard");
        const { App } = await import("@capacitor/app");
        const { Network } = await import("@capacitor/network");
        const { SplashScreen } = await import("@capacitor/splash-screen");

        // Hide splash after load
        await SplashScreen.hide();

        // Status bar — overlay for immersive feel
        await StatusBar.setOverlaysWebView({ overlay: true });
        const isDark = document.documentElement.classList.contains("dark");
        const { Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });

        // Keyboard handling
        Keyboard.addListener("keyboardWillShow", () => {
          document.body.classList.add("keyboard-open");
        });
        Keyboard.addListener("keyboardWillHide", () => {
          document.body.classList.remove("keyboard-open");
        });

        // Android hardware back button
        App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack) router.back();
          else App.exitApp();
        });

        // Resume from background — refresh data
        App.addListener("appStateChange", ({ isActive }) => {
          if (isActive) router.refresh();
        });

        // Deep links
        App.addListener("appUrlOpen", ({ url }) => {
          try {
            const path = new URL(url).pathname;
            if (path) router.push(path);
          } catch {}
        });

        // Network monitoring
        Network.addListener("networkStatusChange", ({ connected }) => {
          if (connected) {
            showToast("Back online", "success");
            router.refresh();
          } else {
            showToast("You're offline", "info");
          }
        });
      } catch {}
    }

    init();
  }, [isNative, router, showToast]);

  // Theme change → update status bar style
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

  // Remember last page
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname && !["/login", "/signup", "/forgot-password", "/reset-password"].includes(pathname)) {
      sessionStorage.setItem("meraehsaas-last-page", pathname);
    }
  }, [pathname]);

  return null;
}
