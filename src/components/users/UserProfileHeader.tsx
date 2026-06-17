"use client";

import { useState } from "react";
import Link from "next/link";
import { FollowButton } from "./FollowButton";

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

interface UserProfileHeaderProps {
  profile: Profile;
  currentUserId?: string;
  initialFollowerCount: number;
  followingCount: number;
  postCount: number;
  totalLikes?: number;
}

export function UserProfileHeader({
  profile,
  currentUserId,
  initialFollowerCount,
  followingCount,
  postCount,
  totalLikes = 0,
}: UserProfileHeaderProps) {
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);

  const handleFollowChange = (delta: number) => {
    setFollowerCount((prev) => Math.max(0, prev + delta));
  };

  const joinDate = new Date(profile.created_at).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="card mb-10">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="shrink-0">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-warm-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-200 to-warm-300 flex items-center justify-center text-primary-700 text-3xl font-serif font-bold ring-4 ring-warm-100">
              {profile.full_name?.[0] || profile.username[0]}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-primary-900">
                {profile.full_name || profile.username}
              </h1>
              <p className="text-primary-400 text-sm mt-0.5">@{profile.username}</p>
            </div>
            {currentUserId && currentUserId !== profile.id && (
              <FollowButton
                targetUserId={profile.id}
                currentUserId={currentUserId}
                onFollowChange={handleFollowChange}
              />
            )}
          </div>

          {profile.bio && (
            <p className="mt-4 text-primary-600 leading-relaxed text-sm max-w-lg">
              {profile.bio}
            </p>
          )}

          {/* Stats — clickable followers/following */}
          <div className="flex gap-5 mt-5 text-sm text-primary-500 justify-center sm:justify-start flex-wrap">
            <Link
              href={`/user/${profile.username}/followers`}
              className="hover:text-primary-800 transition-colors"
            >
              <strong className="text-primary-800 font-semibold">{followerCount}</strong> followers
            </Link>
            <Link
              href={`/user/${profile.username}/following`}
              className="hover:text-primary-800 transition-colors"
            >
              <strong className="text-primary-800 font-semibold">{followingCount}</strong> following
            </Link>
            <span>
              <strong className="text-primary-800 font-semibold">{postCount}</strong> posts
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              <strong className="text-primary-800 font-semibold">{totalLikes}</strong> likes
            </span>
          </div>

          {/* Join date */}
          <p className="text-xs text-primary-300 mt-3 flex items-center gap-1 justify-center sm:justify-start">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            Joined {joinDate}
          </p>
        </div>
      </div>
    </div>
  );
}
