import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { WriterProfile } from "@/components/users/WriterProfile";
import { PostCard } from "@/components/posts/PostCard";

interface Props { params: Promise<{ username: string }>; }

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

  const [postsRes, followerRes, followingRes, likesRes] = await Promise.all([
    supabase.from("posts").select("*, profiles:author_id(id, username, full_name, avatar_url), categories:category_id(id, name, slug), likes(count), comments(count)")
      .eq("author_id", profile.id).eq("status", "published").eq("is_published", true).order("created_at", { ascending: false }),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profile.id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile.id),
    supabase.from("likes").select("id, posts!inner(author_id)").eq("posts.author_id", profile.id),
  ]);

  const posts = postsRes.data || [];
  const followerCount = followerRes.count || 0;
  const followingCount = followingRes.count || 0;
  const totalLikes = likesRes.data?.length || 0;

  return (
    <div className="max-w-feed mx-auto px-4 sm:px-6">
      <WriterProfile
        profile={profile}
        currentUserId={user?.id}
        followerCount={followerCount}
        followingCount={followingCount}
        postCount={posts.length}
        totalLikes={totalLikes}
      />

      {/* Posts */}
      <div className="mt-8">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user?.id} />)
        ) : (
          <p className="text-center text-neutral-400 dark:text-neutral-500 text-sm py-12">No posts yet.</p>
        )}
      </div>
    </div>
  );
}
