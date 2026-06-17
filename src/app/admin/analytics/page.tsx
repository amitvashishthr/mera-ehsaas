"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  totalCollections: number;
  totalPrintOrders: number;
  recentUsers: number;
  recentPosts: number;
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [topAuthors, setTopAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchAnalytics() {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [users, posts, comments, likes, collections, printOrders, recentUsers, recentPosts] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("comments").select("*", { count: "exact", head: true }),
        supabase.from("likes").select("*", { count: "exact", head: true }),
        supabase.from("collections").select("*", { count: "exact", head: true }),
        supabase.from("print_orders").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
        supabase.from("posts").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
      ]);

      setStats({
        totalUsers: users.count || 0,
        totalPosts: posts.count || 0,
        totalComments: comments.count || 0,
        totalLikes: likes.count || 0,
        totalCollections: collections.count || 0,
        totalPrintOrders: printOrders.count || 0,
        recentUsers: recentUsers.count || 0,
        recentPosts: recentPosts.count || 0,
      });

      // Top authors by post count
      const { data: allPosts } = await supabase
        .from("posts")
        .select("author_id, profiles:author_id(username, full_name)")
        .eq("is_published", true);

      const authorCounts: Record<string, { username: string; name: string; count: number }> = {};
      allPosts?.forEach((p: any) => {
        const id = p.author_id;
        if (!authorCounts[id]) {
          authorCounts[id] = {
            username: p.profiles?.username || "",
            name: p.profiles?.full_name || p.profiles?.username || "",
            count: 0,
          };
        }
        authorCounts[id].count++;
      });

      const sorted = Object.values(authorCounts).sort((a, b) => b.count - a.count).slice(0, 10);
      setTopAuthors(sorted);
      setLoading(false);
    }

    fetchAnalytics();
  }, [supabase]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 skeleton w-40 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers, icon: "👥", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" },
    { label: "Total Posts", value: stats?.totalPosts, icon: "📝", color: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" },
    { label: "Total Comments", value: stats?.totalComments, icon: "💬", color: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300" },
    { label: "Total Likes", value: stats?.totalLikes, icon: "❤️", color: "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300" },
    { label: "Collections", value: stats?.totalCollections, icon: "📚", color: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300" },
    { label: "Print Orders", value: stats?.totalPrintOrders, icon: "🖨️", color: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300" },
    { label: "New Users (7d)", value: stats?.recentUsers, icon: "📈", color: "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300" },
    { label: "New Posts (7d)", value: stats?.recentPosts, icon: "✨", color: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300" },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-primary-900 dark:text-dark-100 mb-6">Analytics</h1>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color} border border-current/10`}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-lg">{s.icon}</span>
              <p className="text-[11px] font-medium opacity-80">{s.label}</p>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Top authors */}
      <div className="card">
        <h2 className="font-semibold text-primary-800 dark:text-dark-100 mb-4">Top Authors</h2>
        <div className="space-y-2">
          {topAuthors.map((author, idx) => (
            <div key={author.username} className="flex items-center gap-3 py-2">
              <span className="text-xs text-primary-400 dark:text-dark-500 w-5 shrink-0">{idx + 1}.</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary-700 dark:text-dark-200 truncate">{author.name}</p>
                <p className="text-xs text-primary-400 dark:text-dark-500">@{author.username}</p>
              </div>
              <span className="text-xs font-semibold text-primary-600 dark:text-dark-300 bg-warm-100 dark:bg-dark-700 px-2 py-0.5 rounded-full">
                {author.count} posts
              </span>
            </div>
          ))}
          {topAuthors.length === 0 && (
            <p className="text-sm text-primary-400 dark:text-dark-500 text-center py-4">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
