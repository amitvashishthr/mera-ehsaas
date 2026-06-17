import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PostFeed } from "@/components/posts/PostFeed";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:author_id(id, username, full_name, avatar_url),
      categories:category_id(id, name, slug),
      likes(count),
      comments(count)
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-feed mx-auto">
      {/* Welcome for guests */}
      {!user && (
        <div className="poetry-card mb-12 max-w-xl mx-auto">
          <p className="font-serif text-2xl md:text-3xl text-primary-700 italic mb-5 leading-relaxed">
            &ldquo;The soul that sees beauty may sometimes walk alone.&rdquo;
          </p>
          <p className="text-sm text-primary-400 mb-6">A quiet space for poetry, emotions, and stories.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login" className="btn-primary">Sign In</Link>
            <Link href="/signup" className="btn-outline">Create Account</Link>
          </div>
        </div>
      )}

      {/* Post feed with infinite scroll */}
      {posts && posts.length > 0 ? (
        <PostFeed initialPosts={posts} currentUserId={user?.id} />
      ) : (
        <div className="text-center py-24">
          <p className="font-serif text-2xl text-primary-300 italic mb-3">
            The page is blank...
          </p>
          <p className="text-primary-400 text-sm">
            Be the first to fill it with your words.
          </p>
          {user && (
            <Link href="/posts/create" className="btn-primary mt-6 inline-block">
              Start Writing
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
