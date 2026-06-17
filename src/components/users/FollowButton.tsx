"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { createNotification } from "@/lib/notifications";

interface FollowButtonProps {
  targetUserId: string;
  currentUserId: string;
  /** Callback when follow state changes — passes +1 or -1 */
  onFollowChange?: (delta: number) => void;
}

export function FollowButton({ targetUserId, currentUserId, onFollowChange }: FollowButtonProps) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const checkFollowing = async () => {
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentUserId)
        .eq("following_id", targetUserId)
        .maybeSingle();
      setFollowing(!!data);
      setLoading(false);
    };
    checkFollowing();
  }, [currentUserId, targetUserId, supabase]);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);

    if (following) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .match({ follower_id: currentUserId, following_id: targetUserId });

      if (!error) {
        setFollowing(false);
        onFollowChange?.(-1);
      }
    } else {
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: currentUserId, following_id: targetUserId });

      if (!error) {
        setFollowing(true);
        onFollowChange?.(1);

        // Notify the user being followed
        createNotification(supabase, {
          userId: targetUserId,
          actorId: currentUserId,
          type: "follow",
        });
      }
    }
    setLoading(false);
  };

  // Never show follow button for yourself
  if (targetUserId === currentUserId) return null;

  return (
    <button
      onClick={handleToggle}
      className={`text-sm font-medium py-2.5 px-5 rounded-xl transition-all duration-200 min-w-[100px] ${
        following
          ? "bg-warm-200 text-primary-700 hover:bg-rose-100 hover:text-rose-600"
          : "bg-primary-800 text-white hover:bg-primary-900"
      }`}
      disabled={loading}
    >
      {loading ? (
        <svg className="w-4 h-4 mx-auto animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : following ? (
        "Following"
      ) : (
        "Follow"
      )}
    </button>
  );
}
