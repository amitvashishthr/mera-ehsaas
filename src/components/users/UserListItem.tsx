"use client";

import Link from "next/link";
import { FollowButton } from "./FollowButton";

interface UserListItemProps {
  user: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  };
  currentUserId?: string;
}

export function UserListItem({ user, currentUserId }: UserListItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-warm-50 transition-colors group">
      {/* Avatar */}
      <Link href={`/user/${user.username}`} className="shrink-0">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.username}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-warm-100"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-200 to-warm-300 flex items-center justify-center text-primary-700 font-serif font-semibold ring-2 ring-warm-100">
            {user.full_name?.[0] || user.username[0]}
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/user/${user.username}`}
          className="font-semibold text-primary-800 hover:text-primary-600 transition-colors text-sm block truncate"
        >
          {user.full_name || user.username}
        </Link>
        <p className="text-xs text-primary-400 truncate">@{user.username}</p>
        {user.bio && (
          <p className="text-xs text-primary-500 mt-1 line-clamp-1">{user.bio}</p>
        )}
      </div>

      {/* Follow button */}
      {currentUserId && currentUserId !== user.id && (
        <div className="shrink-0">
          <FollowButton targetUserId={user.id} currentUserId={currentUserId} />
        </div>
      )}
    </div>
  );
}
