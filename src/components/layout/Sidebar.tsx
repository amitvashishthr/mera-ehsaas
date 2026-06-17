"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

interface SidebarCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  post_count: number;
}

export function Sidebar() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<SidebarCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      try {
        // Fetch categories — try with icon column, fallback without
        let cats: any[] | null = null;

        const { data: withIcon, error: iconErr } = await supabase
          .from("categories")
          .select("id, name, slug, icon")
          .order("name");

        if (iconErr) {
          // icon column might not exist yet — fetch without it
          const { data: withoutIcon, error: basicErr } = await supabase
            .from("categories")
            .select("id, name, slug")
            .order("name");

          if (basicErr) {
            console.error("Sidebar: Failed to fetch categories", basicErr);
            if (!cancelled) {
              setError(true);
              setLoading(false);
            }
            return;
          }
          cats = withoutIcon;
        } else {
          cats = withIcon;
        }

        if (!cats || cats.length === 0) {
          if (!cancelled) {
            setCategories([]);
            setLoading(false);
          }
          return;
        }

        // Fetch post counts per category
        const { data: posts } = await supabase
          .from("posts")
          .select("category_id")
          .eq("is_published", true)
          .not("category_id", "is", null);

        const countMap: Record<string, number> = {};
        if (posts) {
          posts.forEach((p: any) => {
            if (p.category_id) {
              countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
            }
          });
        }

        const result: SidebarCategory[] = cats.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon || null,
          post_count: countMap[cat.id] || 0,
        }));

        // Sort by post count (popular first), then alphabetically
        result.sort((a, b) => {
          if (b.post_count !== a.post_count) return b.post_count - a.post_count;
          return a.name.localeCompare(b.name);
        });

        if (!cancelled) {
          setCategories(result);
          setLoading(false);
        }
      } catch (err) {
        console.error("Sidebar: Unexpected error", err);
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return (
    <aside className="hidden lg:block w-56 shrink-0 py-6 pr-2 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <nav className="space-y-1">
        {/* Home link — always visible */}
        <Link
          href="/"
          className={pathname === "/" ? "sidebar-link-active" : "sidebar-link"}
        >
          <span className="text-base">🏠</span>
          <span>Home</span>
        </Link>

        {/* All Categories header */}
        <div className="pt-5 pb-2">
          <p className="px-4 text-xs font-semibold text-primary-400 uppercase tracking-wider">
            All Categories
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="px-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-warm-100 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <p className="px-4 text-xs text-rose-400">
            Could not load categories.
          </p>
        )}

        {/* Empty state */}
        {!loading && !error && categories.length === 0 && (
          <p className="px-4 text-xs text-primary-300 italic">
            No categories yet.
          </p>
        )}

        {/* Category list */}
        {!loading && !error && categories.map((cat) => {
          const href = `/category/${cat.slug}`;
          const isActive = pathname === href;
          return (
            <Link
              key={cat.id}
              href={href}
              className={isActive ? "sidebar-link-active" : "sidebar-link"}
            >
              {cat.icon && <span className="text-base shrink-0">{cat.icon}</span>}
              <span className="flex-1 truncate">{cat.name}</span>
              {cat.post_count > 0 && (
                <span className="text-xs text-primary-300 shrink-0">
                  {cat.post_count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-10 px-4">
        <div className="border-t border-warm-200 pt-5">
          <p className="text-xs text-primary-300 italic font-serif leading-relaxed">
            &ldquo;Words are, of course, the most powerful drug used by mankind.&rdquo;
          </p>
          <p className="text-xs text-primary-300 mt-1">— Rudyard Kipling</p>
        </div>
      </div>
    </aside>
  );
}
