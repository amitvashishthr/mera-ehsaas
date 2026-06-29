"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { createNotification } from "@/lib/notifications";

interface LikeButtonProps {
  postId: string;
  postAuthorId?: string;
  initialCount: number;
  currentUserId?: string;
}

export function LikeButton({ postId, postAuthorId, initialCount, currentUserId }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const handleLike = async () => {
    if (!currentUserId) return;

    if (liked) {
      setLiked(false);
      setCount((c) => c - 1);
      await supabase.from("likes").delete().match({ user_id: currentUserId, post_id: postId });
    } else {
      setLiked(true);
      setCount((c) => c + 1);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 300);
      await supabase.from("likes").insert({ user_id: currentUserId, post_id: postId });
      if (postAuthorId && postAuthorId !== currentUserId) {
        createNotification(supabase, { userId: postAuthorId, actorId: currentUserId, postId, type: "like" });
      }
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={!currentUserId}
      className={`btn-ghost gap-1.5 text-xs ${liked ? "text-red-500" : ""}`}
      aria-label={liked ? "Unlike" : "Like"}
      aria-pressed={liked}
    >
      <svg
        className={`w-[18px] h-[18px] transition-transform ${animating ? "animate-heart-pop" : ""}`}
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={liked ? 0 : 1.5}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
      <span className="font-medium">{count || ""}</span>
    </button>
  );
}
