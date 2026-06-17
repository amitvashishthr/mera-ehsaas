"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { PostCard } from "@/components/posts/PostCard";
import Link from "next/link";

interface SearchResults {
  posts: any[];
  users: any[];
  categories: any[];
  tags: any[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults>({ posts: [], users: [], categories: [], tags: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  const debouncedQuery = useDebounce(query, 300);
  const supabase = useMemo(() => createClient(), []);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id);
    });
  }, [supabase]);

  // Run search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults({ posts: [], users: [], categories: [], tags: [] });
      setSearched(false);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      const q = debouncedQuery.trim();

      // Update URL
      router.replace(`/search?q=${encodeURIComponent(q)}`, { scroll: false });

      // Search in parallel
      const [postsRes, usersRes, categoriesRes, tagsRes] = await Promise.all([
        // Search posts by content
        supabase
          .from("posts")
          .select(`
            *,
            profiles:author_id(id, username, full_name, avatar_url),
            categories:category_id(id, name, slug),
            likes(count),
            comments(count)
          `)
          .eq("is_published", true)
          .ilike("content", `%${q}%`)
          .order("created_at", { ascending: false })
          .limit(20),

        // Search users by username or full_name
        supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url, bio")
          .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
          .limit(10),

        // Search categories by name
        supabase
          .from("categories")
          .select("id, name, slug, icon")
          .ilike("name", `%${q}%`)
          .limit(10),

        // Search tags by name
        supabase
          .from("tags")
          .select("id, name, slug")
          .ilike("name", `%${q}%`)
          .limit(10),
      ]);

      setResults({
        posts: postsRes.data || [],
        users: usersRes.data || [],
        categories: categoriesRes.data || [],
        tags: tagsRes.data || [],
      });
      setSearched(true);
      setLoading(false);
    };

    performSearch();
  }, [debouncedQuery, supabase, router]);

  const totalResults = results.posts.length + results.users.length + results.categories.length + results.tags.length;
  const hasResults = totalResults > 0;

  return (
    <div className="max-w-feed mx-auto">
      {/* Search input */}
      <div className="mb-8">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, people, categories, tags..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-warm-200 rounded-2xl text-base text-primary-800 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 shadow-card transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-300 hover:text-primary-600 transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searched && !loading && (
          <p className="text-sm text-primary-400 mt-3 ml-1">
            {totalResults} {totalResults === 1 ? "result" : "results"} for &ldquo;{debouncedQuery}&rdquo;
          </p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="flex items-center gap-3 text-primary-400">
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-serif italic">Searching...</span>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && searched && (
        <>
          {/* Empty state */}
          {!hasResults && (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-primary-200 mb-4" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <p className="font-serif text-xl text-primary-400 italic mb-2">
                No results found
              </p>
              <p className="text-sm text-primary-300 max-w-sm mx-auto">
                Try different words, check the spelling, or search for something broader.
              </p>
            </div>
          )}

          {/* Categories */}
          {results.categories.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-primary-500 uppercase tracking-wider mb-3 px-1">
                Categories
              </h2>
              <div className="flex flex-wrap gap-2">
                {results.categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-warm-200 rounded-xl hover:border-primary-300 hover:shadow-card transition-all"
                  >
                    <span className="text-lg">{cat.icon || "📝"}</span>
                    <span className="text-sm font-medium text-primary-700">
                      <HighlightText text={cat.name} query={debouncedQuery} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {results.tags.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-primary-500 uppercase tracking-wider mb-3 px-1">
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {results.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warm-100 border border-warm-200 rounded-lg text-sm text-primary-600"
                  >
                    <span className="text-primary-400">#</span>
                    <HighlightText text={tag.name} query={debouncedQuery} />
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Users */}
          {results.users.length > 0 && (
            <section className="mb-10">
              <h2 className="text-sm font-semibold text-primary-500 uppercase tracking-wider mb-3 px-1">
                People
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/user/${user.username}`}
                    className="flex items-center gap-3 p-4 bg-white border border-warm-200 rounded-xl hover:border-primary-300 hover:shadow-card transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-200 to-warm-300 flex items-center justify-center text-primary-700 font-serif font-semibold text-sm shrink-0">
                      {user.full_name?.[0] || user.username?.[0] || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-primary-800 text-sm truncate">
                        <HighlightText text={user.full_name || user.username} query={debouncedQuery} />
                      </p>
                      <p className="text-xs text-primary-400 truncate">@{user.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Posts */}
          {results.posts.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-primary-500 uppercase tracking-wider mb-4 px-1">
                Posts
              </h2>
              <div className="space-y-8">
                {results.posts.map((post) => (
                  <PostCard key={post.id} post={post} currentUserId={currentUserId} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Initial state (no query) */}
      {!searched && !loading && (
        <div className="text-center py-20">
          <svg className="w-14 h-14 mx-auto text-primary-200 mb-4" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <p className="font-serif text-lg text-primary-400 italic">
            What are you looking for?
          </p>
          <p className="text-sm text-primary-300 mt-1">
            Search for poetry, people, categories, or tags
          </p>
        </div>
      )}
    </div>
  );
}

// Highlight matching text
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-accent-100 text-accent-800 rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
