"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

interface ProfileData {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

interface Stats {
  totalPosts: number;
  totalLikes: number;
  totalCollections: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<Stats>({ totalPosts: 0, totalLikes: 0, totalCollections: 0 });
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch profile
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!data) {
        router.push("/login");
        return;
      }

      setProfile(data);
      setFullName(data.full_name || "");
      setUsername(data.username || "");
      setBio(data.bio || "");
      setAvatarUrl(data.avatar_url || null);

      // Fetch stats in parallel
      const [postsRes, likesRes, collectionsRes] = await Promise.all([
        supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("author_id", user.id),
        supabase
          .from("likes")
          .select("id, posts!inner(author_id)")
          .eq("posts.author_id", user.id),
        supabase
          .from("collections")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      setStats({
        totalPosts: postsRes.count || 0,
        totalLikes: likesRes.data?.length || 0,
        totalCollections: collectionsRes.count || 0,
      });

      setLoading(false);
    }

    fetchProfile();
  }, [supabase, router]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must be under 2MB", "error");
      return;
    }

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${profile.id}/${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      showToast("Upload failed: " + uploadError.message, "error");
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", profile.id);

    if (updateError) {
      showToast("Failed to update avatar", "error");
    } else {
      setAvatarUrl(publicUrl);
      showToast("Avatar updated", "success");
    }

    setUploading(false);
  };

  const handleRemoveAvatar = async () => {
    if (!profile || !avatarUrl) return;
    if (!confirm("Remove your profile picture?")) return;
    setUploading(true);

    // Extract file path from the public URL
    const urlParts = avatarUrl.split("/storage/v1/object/public/avatars/");
    if (urlParts[1]) {
      await supabase.storage.from("avatars").remove([urlParts[1]]);
    }

    // Clear avatar_url in profile
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", profile.id);

    if (error) {
      showToast("Failed to remove avatar", "error");
    } else {
      setAvatarUrl(null);
      showToast("Avatar removed", "success");
    }
    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim() || null,
        username: username.trim(),
        bio: bio.trim() || null,
      })
      .eq("id", profile.id);

    if (error) {
      if (error.code === "23505") {
        showToast("Username already taken", "error");
      } else {
        showToast(error.message, "error");
      }
    } else {
      showToast("Profile saved", "success");
    }

    setSaving(false);
  };

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "";

  if (loading) {
    return (
      <div className="max-w-feed mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-warm-200 rounded-lg" />
          <div className="card space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-warm-200" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-warm-200 rounded w-40" />
                <div className="h-3 bg-warm-100 rounded w-24" />
              </div>
            </div>
            <div className="h-10 bg-warm-100 rounded-xl" />
            <div className="h-10 bg-warm-100 rounded-xl" />
            <div className="h-24 bg-warm-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-feed mx-auto">
      <h1 className="font-serif text-2xl md:text-3xl font-semibold text-primary-900 mb-8">
        My Profile
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form — 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Avatar + name section */}
          <div className="card">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
              {/* Avatar upload */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-warm-100 bg-gradient-to-br from-primary-200 to-warm-300">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary-700 font-serif font-bold text-3xl">
                      {fullName?.[0] || username?.[0] || "U"}
                    </div>
                  )}
                </div>
                {/* Upload overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  {uploading ? (
                    <svg className="w-6 h-6 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                    </svg>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                {/* Remove avatar button */}
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={uploading}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm"
                    aria-label="Remove avatar"
                    title="Remove avatar"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Quick info */}
              <div className="text-center sm:text-left">
                <h2 className="font-serif text-xl font-semibold text-primary-900">
                  {fullName || username}
                </h2>
                <p className="text-sm text-primary-400 mt-0.5">@{username}</p>
                <p className="text-xs text-primary-300 mt-2 flex items-center gap-1 justify-center sm:justify-start">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  Joined {joinDate}
                </p>
              </div>
            </div>

            {/* Edit form */}
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-primary-700 mb-1.5">
                  Display Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-primary-700 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 text-sm">@</span>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    className="input-field pl-8"
                    placeholder="username"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-primary-700 mb-1.5">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input-field min-h-[120px] resize-y"
                  placeholder="Tell the world a bit about yourself..."
                  maxLength={300}
                />
                <p className="text-xs text-primary-300 mt-1.5 text-right">{bio.length}/300</p>
              </div>

              <button type="submit" className="btn-primary w-full" disabled={saving}>
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Stats sidebar — 1 col */}
        <div className="space-y-6">
          {/* Statistics card */}
          <div className="card">
            <h3 className="font-serif text-base font-semibold text-primary-800 mb-5">
              Statistics
            </h3>
            <div className="space-y-4">
              <StatRow
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                  </svg>
                }
                label="Posts"
                value={stats.totalPosts}
              />
              <StatRow
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                }
                label="Likes Received"
                value={stats.totalLikes}
              />
              <StatRow
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                  </svg>
                }
                label="Collections"
                value={stats.totalCollections}
              />
            </div>
          </div>

          {/* Quick links */}
          <div className="card">
            <h3 className="font-serif text-base font-semibold text-primary-800 mb-4">
              Quick Links
            </h3>
            <div className="space-y-2">
              <a
                href={`/user/${username}`}
                className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 transition-colors py-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                View public profile
              </a>
              <a
                href="/collections"
                className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 transition-colors py-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                </svg>
                My collections
              </a>
              <a
                href="/print-request"
                className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 transition-colors py-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 .708a.75.75 0 0 1-.048.058l-2.894 2.894a.75.75 0 0 1-.53.22H9.582a.75.75 0 0 1-.53-.22L6.16 18.766a.75.75 0 0 1-.048-.058L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                </svg>
                Print requests
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-warm-100 flex items-center justify-center text-primary-500 shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-primary-400">{label}</p>
        <p className="text-lg font-semibold text-primary-800">{value}</p>
      </div>
    </div>
  );
}
