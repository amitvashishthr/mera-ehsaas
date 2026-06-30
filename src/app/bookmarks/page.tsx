"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { PostCard } from "@/components/posts/PostCard";

export default function BookmarksPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetch() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: bookmarks } = await supabase
        .from("bookmarks")
        .select("post_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!bookmarks?.length) { setLoading(false); return; }

      const { data: postData } = await supabase
        .from("posts")
        .select("*, profiles:author_id(id, username, full_name, avatar_url), categories:category_id(id, name, slug), likes(count), comments(count)")
        .in("id", bookmarks.map((b) => b.post_id))
        .eq("is_published", true);

      // Maintain bookmark order
      const map = new Map((postData || []).map((p) => [p.id, p]));
      setPosts(bookmarks.map((b) => map.get(b.post_id)).filter(Boolean));
      setLoading(false);
    }
    fetch();
  }, [supabase]);

  return (
    <div className="max-w-feed mx-auto px-4 sm:px-6 pt-6">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">Saved Posts</h1>

      {loading && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 skeleton rounded-xl" />)}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No saved posts yet.</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Bookmark posts to find them here later.</p>
        </div>
      )}

      {!loading && posts.length > 0 && posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={userId} />
      ))}
    </div>
  );
}
