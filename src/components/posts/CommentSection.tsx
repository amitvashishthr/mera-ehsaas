"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { createNotification } from "@/lib/notifications";
import { formatDistanceToNow } from "@/lib/utils";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface CommentSectionProps {
  postId: string;
  postAuthorId?: string;
  currentUserId?: string;
  /** Optional pre-fetched comments (for server-rendered pages). If omitted, fetches on mount. */
  initialComments?: Comment[];
}

export function CommentSection({ postId, postAuthorId, currentUserId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(!initialComments);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => createClient(), []);

  // Fetch comments if not pre-loaded
  useEffect(() => {
    if (initialComments) return;

    let cancelled = false;

    async function fetchComments() {
      const { data, error: fetchErr } = await supabase
        .from("comments")
        .select(`*, profiles:user_id(id, username, full_name, avatar_url)`)
        .eq("post_id", postId)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (fetchErr) {
        setError(true);
      } else {
        setComments(data || []);
      }
      setLoading(false);
    }

    fetchComments();
    return () => { cancelled = true; };
  }, [postId, supabase, initialComments]);

  // Sort by newest first (in case initialComments came sorted differently)
  const sortedComments = useMemo(() => {
    return [...comments].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [comments]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments", filter: `post_id=eq.${postId}` },
        async (payload) => {
          const exists = comments.some((c) => c.id === payload.new.id);
          if (exists) return;

          const { data } = await supabase
            .from("comments")
            .select(`*, profiles:user_id(id, username, full_name, avatar_url)`)
            .eq("id", payload.new.id)
            .single();

          if (data) {
            setComments((prev) => {
              if (prev.some((c) => c.id === data.id)) return prev;
              return [data, ...prev];
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "comments", filter: `post_id=eq.${postId}` },
        (payload) => {
          setComments((prev) => prev.filter((c) => c.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [postId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;
    setSubmitting(true);

    const { data, error: insertErr } = await supabase
      .from("comments")
      .insert({
        user_id: currentUserId,
        post_id: postId,
        content: newComment.trim(),
      })
      .select(`*, profiles:user_id(id, username, full_name, avatar_url)`)
      .single();

    if (!insertErr && data) {
      setComments((prev) => [data, ...prev]);
      setNewComment("");
      inputRef.current?.focus();

      // Notify post author
      if (postAuthorId && postAuthorId !== currentUserId) {
        createNotification(supabase, {
          userId: postAuthorId,
          actorId: currentUserId!,
          postId,
          type: "comment",
        });
      }
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    await supabase.from("comments").delete().eq("id", commentId);
  };

  const commentCount = sortedComments.length;

  return (
    <section className="card" aria-label="Comments">
      {/* Header with count */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-lg font-semibold text-primary-800">
          Comments
          <span className="text-primary-400 font-body text-sm font-normal ml-2">
            ({commentCount})
          </span>
        </h3>
      </div>

      {/* Comment input at top (newest first, so write at the top) */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="mb-6 pb-6 border-b border-warm-100">
          <div className="flex gap-3 items-start">
            <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-primary-200 to-warm-300 flex items-center justify-center text-xs font-serif font-semibold text-primary-700 ring-1 ring-warm-100 mt-0.5">
              {"Y"}
            </div>
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="input-field flex-1 text-sm"
                placeholder="Write a comment..."
                maxLength={500}
                aria-label="Write a comment"
              />
              <button
                type="submit"
                className="btn-primary shrink-0 self-end sm:self-auto"
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Posting
                  </span>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-primary-300 mt-2 ml-12">
            {newComment.length}/500
          </p>
        </form>
      ) : (
        <div className="mb-6 pb-6 border-b border-warm-100 text-center">
          <p className="text-sm text-primary-400">
            <Link href="/login" className="text-accent-600 hover:text-accent-700 font-medium transition-colors">
              Sign in
            </Link>
            {" "}to leave a comment
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-4 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-warm-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-warm-200 rounded w-32" />
                <div className="h-3 bg-warm-100 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <p className="text-sm text-rose-400 text-center py-4">
          Failed to load comments.
        </p>
      )}

      {/* Empty state */}
      {!loading && !error && commentCount === 0 && (
        <div className="text-center py-8">
          <svg className="w-10 h-10 mx-auto text-primary-200 mb-3" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
          </svg>
          <p className="text-sm text-primary-400 italic">
            No comments yet. Be the first to respond.
          </p>
        </div>
      )}

      {/* Comment list — sorted newest first */}
      {!loading && !error && commentCount > 0 && (
        <div className="space-y-0">
          {sortedComments.map((comment, idx) => (
            <div
              key={comment.id}
              className={`flex gap-3 group py-4 ${
                idx !== commentCount - 1 ? "border-b border-warm-100" : ""
              }`}
            >
              {/* Avatar */}
              <Link href={`/user/${comment.profiles?.username}`} className="shrink-0">
                {comment.profiles?.avatar_url ? (
                  <img
                    src={comment.profiles.avatar_url}
                    alt={comment.profiles.username}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-warm-100"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-warm-200 flex items-center justify-center text-xs font-serif font-semibold text-primary-600 ring-1 ring-warm-100">
                    {comment.profiles?.full_name?.[0] || comment.profiles?.username?.[0] || "U"}
                  </div>
                )}
              </Link>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mb-1">
                  <Link
                    href={`/user/${comment.profiles?.username}`}
                    className="font-semibold text-sm text-primary-800 hover:text-primary-500 transition-colors"
                  >
                    {comment.profiles?.full_name || comment.profiles?.username}
                  </Link>
                  <span className="text-xs text-primary-300">
                    @{comment.profiles?.username}
                  </span>
                  <span className="text-xs text-primary-300">
                    · {formatDistanceToNow(comment.created_at)}
                  </span>
                  {currentUserId === comment.user_id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-primary-300 hover:text-rose-500 transition-colors ml-auto opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Delete comment"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-primary-700 text-sm leading-relaxed break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
