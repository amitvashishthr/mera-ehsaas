"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useMemo } from "react";
import { useTheme } from "@/components/ui/ThemeProvider";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchUnread(user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUnread(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => fetchUnread(user.id), 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchUnread = async (userId: string) => {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    setUnreadCount(count || 0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Don't show navbar on auth pages
  if (["/login", "/signup", "/forgot-password", "/reset-password"].includes(pathname)) {
    return null;
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border-b border-surface-border dark:border-surface-dark-border">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="font-display text-lg font-bold text-neutral-900 dark:text-white">
            MeraEhsaas
          </Link>
          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="btn-icon" aria-label="Toggle theme">
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <button onClick={handleLogout} className="btn-icon" aria-label="Sign out">
              <LogoutIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Desktop top utility (theme + logout) */}
      <div className="hidden lg:flex items-center justify-end gap-2 h-14 px-6 border-b border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark sticky top-0 z-40">
        <button onClick={toggleTheme} className="btn-icon" aria-label="Toggle theme">
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
        <button onClick={handleLogout} className="btn-ghost text-xs" aria-label="Sign out">
          Sign out
        </button>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-xl border-t border-surface-border dark:border-surface-dark-border" aria-label="Mobile navigation">
        <div className="flex items-center justify-around h-16 px-2">
          {[
            { href: "/", icon: MobileHomeIcon, label: "Home" },
            { href: "/search", icon: MobileSearchIcon, label: "Search" },
            { href: "/posts/create", icon: MobilePlusIcon, label: "Create" },
            { href: "/notifications", icon: MobileBellIcon, label: "Notifications", badge: unreadCount },
            { href: "/profile", icon: MobileUserIcon, label: "Profile" },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                  isActive ? "text-neutral-900 dark:text-white" : "text-neutral-400 dark:text-neutral-500"
                }`}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon active={isActive} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-0.5 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

// Mini icons for mobile bottom nav
function MobileHomeIcon({ active }: { active?: boolean }) {
  return <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>;
}
function MobileSearchIcon({ active }: { active?: boolean }) {
  return <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>;
}
function MobilePlusIcon({ active }: { active?: boolean }) {
  return <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
}
function MobileBellIcon({ active }: { active?: boolean }) {
  return <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>;
}
function MobileUserIcon({ active }: { active?: boolean }) {
  return <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>;
}
function SunIcon() {
  return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>;
}
function MoonIcon() {
  return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>;
}
function LogoutIcon() {
  return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" /></svg>;
}
