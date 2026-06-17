import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/posts/PostCard";
import { UserProfileHeader } from "@/components/users/UserProfileHeader";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:author_id(id, username, full_name, avatar_url),
      categories:category_id(id, name, slug),
      likes(count),
      comments(count)
    `)
    .eq("author_id", profile.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const { count: followerCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", profile.id);

  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profile.id);

  // Total likes received on all posts
  const { data: likesData } = await supabase
    .from("likes")
    .select("id, posts!inner(author_id)")
    .eq("posts.author_id", profile.id);

  const totalLikes = likesData?.length || 0;

  return (
    <div className="max-w-feed mx-auto">
      {/* Back link */}
      <Link href="/" className="text-sm text-primary-400 hover:text-primary-600 transition-colors inline-flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to feed
      </Link>

      {/* Profile header */}
      <UserProfileHeader
        profile={profile}
        currentUserId={user?.id}
        initialFollowerCount={followerCount || 0}
        followingCount={followingCount || 0}
        postCount={posts?.length || 0}
        totalLikes={totalLikes}
      />

      {/* User posts */}
      <div className="space-y-10">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={user?.id} />
        ))}
        {(!posts || posts.length === 0) && (
          <div className="text-center py-20">
            <p className="font-serif text-xl text-primary-300 italic">
              No words shared yet...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
