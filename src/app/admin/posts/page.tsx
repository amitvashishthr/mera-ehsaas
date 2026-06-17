"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*, profiles:author_id(username, full_name)")
      .order("created_at", { ascending: false })
      .limit(50);

    setPosts(data || []);
    setLoading(false);
  };

  const togglePublish = async (id: string, isPublished: boolean) => {
    await supabase.from("posts").update({ is_published: !isPublished }).eq("id", id);
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, is_published: !isPublished } : p));
    showToast(isPublished ? "Post hidden" : "Post published", "info");
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post permanently? This cannot be undone.")) return;
    await supabase.from("posts").delete().eq("id", id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    showToast("Post deleted", "success");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-semibold text-primary-900">Posts</h1>
        <p className="text-sm text-primary-400">{posts.length} posts</p>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-warm-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && (
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="card !p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-primary-400 mb-1">
                    <span className="font-medium text-primary-600">{post.profiles?.full_name || post.profiles?.username}</span>
                    {" · "}{formatDistanceToNow(post.created_at)}
                  </p>
                  <p className="text-sm text-primary-800 line-clamp-2">{post.content}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                  post.is_published ? "bg-green-100 text-green-700" : "bg-warm-200 text-primary-500"
                }`}>
                  {post.is_published ? "Live" : "Hidden"}
                </span>
              </div>
              <div className="flex gap-3 mt-3 pt-3 border-t border-warm-100">
                <button
                  onClick={() => togglePublish(post.id, post.is_published)}
                  className="text-xs text-primary-500 hover:text-primary-700 transition-colors"
                >
                  {post.is_published ? "🙈 Hide" : "👁️ Publish"}
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="text-xs text-rose-400 hover:text-rose-600 transition-colors"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <p className="text-sm text-primary-400 text-center py-8">No posts.</p>
          )}
        </div>
      )}
    </div>
  );
}
