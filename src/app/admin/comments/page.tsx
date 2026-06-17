"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);
  const { showToast } = useToast();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select(`
        *,
        profiles:user_id(username, full_name),
        posts:post_id(content)
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    setComments(data || []);
    setLoading(false);
  };

  const deleteComment = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    await supabase.from("comments").delete().eq("id", id);
    setComments((prev) => prev.filter((c) => c.id !== id));
    showToast("Comment deleted", "success");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-semibold text-primary-900">Comments</h1>
        <p className="text-sm text-primary-400">{comments.length} recent comments</p>
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
          {comments.map((comment) => (
            <div key={comment.id} className="card !p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-primary-400 mb-1">
                    <span className="font-medium text-primary-600">
                      {comment.profiles?.full_name || comment.profiles?.username}
                    </span>
                    {" · "}{formatDistanceToNow(comment.created_at)}
                  </p>
                  <p className="text-sm text-primary-800 mb-2">{comment.content}</p>
                  {comment.posts?.content && (
                    <p className="text-xs text-primary-400 bg-warm-50 rounded-lg px-3 py-2 border border-warm-100 line-clamp-1">
                      On: &ldquo;{comment.posts.content.substring(0, 80)}&rdquo;
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="text-xs text-rose-400 hover:text-rose-600 transition-colors shrink-0 py-1 px-2 rounded-lg hover:bg-rose-50"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-sm text-primary-400 text-center py-8">No comments.</p>
          )}
        </div>
      )}
    </div>
  );
}
