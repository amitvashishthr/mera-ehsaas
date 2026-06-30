"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { formatDistanceToNow } from "@/lib/utils";

export default function AdminModerationPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetch() {
      const [usersRes, postsRes] = await Promise.all([
        supabase.from("profiles").select("id, username, full_name, is_verified, is_featured, is_suspended, role").order("created_at", { ascending: false }).limit(50),
        supabase.from("posts").select("id, content, created_at, is_featured, profiles:author_id(username)").eq("is_published", true).order("created_at", { ascending: false }).limit(30),
      ]);
      setUsers(usersRes.data || []);
      setPosts(postsRes.data || []);
      setLoading(false);
    }
    fetch();
  }, [supabase]);

  const toggleUserField = async (userId: string, field: string, value: boolean) => {
    await supabase.from("profiles").update({ [field]: value }).eq("id", userId);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, [field]: value } : u));
    showToast(`User ${value ? field.replace("is_", "") : "un" + field.replace("is_", "")}`, "success");
  };

  const togglePostFeatured = async (postId: string, value: boolean) => {
    await supabase.from("posts").update({ is_featured: value }).eq("id", postId);
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, is_featured: value } : p));
    showToast(value ? "Post featured" : "Post unfeatured", "success");
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>;

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">Moderation</h1>

      {/* Writers */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Writers</h2>
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="card !p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{user.full_name || user.username}</p>
                <p className="text-xs text-neutral-400">@{user.username} · {user.role}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleUserField(user.id, "is_verified", !user.is_verified)}
                  className={`text-[10px] px-2 py-1 rounded-full font-medium ${user.is_verified ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400"}`}
                >
                  {user.is_verified ? "✓ Verified" : "Verify"}
                </button>
                <button
                  onClick={() => toggleUserField(user.id, "is_featured", !user.is_featured)}
                  className={`text-[10px] px-2 py-1 rounded-full font-medium ${user.is_featured ? "bg-brand-100 dark:bg-brand-900/30 text-brand-600" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400"}`}
                >
                  {user.is_featured ? "★ Featured" : "Feature"}
                </button>
                <button
                  onClick={() => toggleUserField(user.id, "is_suspended", !user.is_suspended)}
                  className={`text-[10px] px-2 py-1 rounded-full font-medium ${user.is_suspended ? "bg-red-100 dark:bg-red-900/30 text-red-600" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400"}`}
                >
                  {user.is_suspended ? "Suspended" : "Suspend"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Posts */}
      <section>
        <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Feature Posts</h2>
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="card !p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-400 mb-0.5">{(post as any).profiles?.username} · {formatDistanceToNow(post.created_at)}</p>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-1">{post.content}</p>
              </div>
              <button
                onClick={() => togglePostFeatured(post.id, !post.is_featured)}
                className={`text-[10px] px-2 py-1 rounded-full font-medium shrink-0 ${post.is_featured ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400"}`}
              >
                {post.is_featured ? "★ Featured" : "Feature"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
