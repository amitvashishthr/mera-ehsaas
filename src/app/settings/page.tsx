"use client";

import { useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { nativeShare } from "@/lib/hooks/useNative";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const supabase = useMemo(() => createClient(), []);
  const { showToast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleShareApp = () => {
    nativeShare({
      title: "MeraEhsaas — Poetry & Emotions",
      text: "Join me on MeraEhsaas, a quiet space for poetry and stories.",
      url: "https://meraehsaas.com",
    });
  };

  const handleRateApp = () => {
    const isAndroid = /android/i.test(navigator.userAgent);
    const url = isAndroid
      ? "https://play.google.com/store/apps/details?id=com.meraehsaas.app"
      : "https://apps.apple.com/app/meraehsaas/id000000000";
    window.open(url, "_blank");
  };

  return (
    <div className="max-w-[480px] mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">Settings</h1>

      {/* Appearance */}
      <Section title="Appearance">
        <Row label="Dark Mode" action={
          <button onClick={toggleTheme} className={`w-11 h-6 rounded-full transition-colors relative ${theme === "dark" ? "bg-brand-500" : "bg-neutral-300 dark:bg-neutral-600"}`} aria-label="Toggle dark mode">
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${theme === "dark" ? "translate-x-[22px]" : "translate-x-0.5"}`} />
          </button>
        } />
      </Section>

      {/* Account */}
      <Section title="Account">
        <NavRow href="/profile" label="Edit Profile" />
        <NavRow href="/bookmarks" label="Saved Posts" />
        <NavRow href="/posts/drafts" label="Drafts" />
        <NavRow href="/print-orders" label="Print Orders" />
      </Section>

      {/* App */}
      <Section title="App">
        <ButtonRow label="Share App" onClick={handleShareApp} />
        <ButtonRow label="Rate App" onClick={handleRateApp} />
        <NavRow href="/about" label="About" detail="v1.0.0" />
        <NavRow href="/licenses" label="Open Source Licenses" />
      </Section>

      {/* Legal */}
      <Section title="Legal">
        <NavRow href="/privacy" label="Privacy Policy" />
        <NavRow href="/terms" label="Terms of Service" />
        <NavRow href="/delete-account" label="Delete Account" danger />
      </Section>

      {/* Logout */}
      <div className="mt-8">
        <button onClick={handleLogout} className="w-full py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors">
          Sign Out
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2 px-1">{title}</p>
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({ label, action }: { label: string; action: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-sm text-neutral-800 dark:text-neutral-200">{label}</span>
      {action}
    </div>
  );
}

function NavRow({ href, label, detail, danger }: { href: string; label: string; detail?: string; danger?: boolean }) {
  return (
    <Link href={href} className="flex items-center justify-between px-4 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
      <span className={`text-sm ${danger ? "text-red-600 dark:text-red-400" : "text-neutral-800 dark:text-neutral-200"}`}>{label}</span>
      <div className="flex items-center gap-2">
        {detail && <span className="text-xs text-neutral-400">{detail}</span>}
        <svg className="w-4 h-4 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
      </div>
    </Link>
  );
}

function ButtonRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-between px-4 py-3.5 w-full text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
      <span className="text-sm text-neutral-800 dark:text-neutral-200">{label}</span>
      <svg className="w-4 h-4 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
    </button>
  );
}
