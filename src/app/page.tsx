import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PostFeed } from "@/components/posts/PostFeed";
import Link from "next/link";

/**
 * Home page — shows the post feed.
 * Protected by middleware: only authenticated users reach this page.
 */
export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
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
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="max-w-feed mx-auto">
      {posts && posts.length > 0 ? (
        <PostFeed initialPosts={posts} currentUserId={user?.id} />
      ) : (
        <div className="text-center py-24">
          <p className="font-serif text-2xl text-primary-300 dark:text-dark-400 italic mb-3">
            The page is blank...
          </p>
          <p className="text-primary-400 dark:text-dark-500 text-sm">
            Be the first to fill it with your words.
          </p>
          <Link href="/posts/create" className="btn-primary mt-6 inline-block">
            Start Writing
          </Link>
        </div>
      )}
    </div>
  );
}
