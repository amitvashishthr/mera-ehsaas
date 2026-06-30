"use client";

import { useState } from "react";
import Link from "next/link";
import { FollowButton } from "./FollowButton";

interface WriterProfileProps {
  profile: any;
  currentUserId?: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  totalLikes: number;
}

export function WriterProfile({ profile, currentUserId, followerCount: initFollowers, followingCount, postCount, totalLikes }: WriterProfileProps) {
  const [followers, setFollowers] = useState(initFollowers);
  const isOwn = currentUserId === profile.id;
  const joinDate = new Date(profile.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" });

  return (
    <div className="animate-fade-in">
      {/* Cover */}
      <div className="relative h-32 sm:h-44 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200 dark:from-neutral-800 dark:to-neutral-700 -mx-4 sm:-mx-6">
        {profile.cover_url && (
          <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Avatar + info */}
      <div className="relative px-1 -mt-12 sm:-mt-14">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white dark:border-surface-dark ring-1 ring-surface-border dark:ring-surface-dark-border" />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-brand-300 to-brand-500 border-4 border-white dark:border-surface-dark flex items-center justify-center text-white text-2xl font-display font-bold">
                {profile.full_name?.[0] || profile.username[0]}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex-1 flex items-center justify-between sm:justify-end gap-2 sm:pb-2">
            {isOwn ? (
              <Link href="/profile" className="btn-outline text-xs">Edit profile</Link>
            ) : currentUserId ? (
              <FollowButton targetUserId={profile.id} currentUserId={currentUserId} onFollowChange={(d) => setFollowers((p) => Math.max(0, p + d))} />
            ) : null}
          </div>
        </div>

        {/* Name + bio */}
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {profile.pen_name || profile.full_name || profile.username}
            </h1>
            {profile.is_verified && (
              <svg className="w-4.5 h-4.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24" aria-label="Verified">
                <path d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" />
              </svg>
            )}
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">@{profile.username}</p>
          {profile.bio && <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-2 leading-relaxed max-w-lg">{profile.bio}</p>}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-neutral-500 dark:text-neutral-400">
            {profile.country && <span>📍 {profile.country}</span>}
            {profile.languages?.length > 0 && <span>🗣️ {profile.languages.join(", ")}</span>}
            <span>📅 Joined {joinDate}</span>
          </div>

          {/* Stats */}
          <div className="flex gap-5 mt-4 text-sm">
            <Link href={`/user/${profile.username}/followers`} className="hover:underline">
              <strong className="text-neutral-900 dark:text-white">{followers}</strong>{" "}
              <span className="text-neutral-500 dark:text-neutral-400">followers</span>
            </Link>
            <Link href={`/user/${profile.username}/following`} className="hover:underline">
              <strong className="text-neutral-900 dark:text-white">{followingCount}</strong>{" "}
              <span className="text-neutral-500 dark:text-neutral-400">following</span>
            </Link>
            <span>
              <strong className="text-neutral-900 dark:text-white">{postCount}</strong>{" "}
              <span className="text-neutral-500 dark:text-neutral-400">posts</span>
            </span>
            <span>
              <strong className="text-neutral-900 dark:text-white">{totalLikes}</strong>{" "}
              <span className="text-neutral-500 dark:text-neutral-400">likes</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
