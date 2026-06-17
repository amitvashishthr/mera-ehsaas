"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserListItem } from "@/components/users/UserListItem";
import Link from "next/link";

interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export default function FollowersPage() {
  const { username } = useParams<{ username: string }>();
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [profileName, setProfileName] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchData() {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);

      // Get target profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, full_name")
        .eq("username", username)
        .single();

      if (!profile) {
        setLoading(false);
        return;
      }

      setProfileName(profile.full_name || profile.username);

      // Get followers (people who follow this user)
      const { data: followRows } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", profile.id)
        .order("created_at", { ascending: false });

      if (!followRows || followRows.length === 0) {
        setFollowers([]);
        setLoading(false);
        return;
      }

      const followerIds = followRows.map((r) => r.follower_id);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, bio")
        .in("id", followerIds);

      // Preserve order
      const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
      const ordered = followerIds.map((id) => profileMap.get(id)).filter(Boolean) as UserProfile[];

      setFollowers(ordered);
      setLoading(false);
    }

    fetchData();
  }, [username, supabase]);

  return (
    <div className="max-w-feed mx-auto">
      {/* Back link */}
      <Link
        href={`/user/${username}`}
        className="text-sm text-primary-400 hover:text-primary-600 transition-colors inline-flex items-center gap-1 mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to {profileName || username}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold text-primary-900">
          Followers
        </h1>
        <p className="text-sm text-primary-400 mt-1">
          People who follow @{username}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-warm-200">
        <span className="px-4 py-2.5 text-sm font-medium text-primary-800 border-b-2 border-primary-800">
          Followers
        </span>
        <Link
          href={`/user/${username}/following`}
          className="px-4 py-2.5 text-sm font-medium text-primary-400 hover:text-primary-600 transition-colors"
        >
          Following
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-warm-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-warm-200 rounded w-32" />
                <div className="h-3 bg-warm-100 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && followers.length === 0 && (
        <div className="text-center py-16">
          <svg className="w-12 h-12 mx-auto text-primary-200 mb-3" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
          <p className="font-serif text-lg text-primary-400 italic">
            No followers yet
          </p>
        </div>
      )}

      {/* User list */}
      {!loading && followers.length > 0 && (
        <div className="card !p-2">
          <div className="divide-y divide-warm-100">
            {followers.map((follower) => (
              <UserListItem
                key={follower.id}
                user={follower}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
