"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function DiscoverPage() {
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [featuredWriters, setFeaturedWriters] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetch() {
      const [postsRes, featuredRes, recentRes] = await Promise.all([
        // Most liked posts (trending)
        supabase.from("posts").select("id, content, author_id, profiles:author_id(username, full_name, avatar_url, is_verified), likes(count)")
          .eq("is_published", true).eq("status", "published").order("created_at", { ascending: false }).limit(10),
        // Featured/verified writers
        supabase.from("profiles").select("id, username, full_name, avatar_url, bio, is_verified, is_featured")
          .or("is_featured.eq.true,is_verified.eq.true").limit(8),
        // Recently joined
        supabase.from("profiles").select("id, username, full_name, avatar_url, created_at")
          .order("created_at", { ascending: false }).limit(6),
      ]);

      // Sort posts by like count
      const posts = (postsRes.data || []).sort((a: any, b: any) => (b.likes?.[0]?.count || 0) - (a.likes?.[0]?.count || 0));
      setTrendingPosts(posts.slice(0, 6));
      setFeaturedWriters(featuredRes.data || []);
      setRecentUsers(recentRes.data || []);
      setLoading(false);
    }
    fetch();
  }, [supabase]);

  if (loading) {
    return (
      <div className="max-w-feed mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {[1, 2, 3].map((i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-feed mx-auto px-4 sm:px-6 pt-6">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">Discover</h1>

      {/* Featured Writers */}
      {featuredWriters.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-3">Featured Writers</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {featuredWriters.map((writer) => (
              <Link key={writer.id} href={`/user/${writer.username}`} className="shrink-0 w-28 text-center group">
                <div className="mx-auto mb-2">
                  {writer.avatar_url ? (
                    <img src={writer.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover mx-auto ring-2 ring-brand-200 dark:ring-brand-800 group-hover:ring-brand-400 transition-all" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-200 to-brand-400 mx-auto flex items-center justify-center text-white font-semibold">
                      {writer.full_name?.[0] || writer.username[0]}
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">{writer.full_name || writer.username}</p>
                {writer.is_verified && <span className="text-[10px] text-blue-500">✓ Verified</span>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trending Posts */}
      {trendingPosts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-3">Trending</h2>
          <div className="space-y-3">
            {trendingPosts.map((post, idx) => (
              <Link key={post.id} href={`/posts/${post.id}`} className="flex items-start gap-3 py-3 border-b border-surface-border dark:border-surface-dark-border last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 -mx-2 px-2 rounded-lg transition-colors">
                <span className="text-2xl font-display font-bold text-neutral-200 dark:text-neutral-700 w-6 shrink-0">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-800 dark:text-neutral-200 line-clamp-2 leading-relaxed">{post.content}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {(post as any).profiles?.full_name || (post as any).profiles?.username} · {post.likes?.[0]?.count || 0} likes
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recently Joined */}
      {recentUsers.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-3">Recently Joined</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {recentUsers.map((u) => (
              <Link key={u.id} href={`/user/${u.username}`} className="card-interactive !p-4 text-center">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full mx-auto mb-2 object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 mx-auto mb-2 flex items-center justify-center text-xs font-semibold text-neutral-500">
                    {u.full_name?.[0] || u.username[0]}
                  </div>
                )}
                <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">{u.full_name || u.username}</p>
                <p className="text-[10px] text-neutral-400">@{u.username}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
