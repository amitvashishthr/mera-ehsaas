"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/ui/ThemeProvider";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchUnreadCount(user.id);
        checkAdmin(user.id);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUnreadCount(session.user.id);
        checkAdmin(session.user.id);
      } else {
        setUnreadCount(0);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    setIsAdmin(data?.role === "admin");
  };

  const fetchUnreadCount = async (userId: string) => {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    setUnreadCount(count || 0);
  };

  // Poll every 30s for new notifications
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => fetchUnreadCount(user.id), 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-dark-900/95 backdrop-blur-md shadow-nav z-50 border-b border-warm-200/50 dark:border-dark-700/50">
      <div className="layout-container h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="shrink-0 group">
          <span className="text-xl font-serif font-bold text-primary-800 group-hover:text-primary-600 transition-colors">
            MeraEhsaas
          </span>
        </Link>

        {/* Search bar - desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search poetry, thoughts..."
              className="w-full pl-10 pr-4 py-2 bg-warm-100 border border-warm-200 rounded-xl text-sm text-primary-800 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all"
            />
          </div>
        </form>

        {/* Right side actions */}
        <div className="hidden md:flex items-center gap-1 ml-auto">
          {user ? (
            <>
              {/* Notifications bell */}
              <Link href="/notifications" className="relative inline-flex items-center py-2 px-2.5 rounded-xl text-primary-500 hover:text-primary-800 hover:bg-warm-100 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/posts/create" className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-warm-100 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
                Create
              </Link>
              <Link href="/collections" className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-warm-100 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                </svg>
                Collections
              </Link>
              <Link href="/profile" className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-warm-100 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                Profile
              </Link>
              {isAdmin && (
                <Link href="/admin" className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-sm font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.212-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  Admin
                </Link>
              )}
              <div className="w-px h-5 bg-warm-300 dark:bg-dark-600 mx-1" />
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-primary-500 hover:text-primary-800 hover:bg-warm-100 dark:text-dark-400 dark:hover:text-dark-100 dark:hover:bg-dark-700 transition-all"
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? (
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                ) : (
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                )}
              </button>
              <button onClick={handleLogout} className="btn-ghost text-primary-400 hover:text-primary-600 dark:text-dark-400 dark:hover:text-dark-200">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost font-medium">Sign In</Link>
              <Link href="/signup" className="btn-primary ml-1">Join Free</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-warm-100 transition-colors ml-auto"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5 text-primary-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-warm-200/50 shadow-lg animate-fade-in">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="px-4 pt-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search poetry..."
                className="w-full pl-10 pr-4 py-2.5 bg-warm-100 border border-warm-200 rounded-xl text-sm text-primary-800 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </form>
          <div className="px-4 py-3 space-y-1">
            {user ? (
              <>
                <Link href="/notifications" onClick={() => setMenuOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-warm-100 text-primary-800 font-medium flex items-center justify-between">
                  <span>🔔 Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-rose-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link href="/posts/create" onClick={() => setMenuOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-warm-100 text-primary-800 font-medium">
                  ✍️ Create
                </Link>
                <Link href="/collections" onClick={() => setMenuOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-warm-100 text-primary-800 font-medium">
                  📚 Collections
                </Link>
                <Link href="/profile" onClick={() => setMenuOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-warm-100 text-primary-800 font-medium">
                  👤 Profile
                </Link>
                <hr className="my-2 border-warm-200" />
                <button onClick={handleLogout} className="block w-full text-left py-2.5 px-3 rounded-lg hover:bg-warm-100 text-primary-400">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-warm-100 text-primary-800 font-medium">
                  Sign In
                </Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)} className="block py-3 px-3 rounded-xl bg-primary-800 text-white font-medium text-center mt-2">
                  Join MeraEhsaas
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
