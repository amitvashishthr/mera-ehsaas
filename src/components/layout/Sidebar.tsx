"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export function Sidebar() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    supabase.from("categories").select("id, name, slug").order("name").then(({ data }) => {
      setCategories(data || []);
    });
  }, [supabase]);

  const mainLinks = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/search", label: "Search", icon: SearchIcon },
    { href: "/posts/create", label: "Create", icon: PlusIcon },
    { href: "/collections", label: "Collections", icon: BookmarkIcon },
    { href: "/notifications", label: "Notifications", icon: BellIcon },
    { href: "/profile", label: "Profile", icon: UserIcon },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 h-screen sticky top-0 border-r border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark p-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 px-4 py-3 mb-4">
        <span className="font-display text-xl font-bold text-neutral-900 dark:text-white">
          MeraEhsaas
        </span>
      </Link>

      {/* Main nav */}
      <nav className="flex-1 space-y-1" aria-label="Main navigation">
        {mainLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={isActive ? "nav-link-active" : "nav-link"}
              aria-current={isActive ? "page" : undefined}
            >
              <link.icon active={isActive} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="border-t border-surface-border dark:border-surface-dark-border pt-4 mt-4">
          <p className="px-4 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
            Categories
          </p>
          <div className="space-y-0.5 max-h-[200px] overflow-y-auto">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`block px-4 py-1.5 text-sm rounded-lg transition-colors ${
                  pathname === `/category/${cat.slug}`
                    ? "text-neutral-900 dark:text-white font-medium bg-neutral-100 dark:bg-neutral-800"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

// Icon components
function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}
function SearchIcon({ active }: { active?: boolean }) {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}
function PlusIcon({ active }: { active?: boolean }) {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
function BookmarkIcon({ active }: { active?: boolean }) {
  return (
    <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
    </svg>
  );
}
function BellIcon({ active }: { active?: boolean }) {
  return (
    <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  );
}
function UserIcon({ active }: { active?: boolean }) {
  return (
    <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}
