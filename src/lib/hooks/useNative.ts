/**
 * Native mobile hooks for Capacitor.
 * Safely no-op in web browsers.
 */

export function useIsNative(): boolean {
  return typeof window !== "undefined" && !!(window as any).Capacitor;
}

/** Trigger native haptic feedback */
export async function hapticTap() {
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {}
}

/** Trigger stronger haptic for important actions */
export async function hapticSuccess() {
  try {
    const { Haptics, NotificationType } = await import("@capacitor/haptics");
    await Haptics.notification({ type: NotificationType.Success });
  } catch {}
}

/** Native share dialog */
export async function nativeShare(opts: { title: string; text?: string; url?: string }) {
  try {
    const { Share } = await import("@capacitor/share");
    await Share.share(opts);
  } catch {
    // Fallback to Web Share API
    if (navigator.share) {
      await navigator.share(opts);
    }
  }
}
